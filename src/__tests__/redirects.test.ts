import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  it("defines permanent redirects from old paths to /hub equivalents", async () => {
    const redirects =
      typeof nextConfig.redirects === "function"
        ? await nextConfig.redirects()
        : [];

    const sources = redirects.map((r) => r.source);
    expect(sources).toContain("/dashboard");
    expect(sources).toContain("/sign-in");
    expect(sources).toContain("/leaderboard");
    expect(sources).toContain("/prospects");
    expect(sources).toContain("/prospects/:path*");
    expect(sources).toContain("/champions");
    expect(sources).toContain("/geography/:path*");

    for (const redirect of redirects) {
      expect(redirect.permanent).toBe(true);
      expect(redirect.destination).toMatch(/^\/hub\//);
    }
  });

  it("does not redirect public intake routes", async () => {
    const redirects =
      typeof nextConfig.redirects === "function"
        ? await nextConfig.redirects()
        : [];

    const sources = redirects.map((r) => r.source);
    expect(sources).not.toContain("/privacy");
    expect(sources).not.toContain("/api/webhooks/clerk");
    expect(sources).not.toContain("/:geography");
  });
});
