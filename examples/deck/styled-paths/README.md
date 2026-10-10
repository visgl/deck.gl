# Riverfront routes

See [setup and commands](../README.md) before running this example.

Connected routes through the shared fictional river district, composing luma.gl's `makeStrokeGeometry`,
`pathDash`, `sketchStroke`, and `pointGlow` with an example-owned Deck mesh adapter. No map service or credentials are needed.

```sh
yarn install
yarn --cwd examples/deck/styled-paths start
```

Choose WebGPU or WebGL2, adjust width in metres, compare butt/square/round path ends and
miter/bevel/round corners, and change dash length, gap, and phase. Turn off dashes to see the full
cap and join shapes. Click visible route ink to inspect its feature; gaps pick the surface below.
The elevated bridge crossings interpolate vertex heights while retaining a horizontal stroke width.

The layer owns its uploaded mesh and model. Changing width, caps, joins, or path data rebuilds
geometry and releases the old buffers. Changing dashes, pencil grain, or glow intensity only updates uniforms. Changing appearance rebuilds
the envelope geometry and blend configuration. Deck supplies the
device, frame loop, projection, picking uniforms, and render pass. The adapter is local to this
example; the reusable CPU geometry and shader module live in engine and shadertools respectively.

`yarn --cwd examples/deck/styled-paths build` checks types and builds standalone assets.
`test:visual` runs both renderers and checks stable redraw, dash phase and toggles, geometry changes,
feature picking through gaps, zero-width paths, resizing, buffer reuse, and resource cleanup. Set
`STROKE_EXAMPLE_URL` to test a served production bundle. Software-GPU checks do not establish hardware
performance. `STROKE_THUMBNAIL` optionally writes a JPEG of the default WebGPU scene.

Caps apply to the path endpoints; individual dashes have straight ends. Width is in local map units,
not CSS pixels. Closed-loop dash phase can have a seam when the period does not divide the perimeter.
Self-intersecting or retraced paths may overlap; this tessellator does not compute a polygon union.

Choose Plain, Pencil, or Glow. Pencil uses the same `sketchStroke` module as architectural edges,
with distances, width and jitter in local metres and derivative-based antialiasing. A stable route
seed (or a hash of its name) anchors the grain independently of array order. The shader's existing
pixel-layer defaults are preserved; `minimumAntialias: 0` lets this world-unit adapter use the
fragment derivatives. Closed-loop grain can have a seam at the input path's first vertex.

Glow maps stroke distance into the existing `pointGlow` falloff. Its outer envelope is four times
the width control, while its narrow core handles picking. The halo adds radiance without depth
writes or bloom; zero intensity contributes neither color nor picking. Buildings supply depth
occlusion, and the example dims the district for this style. Additive rendering needs opaque scene
content; normalized targets can saturate, while an HDR application can preserve radiance for tone
mapping. No nearby-surface lighting or shadow casting is added.

Caps and joins come from the same geometry in every style. The transverse coordinate interpolates
through corner triangles; sharp or self-overlapping paths can accumulate brightness. Round caps
use radial falloff, square caps use a square profile, and butt caps stop at the endpoint. Individual
dash ends remain straight. Pencil and glow are visual styles on local XY strokes, not terrain
lines or arbitrary 3D tubes.
