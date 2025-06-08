import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
// import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";


declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      password?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {},
    //   async authorize(credentials) {
    //     const { email, password } = credentials as {
    //       email: string;
    //       password: string;
    //     };

    //     if (!email || !password) {
    //       throw new Error("Missing username or password");
    //     }

    //     const user = await prisma.user.findUnique({
    //       where: {
    //         email,
    //       },
    //     });

    //     if (!user || !user.password || !(await compare(password, user.password))) {
    //       if (password === user?.password) {
    //         return user;
    //       }
    //       throw new Error("Invalid username or password");
    //     }

    //     return user;
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_AUTH_ID!,
      clientSecret: process.env.FACEBOOK_AUTH_SECRET!,
    })
  ],
  // callbacks: {
  //   session: async ({ session, user }) => {
  //     if (session?.user) {
  //       session.user.id = user.id;
  //     }
  //     return session;
  //   },
  // },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token,  }) {
      session.user = token;
      return session;
    },
  },
};