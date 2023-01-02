/**
 * Embeddable @deck.gl/jupyter-widget bundle
 *
 * Used in JupyterLab (whose entry point is at plugin.js) and Jupyter Notebook alike.
 *
 */
import esbuild from 'esbuild';
import getConfig from '../../scripts/bundle.config.mjs';

const buildConfig = {
  ...getConfig(),
  entryPoints: ['./src/index.js'],
  outfile: './dist/index.js',
  sourcemap: true,
  external: ['@jupyter-widgets/base']
};

/* global process, console */
const mode = process.argv[2];

if (mode === 'watch') {
  buildConfig.watch = true;
  esbuild.build(buildConfig).then(result => {
    /* eslint-disable no-console */
    console.log('watching...');
  });
} else {
  esbuild.build(buildConfig);
}
