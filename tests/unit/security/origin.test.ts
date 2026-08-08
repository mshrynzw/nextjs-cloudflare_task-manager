import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { assertSameOriginMutation } from "@/lib/security/origin";

function request(
  method: string,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost:3000/api/v1/projects", {
    method,
    headers,
  });
}

describe("assertSameOriginMutation", () => {
  it("allows safe methods without origin checks", () => {
    expect(() => assertSameOriginMutation(request("GET"))).not.toThrow();
  });

  it("allows same-origin fetch site", () => {
    expect(() =>
      assertSameOriginMutation(
        request("POST", { "sec-fetch-site": "same-origin" }),
      ),
    ).not.toThrow();
  });

  it("allows allowlisted Origin", () => {
    expect(() =>
      assertSameOriginMutation(
        request("POST", { origin: "http://localhost:3000" }),
      ),
    ).not.toThrow();
  });

  it("rejects disallowed Origin", () => {
    expect(() =>
      assertSameOriginMutation(
        request("POST", { origin: "https://evil.example" }),
      ),
    ).toThrow(ApiError);
  });

  it("allows mutations without Origin (non-browser clients)", () => {
    expect(() => assertSameOriginMutation(request("POST"))).not.toThrow();
  });
});
