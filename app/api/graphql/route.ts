import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { readFileSync } from 'fs';
import { PrismaClient } from "@prisma/client";
import { 
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
    PrismaClientRustPanicError,
    PrismaClientInitializationError,
    PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { RECORD_NOT_FOUND, INTERNAL_SERVER_ERROR } from "../../../lib/graphql/error-code";
import { RecordNotFoundError } from "../../../lib/graphql/error";
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

        if (
            originalError instanceof PrismaClientKnownRequestError ||
            originalError instanceof PrismaClientUnknownRequestError ||
            originalError instanceof PrismaClientRustPanicError ||
            originalError instanceof PrismaClientInitializationError ||
            originalError instanceof PrismaClientValidationError
        ) {
            return {
                ...formattedError,
                message: "Internal Server Error",
                extensions: {
                    code: INTERNAL_SERVER_ERROR,
                }
            };
        }

        return formattedError
    },
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const handler = startServerAndCreateNextHandler(server, {
    context: async () => ({
        dataSources: new PrismaClient()
    })
});

export { handler as GET, handler as POST };