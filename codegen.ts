
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
          DateTimeIso: "Date",
        }
      },
      plugins: ['typescript', 'typescript-resolvers']
    },
    './lib/graphql-tag/': {
      config: {
        scalars: {
          DateTimeIso: "Date",
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
