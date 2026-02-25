import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - PrismaAdapter type mismatch between next-auth v4 and @auth/prisma-adapter
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
  },
  providers: [
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET })]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        flow: { label: "Flow", type: "text" }, // "signIn" | "signUp"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (credentials.flow === "signUp") {
          // Registration
          if (!credentials.name) return null;

          const existing = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (existing) throw new Error("Email already in use");

          const hashed = await bcrypt.hash(credentials.password, 12);
          const user = await prisma.user.create({
            data: {
              name: credentials.name,
              email: credentials.email,
              password: hashed,
            },
          });
          return user;
        }

        // Sign-in
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = (user as { image?: string }).image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
};
