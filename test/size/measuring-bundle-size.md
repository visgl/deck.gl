# Measuring Bundle Size

The bundle-size table in `docs/developer-guide/building-apps.md` compares the
default WebGPU-enabled distribution with the conditional `visgl:webgl-only`
distribution. Measurements use the built package entry points so that package
export conditions and tree shaking match an installed application.

## Prepare the packages

Build the repository before measuring. Pass
`--tsconfig=test/size/tsconfig.json` to esbuild so that the root TypeScript path
aliases do not redirect package imports to source files before package export
conditions are evaluated.

## Create an entry point

Create a temporary JavaScript file in `test/size` that retains only the class or
classes named by one table row. For example:

```js
import {HexagonLayer} from 'deck.gl';

console.log(HexagonLayer);
```

Measure each row independently. Delete temporary entry points after recording
the results; `import-nothing.js` is the committed entry point for the
`Deck + Layer` baseline.

## Bundle a row

The baseline includes deck.gl's rendering core. For every subsequent row,
externalize `@deck.gl/core` and its direct `@luma.gl/*` dependencies. This
reports the incremental cost of the tested class in an application that already
contains the shared rendering foundation. Subtracting a `Deck`-only bundle is
not equivalent: layers make otherwise tree-shaken core facilities such as
`Model`, project, and picking shaders reachable.

Run esbuild once with the default package exports:

```bash
npx esbuild --bundle test/size/import-hexagon-layer.js \
  --minify \
  --tsconfig=test/size/tsconfig.json \
  --external:@deck.gl/core \
  --external:@luma.gl/core \
  --external:@luma.gl/engine \
  --external:@luma.gl/gpgpu \
  --external:@luma.gl/shadertools \
  --external:@luma.gl/webgl \
  --outfile=/tmp/deck-size-bundle.js
```

Run the same command with `--conditions=visgl:webgl-only` for the WebGL-only
column. Always write to the same output filename because gzip records the
filename in its header.

If the direct `@luma.gl/*` dependencies of `modules/core/package.json` change,
update the external list before collecting new measurements. Do not externalize
layer-specific packages such as loaders; those are part of the incremental cost
of the layer.

## Record the sizes

Record the minified output size and its gzip-compressed size:

```bash
wc -c < /tmp/deck-size-bundle.js
gzip -9 -c /tmp/deck-size-bundle.js | wc -c
```

Divide byte counts by 1024 and round to one decimal place for the table. The
WebGL-only and default builds must use the same entry point, esbuild options,
external list, output filename, and compression command.
