import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'demo/',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/demo.ts',
        'vite.config.ts',
        'vitest.config.ts',
      ],
    },
  },
});
