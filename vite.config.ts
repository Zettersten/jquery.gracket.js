import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command, mode }) => {
  const isLibMode = mode === 'production' && command === 'build';
  
  return {
    plugins: [
      react(),
      vue(),
      ...(isLibMode ? [
        dts({
          include: ['src/**/*.ts', 'src/**/*.tsx'],
          exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/demo.ts'],
        }),
      ] : []),
    ],
    root: command === 'serve' ? 'demo' : undefined,
    build: isLibMode ? {
      lib: {
        entry: {
          gracket: resolve(__dirname, 'src/index.ts'),
          react: resolve(__dirname, 'src/adapters/react.tsx'),
          vue: resolve(__dirname, 'src/adapters/vue.ts'),
        },
        name: 'Gracket',
        formats: ['es', 'umd'],
        fileName: (format, entryName) => 
          format === 'es' ? `${entryName}.js` : `${entryName}.umd.cjs`,
      },
      rollupOptions: {
        external: ['react', 'react/jsx-runtime', 'vue'],
        output: {
          globals: {
            react: 'React',
            'react/jsx-runtime': 'jsxRuntime',
            vue: 'Vue',
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'style.css';
            return assetInfo.name || '';
          },
        },
      },
      sourcemap: true,
      minify: 'terser',
      outDir: 'dist',
    } : {
      outDir: '../dist-demo',
      emptyOutDir: true,
    },
  };
});
