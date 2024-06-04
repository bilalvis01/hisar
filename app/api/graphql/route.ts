import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { readFileSync } from 'fs';
import { PrismaClient } from "@prisma/client";
import { RECORD_NOT_FOUND, DATABASE_ERROR } from "../../../lib/graphql/error-code";
import { RecordNotFoundError, DatabaseError } from "../../../lib/graphql/error";
import { unwrapResolverError } from "@apollo/server/errors";
import { resolvers } from "../../../lib/graphql/resolvers";
import { 
    MoneyResolver, 
    DateTimeResolver, 
    DateTimeTypeDefinition, 
} from "../../../lib/graphql/custom-scalars";

const typeDefs = readFileSync(process.cwd() + '/schema.graphql', 'utf8');

const server = new ApolloServer({ 
    resolvers: {
        DateTime: DateTimeResolver,
        Money: MoneyResolver,
        ...resolvers
    }, 
    typeDefs: [
        DateTimeTypeDefinition,
        typeDefs,
    ],
    formatError(formattedError, error) {
        const originalError = unwrapResolverError(error);

        if (originalError instanceof RecordNotFoundError) {
            return {
                ...formattedError,
                message: originalError.message,
                extensions: {
                    code: RECORD_NOT_FOUND,
                }
            };
        }

        if (originalError instanceof DatabaseError) {
            return {
                ...formattedError,
                message: originalError.message,
                extensions: {
                    code: DATABASE_ERROR,
                }
            };
        }
    },
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const handler = startServerAndCreateNextHandler(server, {
    context: async () => ({
        dataSources: new PrismaClient()
    })
});

export { handler as GET, handler as POST };