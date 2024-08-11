"use client";

import React from "react";
import { 
    ApolloClient, 
    InMemoryCache, 
    ApolloProvider as ApolloProviderBase, 
} from '@apollo/client';

const client = new ApolloClient({
    uri: "/api/graphql",
    cache: new InMemoryCache({
        typePolicies: {
            Budget: {
                keyFields: ["code"],
            },
        },
    }),
});

export default function ApolloProvider({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProviderBase client={client}>
            {children}
        </ApolloProviderBase>
    );
}