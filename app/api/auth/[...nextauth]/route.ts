import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/database/client";
import { PrismaAdapter } from "../../../../lib/auth/adapter";
import bcrypt from "bcryptjs";

import type { AuthOptions } from "next-auth";
import type { NextApiHandler } from "next";
import type { Adapter } from "next-auth/adapters";

const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials.username || !credentials.password) {
                    throw Error("Please enter username and password!");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        username: credentials.username
                    }
                });

                if (!user || !user.password) {
                    throw Error("No user found");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                console.log(isPasswordValid);
                
                if (!isPasswordValid) {
                    throw Error("Password is invalid");
                }

                return user;
            }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
};

const handlers = NextAuth(authOptions);

export { handlers as GET, handlers as POST };

