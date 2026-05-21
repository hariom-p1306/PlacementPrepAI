import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/interview(.*)",
  "/resume(.*)",
  "/roadmap(.*)",
  "/mentor(.*)",
  "/cover-letter(.*)",

]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      return Response.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};