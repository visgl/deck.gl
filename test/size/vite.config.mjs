import {defineConfig} from 'vite';
import {analyzer} from 'vite-bundle-analyzer';

/** https://vitejs.dev/config/ */
export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './import-all.ts',
        name: 'deck',
        fileName: 'dist.min.js',
        formats: ['iife']
      }
    },
    plugins: [
      analyzer({
        analyzerMode: 'json'
      })
    ]
  };
});
