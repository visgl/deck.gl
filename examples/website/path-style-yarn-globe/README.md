# PathStyleExtension Yarn Globe

This website example turns procedural spherical paths into a giant ball of yarn. The default scene
is one continuous strand that visits a spherical Fibonacci sequence of anchors, an approach
inspired by [Cobe](https://github.com/shuding/cobe). Taut great-circle spans connect each anchor,
while a steadily increasing altitude gives every crossing an unambiguous over-and-under order.
The strand carries a repeating, user-selectable color palette without interrupting whole-path dash
phase.

The **Layered showcase** option preserves the original nested spiral sculpture. Its 16 style
families cover every combination of:

- `dashMode`: segment-local and whole-path phase;
- `dashUnits`: widths, pixels, meters, and common space;
- `dashJustified`: natural spacing and endpoint-fitted spacing.

Six continuous spherical spirals are split into one-revolution courses so each course can carry a
different style. Every shell is non-self-intersecting and sits entirely above the previous shell;
crossings therefore read as physical over-and-under wraps instead of paths passing through one
another. Individual courses also vary among six dash motifs, widths, colors, caps, joints,
billboard extrusion, source-vertex density, and lateral offsets. A pair of orderly muted spirals
fills the inner silhouette. Everything is generated locally with no data download or access token.

Use the documentation example panel to switch layouts and palettes and to tune dash mode, units,
fitting, dash and gap scales, density, depth, lateral offset, thickness, caps, and motion. Hover a
strand to inspect its exact settings. Drag to rotate and scroll or pinch to zoom. The slow automatic
rotation pauses while the globe is being manipulated and resumes shortly afterward.

## Usage

From a deck.gl repository checkout, install dependencies at the repository root and start this
example against the local packages:

```bash
yarn
yarn start-local
```

The regular standalone commands use the installed `deck.gl` package:

```bash
npm install
npm start
```

Append `?layout=nested` to show the layered scene, `?strands=377` to change density, or
`?spin=false` to stop automatic rotation.

`PathStyleExtension` is WebGL-only in deck.gl v9.4, so this example explicitly requests a WebGL
device. Whole-path dashing and lateral offset together use all of `PathLayer`'s guaranteed WebGL2
vertex-attribute budget; this example intentionally does not stack another attribute extension.
