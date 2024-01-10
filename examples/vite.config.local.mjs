import {defineConfig} from 'vite';
import {getOcularConfig} from 'ocular-dev-tools';
import {join} from 'path';

const rootDir = join(__dirname, '..');

/** https://vitejs.dev/config/ */
export default defineConfig(async () => {
  const {aliases} = await getOcularConfig({root: rootDir});

  return {
    resolve: {
      alias: {
        ...aliases,
        // Use root dependencies
        '@luma.gl': join(rootDir, '../luma.gl/modules'),
        '@math.gl': join(rootDir, './node_modules/@math.gl'),
        '@loaders.gl/core': join(rootDir, './node_modules/@loaders.gl/core')
      }
    },
    define: {
      'process.env.GoogleMapsAPIKey': JSON.stringify(process.env.GoogleMapsAPIKey),
      'process.env.GoogleMapsMapId': JSON.stringify(process.env.GoogleMapsMapId),
      'process.env.MapboxAccessToken': JSON.stringify(process.env.MapboxAccessToken)
    },
    server: {
      open: true,
      port: 8080
    },
    optimizeDeps: {
      esbuildOptions: {target: 'es2020'}
    }
  };
});
