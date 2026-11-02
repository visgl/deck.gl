# Riverfront patterns

See [setup and commands](../README.md) before running this example.

A Deck scene demonstrating the reusable `patternFill` shader module on building roofs and walls.
Run `yarn start` here after installing and building the workspace.

Compare hatch, crosshatch, and dot fills; adjust spacing in meters, ink width, and angle. Patterns
use local east/north/up surface coordinates and stay attached while the camera moves. Each box
face selects a planar coordinate pair; arbitrary meshes should provide their own continuous UVs.

The shader returns coverage only. This example combines coverage with lit building color, and
keeps feature picking independent of the visual fill. The application owns the scene; each mesh
layer owns and releases its vertex buffer and model. Uniform changes reuse those resources.

Stripe coverage integrates a periodic pulse over the pixel footprint. Crosshatching combines
two filtered stripe directions. Dots use edge antialiasing and blend toward their analytic mean
area as they become subpixel. This avoids distant shimmer without temporal history. Dot filtering
and oblique crosshatch intersections are approximations; the module does not displace geometry,
create outlines, animate, or sample a texture.

Both WebGPU and WebGL2 are supported. The standalone app uses the shared example
infobox stylesheet. `yarn test:visual` checks pattern changes, stable redraws, picking, resize,
and resource cleanup on both renderers. GPU module tests additionally measure ink area and
minification stability from rendered pixels.

`patternFill` is a luma.gl `ShaderModule`, separate from Deck's fill-pattern layer extension and
the existing `fillPatternShaderPlugin` helper. The plugin injects shader functions and lets a
caller provide pattern type, size, and coordinates; this module exposes typed shader inputs and
filters coverage across the pixel footprint. This example uses a custom luma.gl `Model`, so it
does not use Deck's extension hooks or its per-layer attributes. The APIs overlap in pattern
behavior, while serving different integration points.
