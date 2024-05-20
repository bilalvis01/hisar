
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: "./schema.graphql",
  documents: [
    "lib/**/*.(tsx|ts)",
    "app/**/*.(tsx|ts)",
  ],
  generates: {
    './lib/resolvers-types.ts': {
      config: {
        contextType: "./graphql-context#Context",
        scalars: {
          DateTime: "Date",
        }
      },
      plugins: ['typescript', 'typescript-resolvers']
    },
    './lib/graphql-tag/': {
      config: {
        scalars: {
          DateTime: "string",
        }
      },
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
