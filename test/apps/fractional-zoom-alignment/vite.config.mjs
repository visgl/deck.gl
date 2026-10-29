import {defineConfig} from 'vite';

export default defineConfig({
  define: {
    'process.env.MapboxAccessToken': JSON.stringify(process.env.MapboxAccessToken)
  },
  server: {
    open: true,
    port: 8080
  }
});
