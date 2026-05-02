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
    expect(sources).toContain("/hub/prospects");
    expect(sources).toContain("/champions");
    expect(sources).toContain("/geography/:path*");

    for (const redirect of redirects) {
      expect(redirect.permanent).toBe(true);
      expect(redirect.destination).toMatch(/^\/hub\//);
    }
  });

  it("redirects /prospects and /hub/prospects to /hub/pipeline", async () => {
    const redirects =
      typeof nextConfig.redirects === "function"
        ? await nextConfig.redirects()
        : [];

    const prospectsRedirect = redirects.find((r) => r.source === "/prospects");
    expect(prospectsRedirect?.destination).toBe("/hub/pipeline");

    const hubProspectsRedirect = redirects.find((r) => r.source === "/hub/prospects");
    expect(hubProspectsRedirect?.destination).toBe("/hub/pipeline");
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
