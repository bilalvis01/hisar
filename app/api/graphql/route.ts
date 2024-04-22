import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Resolvers } from "../../../resolvers-types";
import { readFileSync } from 'fs';
import { PrismaClient } from "@prisma/client";

const resolvers: Resolvers = {
    Query: {
        async budgets(_, __, context) {
            const data = await context.dataSources.account.findMany({ 
                where: { type: "budget" },
                include: {
                    entries: true,
                }
            });
        
            return data.map((record) => {
                const budget = record.entries
                    .filter(val => val.direction == 1)
                    .reduce((acc, val) => acc + val.amount, BigInt(0));
                const expense = record.entries
                    .filter(val => val.direction == -1)
                    .reduce((acc, val) => acc + val.amount, BigInt(0));
                return {
                    name: record.name,
                    budget: Number(budget / BigInt(10000)),
                    expense: Number(expense / BigInt(10000)),
                    balance: Number(record.balance / BigInt(10000)),
                    cratedAt: record.createdAt.toISOString(),
                    updatedAt: record.updatedAt.toISOString(),
                }
            });
        }
    }
}

const typeDefs = readFileSync(process.cwd() + '/schema.graphql', 'utf8');

const server = new ApolloServer({ resolvers, typeDefs });

const handler = startServerAndCreateNextHandler(server, {
    context: async () => ({
        dataSources: new PrismaClient()
    })
});

export { handler as GET, handler as POST };