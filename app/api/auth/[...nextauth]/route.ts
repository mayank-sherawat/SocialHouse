import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Route files should export only handlers — the config lives in `lib/auth.ts`.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
