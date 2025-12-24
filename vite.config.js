import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

export default defineConfig({
  plugins: [
    tailwindcss(),
    ViteMinifyPlugin({
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
      sortAttributes: true,
      sortClassName: true,
    }),
  ],
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
