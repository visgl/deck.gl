import {defineConfig} from 'vite';
import {resolve} from 'path';

const ROOT = resolve(__dirname, '../..');

export default defineConfig({
  resolve: {
    alias: {
      '@deck.gl/core': resolve(ROOT, 'modules/core/src'),
      '@deck.gl/layers': resolve(ROOT, 'modules/layers/src'),
      '@deck.gl/extensions': resolve(ROOT, 'modules/extensions/src')
    }
  },
  server: {
    open: true
  }
});
