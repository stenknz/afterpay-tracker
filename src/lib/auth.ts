import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { prisma } = await import("./prisma");
        const { compare } = await import("bcryptjs");
        const email = credentials.email as string;
        const password = credentials.password as string;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const valid = await compare(password, user.hashedPassword);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, avatarPath: user.avatarPath };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.avatarPath = (user as { avatarPath?: string | null }).avatarPath;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { avatarPath?: string | null }).avatarPath = token.avatarPath as string | undefined;
      }
      return session;
    },
  },
});
