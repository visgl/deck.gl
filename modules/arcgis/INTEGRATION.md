# @deck.gl/arcgis — Integration Summary

This document explains, at a high level, how `@deck.gl/arcgis` renders deck.gl
layers on top of an ArcGIS map, the quirks of the integration, and the
out-of-module changes this fork required. Intended for human reviewers.

A deeper, self-contained companion document aimed at code-generation LLMs is in
[`INTEGRATION-DETAILED.md`](./INTEGRATION-DETAILED.md).

## 1. How the module works

### 1.1 Two render modes

`@deck.gl/arcgis` supports two ArcGIS view types:

- **MapView** (2D) — deck.gl plugs in as a custom `BaseLayerViewGL2D` layer
  view and draws its layers in the ArcGIS WebGL context every frame
  ([`deck-layer-view-2d.ts`](./src/deck-layer-view-2d.ts)).
- **SceneView** (3D) — deck.gl plugs in as a `RenderNode` that runs inside
  ArcGIS's 3D compositing pipeline
  ([`deck-renderer.ts`](./src/deck-renderer.ts)).

Both modes share the same rendering core
([`commons.ts`](./src/commons.ts)).

### 1.2 Texture compositing (both modes)

deck.gl cannot simply "draw into" ArcGIS's framebuffer because ArcGIS and
deck.gl disagree on several pieces of hidden GL state: depth, blend, draw
buffers, viewport, attribute bindings, clear color, etc. If deck drew
directly, ArcGIS would corrupt subsequent deck frames and vice versa.

The solution is a texture compositing pass:

1. deck renders its layers into an **off-screen FBO** that `commons.ts`
   owns. The FBO has an RGBA8 color attachment and a depth-stencil
   attachment, sized to match the visible canvas.
2. deck's draw inside the FBO uses **premultiplied-alpha blending**
   (`ONE, ONE_MINUS_SRC_ALPHA`). This is forced on each frame because
   ArcGIS leaves the GL blend state with `srcAlpha = ZERO` — if we did
   not reset, deck would write `alpha = 0` into the FBO and the
   composite pass would output black.
3. A simple full-screen-quad **composite shader** then samples that
   texture and draws it into ArcGIS's current framebuffer with the same
   premultiplied blend. The shader is a trivial pass-through: the
   interesting work is in getting the GL state right around the draw.

This is why the module owns a texture, a framebuffer, and a quad model —
they are the composite pipeline.

### 1.3 Keeping deck's viewport in sync with ArcGIS

Every frame we translate ArcGIS's view state into the arguments deck's
`WebMercatorViewport` wants:

| ArcGIS source                | deck.gl consumer                       |
| ---------------------------- | -------------------------------------- |
| `view.scale`                 | `zoom` (via a formula, see §3)         |
| `view.camera.heading`        | `bearing`                              |
| `view.camera.tilt`           | `pitch`                                |
| `view.toMap(center pixel)`   | `latitude`, `longitude`                |
| `view.camera.position`, `view.resolution` | `altitude` (via slant distance) |
| `gl.drawingBufferWidth/height / dpr`      | `width`, `height`      |

In 2D (MapView) things are simple — deck provides
`view.featuresTilingScheme.scaleToLevel()` to convert scale to zoom, and
the only other inputs are rotation (negated) and size.

In 3D (SceneView) the math is subtler. See §3.

## 2. The off-module changes this fork needs

Three kinds of changes live outside `modules/arcgis/`:

### 2.1 A luma.gl patch (`patches/@luma.gl+webgl+9.3.2.patch`)

luma's `WEBGLRenderPass` crashes with
`Cannot read properties of undefined (reading 'map')` whenever we start a
render pass whose framebuffer is a *wrapper around a raw native
`WebGLFramebuffer`* (which is exactly what we do to composite into
ArcGIS's FBO). It assumes `colorAttachments` is always an array and calls
`.map(...)` on it unconditionally. We need this path because
`gl.getParameter(GL.FRAMEBUFFER_BINDING)` returns a raw handle with no
wrapper state.

The patch is already merged upstream — remove the patch once luma > 9.3.2
is released and we upgrade past it. This is risk-free: the change is
purely additive (fallback when `colorAttachments` is missing).

### 2.2 A loaders.gl coordinate-system compatibility shim (core shader library)

`@loaders.gl/i3s` up through 4.4.x emits layer data with a **numeric**
`coordinateSystem` value (e.g. `1` for lnglat). deck.gl's `master` moved
to a string enum (`'lnglat'`, `'meter-offsets'`, etc.) and no longer
accepts the numeric form. The i3s loader throws
`Invalid coordinateSystem: 1` on every tile as soon as the `Tile3DLayer`
tries to project it.

The clean place to fix this is **deck.gl core**: it is core's string
enum that the loader payload must match, and the check has to run
before any coordinate-system-dependent dispatch in the projection
shader helpers. Patching inside `@deck.gl/arcgis` would not help —
`Tile3DLayer` lives in `@deck.gl/geo-layers` and calls the core project
functions directly, bypassing anything the arcgis module could do.

The change introduces one helper, `normalizeCoordinateSystem(value)`,
and calls it at the three entry points where a foreign value can
first arrive:

- [`modules/core/src/shaderlib/project/viewport-uniforms.ts`](../core/src/shaderlib/project/viewport-uniforms.ts)
  (`getShaderCoordinateSystem`, `getOffsetOrigin`,
  `getUniformsFromViewport`)
- [`modules/core/src/shaderlib/project/project-functions.ts`](../core/src/shaderlib/project/project-functions.ts)
  (`normalizeParameters`, `getWorldPosition`)

The helper is a pure lookup — it maps the legacy numeric values back to
the canonical string form, and otherwise returns its input unchanged.
It does **not** change any behaviour for callers that already pass the
string form, so the risk of changing core behaviour is minimal. A
focused unit test on the helper would be a sensible addition; a broader
impact test could exercise `Tile3DLayer` + i3s in a browser e2e.

Once the deck.gl core loader-alignment work catches up with the current
loaders.gl release (or loaders.gl revs to the string form), this shim
can be removed.

### 2.3 Test apps

Two test apps (`test/apps/arcgis`, `test/apps/arcgis-i3s`) demonstrate
the two integration surfaces and were used to validate the math below.
They are not shipped as part of the module.

## 3. SceneView projection math

This is the part that required the most iteration. ArcGIS's
`SceneView` and deck.gl's `WebMercatorViewport` parameterise their
cameras differently; some parameters are decoupled on one side and
coupled on the other, which creates a handful of non-obvious
mismatches.

### 3.1 Focal point

ArcGIS's `view.center` is defined as **the ground point under the
screen center**. We use `view.toMap(width/2, height/2)` to get
`latitude`/`longitude` (they equal `view.center` in the common case,
but this form is robust to off-centre camera configurations and
padding).

### 3.2 Zoom / scale

```
zoom = log2(591657550.5 / view.scale) - 1
```

- `591657550.5` is ArcGIS's Web-Mercator scale at zoom 0 for 256 px tiles.
- The `-1` converts to deck.gl's 512 px tile convention.
- **Do not** multiply by `cos(latitude)`. An earlier revision did, which
  inadvertently matched projected Mercator meters per pixel instead of
  ground meters per pixel, shrinking the deck layer ~26 % relative to the
  basemap at SF latitudes. The `cos(lat)` factor is already baked into
  both sides of the equation: ArcGIS's `view.resolution` *is* projected
  Mercator mpp, and deck.gl's zoom formula also includes it. When you
  equate ground-mpp on both sides, `cos(latitude)` cancels out.

### 3.3 Altitude — the one remaining architectural mismatch

In deck.gl's `WebMercatorViewport`, the `altitude` parameter serves
double duty. It is both:

1. Camera-to-focal-plane slant distance, in viewport-height units, **and**
2. The source of the vertical FOV, via
   `fovy = 2 · atan(0.5 / altitude)`.

In ArcGIS, those are decoupled. ArcGIS uses a **fixed 55° diagonal FOV**
(its `camera.fov`) and moves the camera *closer* to the focal point as
tilt increases. A given frame therefore has a specific FOV *and* a
specific camera distance, and no single deck `altitude` can match both.

We match **camera position** rather than FOV:

```ts
const cameraPos  = view.camera.position;             // {lng, lat, z}
const focal      = view.toMap(w/2, h/2);             // screen-center ground
const horizM     = greatCircle(focal → cameraPos);   // flat-earth ok with local
const slantM     = sqrt(horizM² + cameraPos.z²);
const altitude   = slantM / (height * view.resolution);
```

This keeps the focal area (where the user is looking) geometrically
exact. The trade-off is a ~3° FOV error (30.4° vertical ArcGIS vs ~33°
deck), which manifests as a few-pixel drift at the horizon when tilt is
≥70°.

A complete fix would require subclassing deck.gl's base `Viewport`
directly and feeding it ArcGIS's exact view and projection matrices
(accessible as `view.state.camera._viewProjectionMatrix`), bypassing
`WebMercatorViewport`'s altitude/FOV coupling entirely. That is a much
larger change — essentially building a dedicated `ArcGISSceneViewport`
— and is left for a follow-up.

### 3.4 Things that are NOT adjustments

For clarity, we do *not*:

- Apply a pitch/tilt correction to the zoom.
- Invert bearing (ArcGIS heading and deck.gl bearing have the same sign in
  the 3D path; 2D inverts it because MapView's `rotation` has the opposite
  sense).
- Clip the camera near/far planes — ArcGIS handles that.

## 4. Verification

Manual tests performed against the SF buildings i3s tileset:

- **Zoom match**: at zoom 14 / nadir, deck's meters-per-pixel equals
  ArcGIS's `view.resolution` to 4 significant figures.
- **Rotation stability**: right-click drag (preserves scale, only changes
  heading) no longer causes the deck layer to grow relative to the
  basemap.
- **Point-projection parity**: projecting test lng/lats through
  ArcGIS's `toScreen` and deck's `WebMercatorViewport.project` with our
  viewport parameters agree within ~5 px at tilt 60°, within ~50 px at
  tilt 75° (the FOV-coupling residual).

## 5. Open follow-ups

- Remove the luma.gl patch once >9.3.2 is available.
- Remove the `normalizeCoordinateSystem` shim once loaders.gl emits
  string coordinate systems again.
- Consider subclassing `Viewport` directly to match ArcGIS's matrices
  exactly, eliminating the high-tilt drift.
