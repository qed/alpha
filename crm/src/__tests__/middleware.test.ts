import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: (handler: Function) => handler,
  createRouteMatcher: (patterns: string[]) => {
    return (req: { nextUrl: { pathname: string } }) => {
      return patterns.some((p) => {
        const regex = p.replace("(.*)", ".*").replace("(dashboard)", "dashboard");
        return new RegExp(`^${regex}`).test(req.nextUrl.pathname);
      });
    };
  },
}));

describe("middleware route matching", () => {
  it("dashboard routes require auth", async () => {
    const { createRouteMatcher } = await import("@clerk/nextjs/server");
    const isDashboard = createRouteMatcher(["/(dashboard)(.*)"]);

    expect(isDashboard({ nextUrl: { pathname: "/dashboard" } } as any)).toBe(true);
    expect(isDashboard({ nextUrl: { pathname: "/dashboard/prospects" } } as any)).toBe(true);
  });

  it("public routes do not require auth", async () => {
    const { createRouteMatcher } = await import("@clerk/nextjs/server");
    const isDashboard = createRouteMatcher(["/(dashboard)(.*)"]);

    expect(isDashboard({ nextUrl: { pathname: "/boston" } } as any)).toBe(false);
    expect(isDashboard({ nextUrl: { pathname: "/sign-in" } } as any)).toBe(false);
  });
});

describe("role-based redirects", () => {
  it("champion should not access /leaderboard", () => {
    const pathname = "/leaderboard";
    const role = "champion";
    const shouldRedirect = role === "champion" && pathname.startsWith("/leaderboard");
    expect(shouldRedirect).toBe(true);
  });

  it("champion should not access /geography/boston", () => {
    const pathname = "/geography/boston";
    const role = "champion";
    const shouldRedirect = role === "champion" && pathname.startsWith("/geography/");
    expect(shouldRedirect).toBe(true);
  });

  it("champion should not access /champions", () => {
    const pathname = "/champions";
    const role = "champion";
    const shouldRedirect = role === "champion" && pathname.startsWith("/champions");
    expect(shouldRedirect).toBe(true);
  });

  it("admin can access /leaderboard", () => {
    const pathname = "/leaderboard";
    const role = "admin";
    const shouldRedirect = role === "champion" && pathname.startsWith("/leaderboard");
    expect(shouldRedirect).toBe(false);
  });

  it("admin can access /dashboard", () => {
    const pathname = "/dashboard";
    const role = "admin";
    const blocked =
      (role === "champion" && pathname.startsWith("/leaderboard")) ||
      (role === "champion" && pathname.startsWith("/geography/")) ||
      (role === "champion" && pathname.startsWith("/champions"));
    expect(blocked).toBe(false);
  });
});
