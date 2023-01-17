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
        '@luma.gl': join(rootDir, './node_modules/@luma.gl'),
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
      port: 8080,
      proxy: {
        '/cartoapi': {
          target: 'https://gcp-us-east1-11.dev.api.carto.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/cartoapi/, ''),
          // https://stackoverflow.com/questions/64677212/how-to-configure-proxy-in-vite
          configure: proxy => {
            proxy.on('proxyRes', proxyRes => {
              proxyRes.headers['cache-control'] = 'public,max-age=100000,must-revalidate';
            });
          }
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {target: 'es2020'}
    }
  };
});
