
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: "./schema.graphql",
  documents: [
    "lib/**/*.(tsx|ts)",
    "app/**/*.(tsx|ts)",
  ],
  generates: {
    './lib/graphql/resolvers-types.ts': {
      config: {
        contextType: "./context#Context",
        scalars: {
          DateTime: "Date",
          Money: "bigint"
        }
      },
      plugins: ['typescript', 'typescript-resolvers']
    },
    './lib/graphql/generated/': {
      config: {
        scalars: {
          DateTime: "string",
          Money: "number"
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
