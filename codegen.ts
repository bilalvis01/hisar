
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: "./schema.graphql",
  documents: [
    "templates/**/*.tsx", 
    "app/**/*.tsx", 
    "app/**/*.ts"
  ],
  generates: {
    './lib/resolvers-types.ts': {
      config: {
        contextType: "./context#Context",
      },
      plugins: ['typescript', 'typescript-resolvers']
    },
    './lib/graphql-tag/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;
