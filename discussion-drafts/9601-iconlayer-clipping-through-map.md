# IconLayer clipping through map

- Discussion: https://github.com/visgl/deck.gl/discussions/9601
- **Recommended action:** DRAFT NEW (the existing reply redirects to the react-google-maps repo; there's a concrete deck.gl-side fix worth giving first)

## Question

Using deck.gl with Google Maps (react-google-maps), `IconLayer` icons render fine
on load but **clip through / disappear behind the map** when the view changes
(pan/tilt/zoom).

## Draft answer

This is a depth-buffer interaction, and there's a one-line deck.gl-side fix.

When deck.gl runs as a `GoogleMapsOverlay` on a **vector** Google map, it renders
into Google's WebGL scene and shares its depth buffer — per the
[@deck.gl/google-maps docs](https://deck.gl/docs/api-reference/google-maps/overview),
*"objects drawn by the `GoogleMapsOverlay` class appear inside the Google Maps
scene, correctly intersecting with 3D buildings and behind the contextual labels."*
That shared depth is exactly what makes flat icons get occluded by / clip through
map geometry once you tilt or move the camera.

To make the icons ignore depth and always draw on top, disable depth testing on
the layer via [`parameters`](https://deck.gl/docs/developer-guide/tips-and-tricks#z-fighting-and-depth-testing)
(deck.gl v9 uses WebGPU-style GPU parameter names):

```js
new IconLayer({
  id: 'iconLayer',
  data: mapData.filter(d => d.latitude && d.longitude),
  getIcon: d => ({url: Icon[dataInstance], width: 256, height: 256}),
  getPosition: d => [d.longitude, d.latitude],
  getSize: 40,
  // Draw icons regardless of scene depth → no clipping through the map
  parameters: {
    depthCompare: 'always'
  }
});
```

Notes:
- `IconLayer` already defaults to [`billboard: true`](https://deck.gl/docs/api-reference/layers/icon-layer#billboard)
  (icons face the camera), so you shouldn't need to change that — the issue is
  depth, not orientation.
- On deck.gl v8 / luma.gl v8 the equivalent was `parameters: {depthTest: false}`;
  in v9 it's `depthCompare: 'always'`. See the
  [Tips & Tricks: z-fighting and depth testing](https://deck.gl/docs/developer-guide/tips-and-tricks#z-fighting-and-depth-testing)
  guide.
- If you *want* icons to be occluded by 3D buildings but not to z-fight against
  the ground plane, `polygonOffset` (mentioned in the same guide) is the more
  surgical option.

If the icons still misbehave *only* through the react-google-maps wrapper after
this (e.g. the overlay isn't mounted as expected), then it's worth raising with
that project as the earlier reply suggested — but the depth fix above resolves
the classic "clips through the map on view change" symptom.

## Notes for reviewer

- **Confidence: high on the fix, medium on it being the asker's exact cause**
  (their repro is inside react-google-maps and screenshots weren't inspected).
- Verified param name against `docs/developer-guide/tips-and-tricks.md`
  (`parameters: {depthCompare: 'always'}` under "z-fighting and Depth Testing")
  and the v8→v9 change in `docs/upgrade-guide.md` (old `depthTest`) /
  `docs/api-reference/core/deck.md` (`depthCompare`, `depthWriteEnabled`).
- Google Maps shared-depth behavior verified in
  `docs/api-reference/google-maps/overview.md` ("Shared 3D space").
