import { describe, expect, it } from "vitest";
import { parseAuthEnv, parsePublicEnv } from "@/lib/env/schema";

describe("parsePublicEnv", () => {
  it("accepts a valid public app URL", () => {
    const result = parsePublicEnv({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    });

    expect(result.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("rejects an invalid public app URL", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_APP_URL: "not-a-url",
      }),
    ).toThrow();
  });
});

describe("parseAuthEnv", () => {
  const validGitHubEnv = {
    AUTH_SECRET: "a".repeat(32),
    AUTH_URL: "http://localhost:3000",
    AUTH_GITHUB_ID: "github-client-id",
    AUTH_GITHUB_SECRET: "github-client-secret",
  };

  it("accepts GitHub-only configuration for the first auth rollout", () => {
    const result = parseAuthEnv(validGitHubEnv);

    expect(result.AUTH_GITHUB_ID).toBe("github-client-id");
    expect(result.AUTH_EMAIL_ENABLED).toBe("false");
    expect(result.AUTH_GOOGLE_ID).toBeUndefined();
  });

  it("requires both Google ID and secret when either is present", () => {
    expect(() =>
      parseAuthEnv({
        ...validGitHubEnv,
        AUTH_GOOGLE_ID: "google-client-id",
      }),
    ).toThrow();
  });

  it("accepts Google credentials when both values are provided", () => {
    const result = parseAuthEnv({
      ...validGitHubEnv,
      AUTH_GOOGLE_ID: "google-client-id",
      AUTH_GOOGLE_SECRET: "google-client-secret",
      AUTH_EMAIL_ENABLED: "true",
    });

    expect(result.AUTH_GOOGLE_ID).toBe("google-client-id");
    expect(result.AUTH_EMAIL_ENABLED).toBe("true");
  });
});
