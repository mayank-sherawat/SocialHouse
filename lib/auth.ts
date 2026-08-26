import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT } from "@/lib/constants";

/**
 * Central NextAuth configuration.
 *
 * Kept in `lib/` (not inside the route handler) so it can be imported by
 * `getServerSession(authOptions)` everywhere without pulling a route module —
 * route files should export only HTTP handlers.
 */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Normalize email so lookups are case-insensitive and consistent
        // with how accounts are stored at signup.
        const email = credentials.email.trim().toLowerCase();

        // Rate limit login attempts per email
        const limit = await checkRateLimit(
          `login:${email}`,
          RATE_LIMIT.LOGIN_EMAIL.limit,
          RATE_LIMIT.LOGIN_EMAIL.windowMs
        );
        if (!limit.success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, username: user.username };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      if (trigger === "update" && session?.username) {
        token.username = session.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
      };
      return session;
    },
  },
};
