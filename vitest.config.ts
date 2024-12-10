/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportOnFailure: true,
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/tests/**/*'],
    },
  },
});
