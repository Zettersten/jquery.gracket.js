import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command, mode }) => {
  // Library build mode - builds the actual library
  const isLibBuild = process.env.BUILD_TARGET === 'lib';
  
  // Demo build mode - builds the demo site
  const isDemoBuild = process.env.BUILD_TARGET === 'demo' || command === 'serve';
  
  // Default dev server configuration
  if (command === 'serve') {
    return {
      plugins: [],
      root: 'demo',
      publicDir: false,
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
    };
  }
  
  // Build configurations
  return {
    plugins: [
      react(),
      vue(),
      ...(isLibBuild ? [
        dts({
          include: ['src/**/*.ts', 'src/**/*.tsx'],
          exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/demo.ts'],
        }),
      ] : []),
    ],
    root: isDemoBuild ? 'demo' : undefined,
    publicDir: false,
    resolve: isDemoBuild ? {
      alias: {
        'gracket': resolve(__dirname, 'src/index.ts'),
      },
    } : undefined,
    build: isLibBuild ? {
      // Library build configuration
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
      // Demo build configuration
      outDir: resolve(__dirname, 'dist-demo'),
      emptyOutDir: true,
      sourcemap: true,
    },
  };
});
