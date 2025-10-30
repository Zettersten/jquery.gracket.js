import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import solid from 'vite-plugin-solid';
import { svelte } from '@sveltejs/vite-plugin-svelte';
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
      root: resolve(__dirname),
      publicDir: false,
    };
  }
  
  // Build configurations
  return {
    plugins: [
      react(),
      vue(),
      solid(),
      svelte({
        compilerOptions: {
          dev: false,
        },
      }),
      ...(isLibBuild ? [
        dts({
          include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.svelte'],
          exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/demo.ts'],
        }),
      ] : []),
    ],
    root: isDemoBuild ? 'demo' : undefined,
    publicDir: false,
    resolve: isDemoBuild ? {
      alias: {
        'gracket': resolve(__dirname, 'src/index.ts'),
        '/src': resolve(__dirname, 'src'),
      },
    } : undefined,
    build: isLibBuild ? {
      // Library build configuration
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          'adapters/react': resolve(__dirname, 'src/adapters/react.tsx'),
          'adapters/vue': resolve(__dirname, 'src/adapters/vue.ts'),
          'adapters/angular': resolve(__dirname, 'src/adapters/angular.ts'),
          'adapters/solid': resolve(__dirname, 'src/adapters/solid.tsx'),
          'adapters/svelte': resolve(__dirname, 'src/adapters/svelte.ts'),
          'adapters/webcomponent': resolve(__dirname, 'src/adapters/webcomponent.ts'),
        },
        name: 'Gracket',
        formats: ['es'],
      },
      rollupOptions: {
        external: [
          'react',
          'react/jsx-runtime',
          'react-dom',
          'vue',
          '@angular/core',
          'solid-js',
          'solid-js/web',
          'svelte',
          'svelte/internal',
        ],
        output: {
          globals: {
            react: 'React',
            'react/jsx-runtime': 'jsxRuntime',
            'react-dom': 'ReactDOM',
            vue: 'Vue',
            '@angular/core': 'ng.core',
            'solid-js': 'Solid',
            'solid-js/web': 'SolidWeb',
            svelte: 'Svelte',
            'svelte/internal': 'SvelteInternal',
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
    base: isDemoBuild ? '/jquery.gracket.js/' : undefined,
  };
});
