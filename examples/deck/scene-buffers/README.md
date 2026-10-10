# Riverfront Selection Outline

See [setup and commands](../README.md) before running this example.

A WebGPU deck.gl scene with HDR bloom, surface edges, a visible-surface selection outline,
and normal, depth, selection, and previous-frame views. Click a building to move the outline.

Run `yarn --cwd examples/deck/scene-buffers start` from the repository root.


`SceneBufferEffect` captures the explicitly participating layers into a shared `GBuffer` per
view. The example configures the existing bloom and outline passes, while the shared
`ShaderPassEffect` delegates execution to `ShaderPassRenderer` and presents the resulting image. Bright roof beacons retain HDR radiance until tone mapping;
the glass pavilion blends after opaque capture and does not replace opaque depth or normals.

The adapter supports multiple views, but this final presentation example intentionally has
one view. The final effect displays the captured scene; unrelated Deck layers or external
basemaps must be integrated explicitly before using this composition pattern elsewhere.

The previous-frame view is a diagnostic of the last rendered capture, not temporal smoothing.
History uses a second complete set of scene textures. Reset it on camera cuts or scene
replacement. Transparent objects are absent from normals and selection masks. No motion
vectors, temporal rejection, or screen-space reflections are applied here.

This example requests `selection: true` for its outline and mask views. Four capture passes run in addition to Deck's normal draw. Captures cost about 17 bytes per
physical canvas pixel per view, doubled with history, before bloom and presentation targets.
The adapter uses Deck's experimental layer-pass interface and the repository's pinned patch;
it is experimental and currently requires WebGPU.

Run `yarn --cwd examples/deck/scene-buffers test:visual` for the browser checks.

The district geometry is rendered by `../river-district-layer.ts`, shared with the other riverfront
examples. It uses luma.gl's Lambert material for lighting, optional `heightFog`, and `surfaceBuffer`
for view-space normals/roughness and selection output. The layer owns its generated mesh buffer and
model; Deck owns their layer lifecycle. Fog defaults to zero density.
