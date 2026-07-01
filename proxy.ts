import { withAuth } from "next-auth/middleware";

/**
 * Route protection at the edge (Next 16 "proxy" convention, formerly
 * "middleware"). Unauthenticated requests to the matched paths are redirected
 * to `/login` before the page renders.
 */
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/feed/:path*", "/profile/:path*", "/settings/:path*", "/search/:path*"],
};
