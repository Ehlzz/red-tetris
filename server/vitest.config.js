import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'unitTest/',
        '**/*.test.js',
        'server.js'
      ],
      thresholds: {
        statements: 70,
        functions: 68,
        lines: 70,
        branches: 58
      }
    }
  }
});