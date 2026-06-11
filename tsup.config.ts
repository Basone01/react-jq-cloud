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
  // Self-contained web component build — the React imports are aliased to
  // preact/compat and bundled in (~80% smaller than bundling React), so the
  // host page needs no framework. ESM for `import`, IIFE for plain <script>
  // tags (exposed as window.ReactJQCloudWC).
  {
    entry: { 'web-component': 'src/web-component.ts' },
    format: ['esm', 'iife'],
    globalName: 'ReactJQCloudWC',
    dts: true,
    sourcemap: true,
    minify: true,
    noExternal: [/^react(-dom)?(\/|$)/, /^preact(\/|$)/],
    define: { 'process.env.NODE_ENV': '"production"' },
    esbuildOptions(options) {
      options.jsx = 'automatic';
      options.alias = {
        'react': 'preact/compat',
        'react-dom/client': 'preact/compat/client',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      };
    },
  },
]);
