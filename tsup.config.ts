import { defineConfig } from 'tsup';

export default defineConfig([
  // Library build — React stays external (peer dependency).
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Self-contained web component build — React is bundled in so the host
  // page needs no framework. ESM for `import`, IIFE for plain <script> tags
  // (exposed as window.ReactJQCloudWC).
  {
    entry: { 'web-component': 'src/web-component.ts' },
    format: ['esm', 'iife'],
    globalName: 'ReactJQCloudWC',
    dts: true,
    sourcemap: true,
    minify: true,
    noExternal: ['react', 'react-dom', 'react/jsx-runtime', 'scheduler'],
    define: { 'process.env.NODE_ENV': '"production"' },
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
]);
