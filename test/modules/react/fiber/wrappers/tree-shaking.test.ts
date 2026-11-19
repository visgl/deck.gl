// @vitest-environment node
// esbuild's JS API rejects jsdom's TextEncoder, so this file runs in Node.
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const WRAPPERS = fileURLToPath(new URL('..', import.meta.url));

// Everything a deck.gl app already ships, so the sizes count only the layer module and the wrappers.
const EXTERNAL = ['react', 'react/*', '@deck.gl/core', '@luma.gl/*', '@loaders.gl/*', '@math.gl/*'];

/** Bundles and minifies `source` the way an app's production build would. */
async function bundle(source: string): Promise<string> {
  const result = await build({
    stdin: {contents: source, loader: 'ts', resolveDir: WRAPPERS},
    bundle: true,
    external: EXTERNAL,
    format: 'esm',
    jsx: 'automatic',
    logLevel: 'silent',
    minify: true,
    platform: 'browser',
    write: false
  });
  return result.outputFiles[0].text;
}

/** Bundles one import, as `export default`. */
function bundleImport(name: string, from: string): Promise<string> {
  return bundle(`export {${name} as default} from '${from}';`);
}

describe('tree-shaking', () => {
  it('bundles only the layer an app imports from /layers', async () => {
    const wrapped = await bundleImport('ScatterplotLayer', './layers');
    const direct = await bundleImport('ScatterplotLayer', '@deck.gl/layers');
    const everything = await bundle(`export * from './layers';`);

    // `layerName` strings survive minification, so they show which layer classes were bundled.
    expect(wrapped).toContain('"ScatterplotLayer"');
    for (const other of ['ArcLayer', 'GeoJsonLayer', 'IconLayer', 'PathLayer', 'TextLayer']) {
      expect(wrapped).not.toContain(`"${other}"`);
    }
    // The wrapper adds a few hundred bytes to the layer itself.
    expect(wrapped.length - direct.length).toBeLessThan(1024);
    expect(wrapped.length).toBeLessThan(everything.length / 5);
  });

  it('bundles only the widget an app imports from /widgets', async () => {
    const wrapped = await bundleImport('ZoomWidget', './widgets');
    const direct = await bundleImport('ZoomWidget', '@deck.gl/widgets');
    const everything = await bundle(`export * from './widgets';`);

    expect(wrapped.length - direct.length).toBeLessThan(1024);
    expect(wrapped.length).toBeLessThan(everything.length / 2);
  });

  it('bundles nothing from the layer modules for an app that imports only the factories', async () => {
    const factories = await bundle(`export {createLayerComponent} from './factories';`);

    expect(factories.length).toBeLessThan(1024);
  });
});
