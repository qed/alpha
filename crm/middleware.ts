import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const isDashboardRoute = createRouteMatcher(["/(dashboard)(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    const { userId, sessionClaims } = await auth.protect();

    const role = sessionClaims?.role as string | undefined;
    const pathname = req.nextUrl.pathname;

    if (role === "champion" && pathname.startsWith("/leaderboard")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (role === "champion" && pathname.startsWith("/geography/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (role === "champion" && pathname.startsWith("/champions")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
