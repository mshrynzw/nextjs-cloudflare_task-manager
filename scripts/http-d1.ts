import fs from "node:fs";
import os from "node:os";
import path from "node:path";

interface D1HttpQueryResult {
  results?: Record<string, unknown>[];
  success?: boolean;
  meta?: D1Meta;
}

interface CloudflareD1Response {
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
  result?: D1HttpQueryResult[];
}

function resolveWranglerOauthToken(): string | undefined {
  const candidates = [
    path.join(
      process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"),
      "wrangler",
      "config",
      "default.toml",
    ),
    path.join(
      process.env.APPDATA ?? "",
      "xdg.config",
      ".wrangler",
      "config",
      "default.toml",
    ),
  ];

  for (const candidate of candidates) {
    if (!candidate || !fs.existsSync(candidate)) {
      continue;
    }
    const content = fs.readFileSync(candidate, "utf8");
    const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match?.[1]) {
      return match[1];
    }
  }

  return undefined;
}

export function resolveCloudflareApiToken(): string {
  const fromEnv = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const fromWrangler = resolveWranglerOauthToken();
  if (fromWrangler) {
    return fromWrangler;
  }

  throw new Error(
    "Missing Cloudflare credentials. Set CLOUDFLARE_API_TOKEN or run `wrangler login`.",
  );
}

class HttpD1PreparedStatement {
  readonly #accountId: string;
  readonly #databaseId: string;
  readonly #token: string;
  readonly #sql: string;
  readonly #params: unknown[];

  constructor(
    accountId: string,
    databaseId: string,
    token: string,
    sql: string,
    params: unknown[] = [],
  ) {
    this.#accountId = accountId;
    this.#databaseId = databaseId;
    this.#token = token;
    this.#sql = sql;
    this.#params = params;
  }

  bind(...params: unknown[]): HttpD1PreparedStatement {
    return new HttpD1PreparedStatement(
      this.#accountId,
      this.#databaseId,
      this.#token,
      this.#sql,
      params,
    );
  }

  async #query(): Promise<D1HttpQueryResult> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.#accountId}/d1/database/${this.#databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.#token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: this.#sql,
          params: this.#params,
        }),
      },
    );

    const payload = (await response.json()) as CloudflareD1Response;
    if (!response.ok || !payload.success || !payload.result?.[0]) {
      const message =
        payload.errors?.map((error) => error.message).join("; ") ||
        `D1 HTTP query failed (${response.status})`;
      throw new Error(`${message}\nSQL: ${this.#sql}`);
    }

    return payload.result[0];
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const result = await this.#query();
    return (result.results?.[0] as T | undefined) ?? null;
  }

  async run(): Promise<D1Result> {
    const result = await this.#query();
    return {
      success: true,
      meta: (result.meta ?? {}) as D1Result["meta"],
      results: result.results ?? [],
    };
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    const result = await this.#query();
    return {
      success: true,
      meta: (result.meta ?? {}) as D1Result["meta"],
      results: (result.results ?? []) as T[],
    };
  }

  async raw<T = unknown[]>(): Promise<T[]> {
    const result = await this.#query();
    return (result.results ?? []).map((row) =>
      Object.values(row),
    ) as T[];
  }
}

/**
 * Minimal D1Database shim backed by the Cloudflare D1 HTTP API.
 * Used by production seed scripts when getPlatformProxy remote hangs.
 */
export function createHttpD1Database(input: {
  accountId: string;
  databaseId: string;
  apiToken: string;
}): D1Database {
  const { accountId, databaseId, apiToken } = input;

  return {
    prepare(sql: string) {
      return new HttpD1PreparedStatement(
        accountId,
        databaseId,
        apiToken,
        sql,
      ) as unknown as D1PreparedStatement;
    },
    async batch<T extends D1PreparedStatement = D1PreparedStatement>(
      statements: T[],
    ): Promise<D1Result[]> {
      const results: D1Result[] = [];
      for (const statement of statements) {
        results.push(await (statement as unknown as HttpD1PreparedStatement).run());
      }
      return results;
    },
    async exec(query: string): Promise<D1ExecResult> {
      const statement = new HttpD1PreparedStatement(
        accountId,
        databaseId,
        apiToken,
        query,
      );
      await statement.run();
      return { count: 0, duration: 0 };
    },
    withSession() {
      throw new Error("D1 withSession is not supported by the HTTP seed client.");
    },
  } as unknown as D1Database;
}
