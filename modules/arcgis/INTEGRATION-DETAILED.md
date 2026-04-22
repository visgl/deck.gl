# @deck.gl/arcgis — Integration, Detailed Reference

Audience: a code-generation LLM (or engineer) who needs to re-derive or
re-apply this integration from scratch. Every file, constant, and formula
that matters is listed here with enough context to reconstruct the code.

See [`INTEGRATION.md`](./INTEGRATION.md) for a human-oriented summary.

## 1. Integration surfaces

The module exposes three classes via [`src/index.ts`](./src/index.ts) and
[`src/load-modules.ts`](./src/load-modules.ts):

| Export         | For        | Defined in                                         | ArcGIS plug-in point |
| -------------- | ---------- | -------------------------------------------------- | -------------------- |
| `DeckLayer`    | 2D MapView | [`deck-layer.ts`](./src/deck-layer.ts) + [`deck-layer-view-2d.ts`](./src/deck-layer-view-2d.ts) | `Layer.createSubclass` with a custom `BaseLayerViewGL2D` |
| `DeckRenderer` | 3D SceneView | [`deck-renderer.ts`](./src/deck-renderer.ts)     | `RenderNode.createSubclass({consumes: ['composite-color'], produces: 'composite-color'})` |
| `loadArcGISModules` | Async AMD loader helper | [`load-modules.ts`](./src/load-modules.ts) | — |

Both integration paths share the same rendering primitive, defined in
[`src/commons.ts`](./src/commons.ts): off-screen FBO + composite quad.

## 2. Texture compositing pipeline

### 2.1 Motivation

ArcGIS and deck.gl maintain incompatible GL state (depth compare, blend
factors, `drawBuffers`, attribute bindings, viewport, clear values).
They cannot safely share a framebuffer. Rendering deck into an
off-screen FBO and then compositing is the canonical solution.

### 2.2 Resources owned by the module

Created inside `initializeResources` in [`commons.ts`](./src/commons.ts):

| Resource    | Type                       | Purpose                                                    |
| ----------- | -------------------------- | ---------------------------------------------------------- |
| `deck`      | `Deck` (from `@deck.gl/core`) | Controller-less deck.gl instance bound to ArcGIS's `gl` |
| `texture`   | `Texture` (RGBA8)          | Color attachment of the FBO                                |
| `fbo`       | `Framebuffer`              | Off-screen target deck draws into (has depth16unorm DS)    |
| `model`     | `Model` (full-screen quad) | Composite pass shader + geometry                           |

The `Deck` is created with `controller: false`, with ArcGIS's `gl`
context, with `width: null, height: null` (deck must not try to resize
the canvas; ArcGIS owns that), and with `parameters: {depthCompare:
'less-equal'}`.

### 2.3 Custom render hook on the `Deck` instance

```ts
deckInstance.setProps({
  _framebuffer: fbo,
  _customRender: redrawReason => {
    if (redrawReason === 'arcgis') {
      // Reset premultiplied-alpha blend BEFORE deck draws, because ArcGIS
      // leaves srcAlpha=ZERO (it needs destination alpha preserved for
      // its own compositing pipeline). Without this reset, deck layers
      // write alpha=0 and the composite shader outputs black pixels.
      gl.blendFuncSeparate(
        gl.ONE, gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE, gl.ONE_MINUS_SRC_ALPHA
      );
      deckInstance._drawLayers(redrawReason);
    } else {
      this.redraw();   // `this` = the ArcGIS renderer; schedules a repaint
    }
  }
});
```

### 2.4 Per-frame `render()`

The core of `commons.render(resources, viewport)`:

1. Capture ArcGIS's current `FRAMEBUFFER_BINDING` via `getParametersWebGL`
   — that is the *screen* target we must composite into.
2. Resize the FBO to `(width * dpr, height * dpr)`. **Note**: pass CSS
   pixel dimensions (`width`, `height`) to `deck.setProps`, *not*
   physical pixels, because deck applies DPR internally. Passing
   physical pixels double-applies DPR and shoots geometry off-screen.
3. After `fbo.resize`, luma clones and destroys the color attachment
   texture. Re-sync `resources.texture` and the model's sampler binding
   to the replaced texture (otherwise the model samples a destroyed
   GPU handle). This is subtle but critical.
4. `deck.setProps({width, height, viewState})` then `deck.redraw('arcgis')`
   triggers the `_customRender` hook above.
5. Restore `drawBuffers` on the *screen* FBO (it is per-FBO and not
   tracked by luma's state cache). For a raw native FBO:
   `gl.drawBuffers([COLOR_ATTACHMENT0])`; for the default FBO:
   `gl.drawBuffers([BACK])`.
6. Manually enable blending (`gl.enable(GL.BLEND)`) with
   premultiplied-alpha factors — the model only sets blend *factors*
   but not `blend: true`, so `setDeviceParameters` does not enable it.
7. To composite into the native FBO, luma's `WEBGLRenderPass` duck-types
   the framebuffer prop (`.handle`, `.width`, `.height`,
   `.colorAttachments`). A raw `WebGLFramebuffer` has none of those,
   which breaks viewport setup. Construct a minimal adapter object:
   `{handle: rawScreenFbo, width, height, colorAttachments: [null]}`
   and pass it via `beginRenderPass({framebuffer: adapter, parameters:
   {viewport: [0, 0, w*dpr, h*dpr]}, clearColor: false, clearDepth:
   false})`.
8. Draw the full-screen quad, then `pass.end()`.

### 2.5 Composite shader

Trivial. Full-screen quad in NDC, samples `deckglTexture`, outputs
`texture(...)` directly — the FBO already contains premultiplied RGBA
(because of step 2.3 above), so no extra multiplication is needed.

## 3. The SceneView (3D) render node

In [`deck-renderer.ts`](./src/deck-renderer.ts):

```ts
const DeckRenderNode = RenderNode.createSubclass({
  consumes: {required: ['composite-color']},
  produces: 'composite-color',
  initialize() {},
  render(inputs) {
    const passthrough = inputs.find(i => i.name === 'composite-color');
    // Lazy-init resources on first render (earliest point `gl` is ready).
    // ...
    const output = node.bindRenderTarget();   // MUST be before commons.render()
    commons.render(self.resources, viewport); // see viewport derivation below
    return output;
  }
});
```

Two non-obvious requirements:

- **`bindRenderTarget()` must be called before `commons.render`.** The
  captured `FRAMEBUFFER_BINDING` inside `commons.render` must point at
  the output FBO, not the composite-color input FBO.
- **Lazy initialisation.** `gl` is not guaranteed to be on the render
  node until its first `render()` call. Guard against concurrent init
  attempts with a boolean.

### 3.1 Viewport derivation

All quantities below are computed every frame from `self.view`:

```ts
const gl = node.gl;
const dpr = window.devicePixelRatio || 1;
const width  = gl.drawingBufferWidth  / dpr;
const height = gl.drawingBufferHeight / dpr;

// 3.1.1 zoom
const zoom = Math.log2(591657550.5 / self.view.scale) - 1;

// 3.1.2 focal point (= ground point at screen center)
const focalPoint = self.view.toMap({x: width/2, y: height/2} as any);
const latitude  = focalPoint ? focalPoint.latitude  : self.view.center.latitude;
const longitude = focalPoint ? focalPoint.longitude : self.view.center.longitude;

// 3.1.3 altitude (match ArcGIS camera slant distance)
const cameraPos = self.view.camera.position;
const METERS_PER_DEG_LAT = 111320;
const midLatRad = ((latitude + cameraPos.latitude) / 2 * Math.PI) / 180;
const dLatM = (cameraPos.latitude  - latitude)  * METERS_PER_DEG_LAT;
const dLngM = (cameraPos.longitude - longitude) * METERS_PER_DEG_LAT * Math.cos(midLatRad);
const horizM = Math.sqrt(dLatM*dLatM + dLngM*dLngM);
const slantM = Math.sqrt(horizM*horizM + cameraPos.z*cameraPos.z);
const altitude = slantM / (height * self.view.resolution);

// 3.1.4 deliver to commons.render
render(self.resources, {
  width, height, latitude, longitude, altitude, zoom,
  bearing: self.view.camera.heading,
  pitch:   self.view.camera.tilt,
});
```

### 3.2 Why these specific formulas

#### Zoom

- Constant `591657550.5` = ArcGIS Web Mercator scale at zoom 0, 256-px tiles.
- The `-1` converts to deck.gl's 512-px tile convention.
- ArcGIS's `view.resolution` (meters-per-pixel) equals `view.scale /
  3779.527559` (at 96 DPI) and is *projected* Mercator mpp.
- deck.gl's zoom encodes ground-meters-per-pixel via
  `78271.5 * cos(latitude) / 2^zoom`.
- Ground mpp = projected mpp × cos(latitude). Substituting both forms
  into the equality and solving for zoom, the `cos(latitude)` factor
  cancels out. Do **not** introduce it here.

#### Altitude (deck.gl's key architectural constraint)

deck.gl's `WebMercatorViewport` couples two things into `altitude`:

1. camera-to-focal-plane slant distance (in viewport-height units), **and**
2. vertical FOV, via `fovy = 2 * atan(0.5 / altitude)`.

ArcGIS decouples them: fixed 55° diagonal FOV, variable camera
distance. Any single `altitude` value matches ArcGIS's camera *xor* its
FOV — never both.

Empirical comparison, at tilt 60° / SF latitude:

| altitude source                   | camera distance | deck fovy | match quality       |
| --------------------------------- | --------------- | --------- | ------------------- |
| `0.5 / tan(verticalFOV/2)` (FOV)  | off             | exact     | bad at high tilt    |
| `slantDist / (h * resolution)`    | exact           | ~3° off   | best overall        |

We pick slant-distance because it keeps the focal area geometrically
exact, which is what the user looks at. Residual drift at the horizon
at tilt ≥ 70° is the FOV-coupling error.

#### Focal point

`view.center` is DEFINED as the ground point at screen center, so
`view.toMap(w/2, h/2)` is equal to it in practice. Using `toMap` is
robust to any configuration where padding or off-centre cameras would
make those differ.

#### Bearing

deck.gl's bearing and ArcGIS's heading have the same sign convention
in the 3D path. In 2D ([`deck-layer-view-2d.ts`](./src/deck-layer-view-2d.ts)),
MapView's `state.rotation` has the opposite sense, so the 2D code
passes `bearing: -state.rotation`.

## 4. The 2D render path (MapView)

[`deck-layer-view-2d.ts`](./src/deck-layer-view-2d.ts) is simpler:

- `attach()` calls `initializeResources(gl)` with ArcGIS's GL context.
- `detach()` calls `finalizeResources`.
- `render(renderParameters)` calls `commons.render` with:
  - `width`, `height` from `this.view.state.size`
  - `latitude`, `longitude` from `this.view.center`
  - `zoom` from `this.view.featuresTilingScheme.scaleToLevel(state.scale)`
  - `bearing: -state.rotation`, `pitch: 0`

Because MapView is a flat top-down projection, no altitude math is
needed — deck's default altitude (1.5) is fine.

## 5. Out-of-module changes

### 5.1 luma.gl patch — `patches/@luma.gl+webgl+9.3.2.patch`

**File patched:** `node_modules/@luma.gl/webgl/dist/adapter/resources/webgl-render-pass.js`

**Symptom without patch:** every 3D frame throws `Cannot read properties
of undefined (reading 'map')` from `WEBGLRenderPass`.

**Cause:** when `beginRenderPass` is called with a framebuffer whose
`colorAttachments` is `undefined` (the case when wrapping a raw native
`WebGLFramebuffer` obtained via `getParameter(FRAMEBUFFER_BINDING)`),
the code unconditionally calls
`webglFramebuffer.colorAttachments.map(...)` to build draw buffers.

**Fix (one-liner):**

```diff
- const drawBuffers = webglFramebuffer.colorAttachments.map((_, i) => 36064 + i);
+ const colorAttachmentCount = webglFramebuffer.colorAttachments?.length ?? 1;
+ const drawBuffers = Array.from({length: colorAttachmentCount}, (_, i) => 36064 + i);
  this.device.gl.drawBuffers(drawBuffers);
```

Already merged on luma.gl `master`. Remove once `@luma.gl/webgl > 9.3.2`
is published.

### 5.2 Core shader-library coordinate-system shim

**Files patched:**

- [`modules/core/src/shaderlib/project/viewport-uniforms.ts`](../core/src/shaderlib/project/viewport-uniforms.ts)
- [`modules/core/src/shaderlib/project/project-functions.ts`](../core/src/shaderlib/project/project-functions.ts)

**Symptom without patch:** `Invalid coordinateSystem: 1` (or 0, 2, 3)
thrown every frame as soon as a `Tile3DLayer` + `I3SLoader` tile is
projected.

**Cause:** `@loaders.gl/i3s` ≤ 4.4.x emits layer data with *numeric*
`coordinateSystem` values from its own legacy `COORDINATE_SYSTEM` enum
(e.g. `1 = lnglat`, `2 = meter-offsets`). Current deck.gl core uses a
string enum (`'lnglat'`, etc.) and throws on numeric input at
`getShaderCoordinateSystem`.

**Why the fix must be in core, not in `@deck.gl/arcgis`:** the failing
calls originate in `Tile3DLayer` inside `@deck.gl/geo-layers`, which
invokes the core project functions directly. `@deck.gl/arcgis` sees
none of those data structures. The three entry points where a foreign
`coordinateSystem` can first enter the projection path are
`getShaderCoordinateSystem`, `getOffsetOrigin`, and
`getUniformsFromViewport` (all in `viewport-uniforms.ts`), plus
`normalizeParameters` and `getWorldPosition` in
`project-functions.ts`. A patch confined to the arcgis module cannot
reach any of these.

**Change (additive, non-behaviour-changing for string callers):** add a
new helper in `viewport-uniforms.ts`:

```ts
const NUMERIC_COORDINATE_SYSTEM: Record<number, CoordinateSystem> = {
  [-1]: 'default',
  0: 'cartesian',
  1: 'lnglat',
  2: 'meter-offsets',
  3: 'lnglat-offsets',
};

export function normalizeCoordinateSystem(
  coordinateSystem: CoordinateSystem | number
): CoordinateSystem {
  if (typeof coordinateSystem === 'number') {
    const normalized = NUMERIC_COORDINATE_SYSTEM[coordinateSystem];
    if (normalized !== undefined) return normalized;
  }
  return coordinateSystem as CoordinateSystem;
}
```

Call it at every entry where a `coordinateSystem` (or
`fromCoordinateSystem`) value first arrives from outside:

- `getShaderCoordinateSystem`: normalize on entry, then look up in
  `COORDINATE_SYSTEM_NUMBERS`.
- `getOffsetOrigin`: assign `coordinateSystem =
  normalizeCoordinateSystem(coordinateSystem)` at the top.
- `getUniformsFromViewport`: same.
- `project-functions.ts#normalizeParameters`: normalize both
  `coordinateSystem` and (if present) `fromCoordinateSystem` before any
  downstream switch.
- `project-functions.ts#getWorldPosition`: normalize once before the
  switch.

**Risk assessment:** the helper is a pure function with no side
effects. For callers that already pass a string value
(`typeof === 'string'`), `normalizeCoordinateSystem` is an identity
operation, so upstream deck behaviour is unchanged. For callers passing
a numeric value the function returns the corresponding string — this
is the only behaviour change, and it converts what was a hard error
into the correct behaviour.

**Tests to add:**

- Unit: `normalizeCoordinateSystem(-1)` → `'default'`,
  `normalizeCoordinateSystem('lnglat')` → `'lnglat'`,
  `normalizeCoordinateSystem(99)` → `99` (passthrough for unknown).
- Integration: a `Tile3DLayer` with a fixture whose tile header has a
  numeric `coordinateSystem` renders without error.

**Removal condition:** can be dropped once loaders.gl emits string
coordinate systems again, or deck.gl core formally re-accepts numeric
values via its own public adapter.

## 6. Known limitations

1. **High-tilt horizon drift.** FOV-coupling residual in
   `WebMercatorViewport` (§3.2). Visible at tilt ≥ 70°. Resolution
   requires a custom `Viewport` subclass that accepts ArcGIS's raw
   matrices.
2. **`viewingMode: 'global'` SceneViews.** The flat-earth approximation
   in the altitude derivation is exact only for `viewingMode: 'local'`.
   For global, horizontal distance should use a true great-circle
   calculation on the sphere.
3. **Elevation (ground) layers.** All focal-point math assumes the
   ground is at elevation 0. If a SceneView has a non-trivial ground
   elevation surface and `view.toMap(w/2, h/2)` returns a point whose
   elevation is non-zero, `altitude` is off by a small percentage. Not
   a problem for our current use cases.

## 7. Minimal reproducer for validating the integration

`test/apps/arcgis-i3s/app.js` loads the SF Buildings i3s tileset via
`Tile3DLayer` inside a `SceneView`. It exposes `window.__sceneView` for
debugging. A successful integration renders building polygons that
coincide with the basemap streets at all zooms and tilts ≤ 60°, with a
small (<5%) horizon drift at tilt ≥ 75°.

## 8. File index

```
modules/arcgis/src/
  index.ts                 — public exports
  load-modules.ts          — async AMD loader
  deck-props.ts            — DeckProps ArcGIS subclass
  deck-layer.ts            — 2D ArcGIS Layer wrapper
  deck-layer-view-2d.ts    — 2D BaseLayerViewGL2D subclass
  deck-renderer.ts         — 3D RenderNode subclass
  commons.ts               — shared init / render / finalize

modules/core/src/shaderlib/project/
  viewport-uniforms.ts     — [patched] adds normalizeCoordinateSystem
  project-functions.ts     — [patched] calls normalizeCoordinateSystem

patches/
  @luma.gl+webgl+9.3.2.patch — adds optional-chain on colorAttachments.map
  README.md                  — explains the patch

test/apps/arcgis/          — 2D TripsLayer demo (MapView)
test/apps/arcgis-i3s/      — 3D Tile3DLayer + i3s demo (SceneView)
```
