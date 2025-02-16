import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // Entry point of your library (adjust if needed)
      entry: resolve(__dirname, 'src/Diff.js'),
      // The name of your global variable when in UMD build mode
      name: 'HtmlDiff',
      // Output file name pattern – this will generate files like "htmldiff.umd.js", "htmldiff.es.js", etc.
      fileName: (format) => `htmldiff.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled into your library.
      // For example, if you want to keep "vitest" out or other libraries:
      external: [],
      output: {
        // Provide global variables for external dependencies in UMD build mode.
        globals: {}
      }
    }
  }
});
