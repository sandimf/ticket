import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const decoded = Buffer.from(payload, "base64").toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identity: { label: "Identity", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.identity || !credentials?.password) return null;

        // Call Go backend (through public API proxy) to get JWT token
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identity: credentials.identity,
            password: credentials.password,
          }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok || !json || json.status !== "success" || !json.data) {
          return null;
        }

        const token: string = json.data;
        const claims = decodeJwtPayload(token);
        if (!claims) return null;

        // Return user info; cookies for legacy proxies will be set client-side
        return {
          id: String(claims.user_id),
          name: String(claims.username),
          role: String(claims.role || "user"),
          accessToken: token,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = (user as any).name;
        token.sub = (user as any).id;
        (token as any).role = (user as any).role;
        (token as any).accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        (session.user as any).id = token.sub as string;
        (session.user as any).role = (token as any).role;
      }
      (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
});

export { handler as GET, handler as POST };