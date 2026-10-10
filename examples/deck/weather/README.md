# Riverfront weather

See [setup and commands](../README.md) before running this example.

A portable WebGPU/WebGL2 example with wind-driven rain, drifting snow, and wispy height fog.
It opens with rain and fog enabled at 09:00 EDT on June 21, 2026 in New York.
The Time control shares one math.gl astronomy timestamp between SunLayer, MoonLayer,
StarfieldLayer, clouds, atmosphere, and scene lighting. `getSunLight` supplies direct
and diffuse light color and intensity, including cloud-cover attenuation. Sun
and Moon aim the camera above the horizon; if the body has set, the control
selects a time when it is visible. Center returns to the district view. Dense fog can
obscure celestial bodies; disable Fog to inspect the sky.
Run `yarn --cwd examples/deck/weather start`;

Choose Rain, Snow, Clouds, or Sunny, then toggle Fog independently. Clouds has no precipitation; Sunny disables clouds. The Clouds checkbox can override the selected preset. The fog controls retain their values while disabled. Intensity controls the particle count, wind uses metres
per second with direction clockwise from north, and visibility sets the fog extinction.
Pause freezes the clock exactly; reset returns to the seeded initial particle positions.
With no precipitation, fog and clouds disabled, and surface accumulation disabled, continuous redraws stop. Fog keeps animating only when enabled and both
Fog variation and Fog drift are nonzero. Zero variation restores uniform fog; zero drift
keeps static wisps. Animate pauses clouds, fog, precipitation and surface accumulation. Changing a setting or moving the camera still redraws the scene.
Camera movement remains available while paused. The scene uses map projection; scroll over the scene to zoom. The visual tests also exercise
globe projection through the scene API. Both use a local east/north/up metre frame for fog and particle sizing. The clock pauses while the document is hidden. Visible rendering uses elapsed time, so slower frame rates do not slow the weather.

`precipitation` and `heightFog` are reusable shader modules. `WeatherParticleLayer` connects
those modules to Deck projection and depth. Its particle volume follows the view's ground
center while particles in the overlap retain their world positions. The vertical band is
0–450 metres; this example is intended for neighborhood-scale views. `SkyLayer` composes the sky behind the scene with the same reusable atmosphere and cloud
modules used by the other examples. Precipitation splashes remain a separate effect.

The reusable `surfaceWeather` module darkens wet surfaces, adds patchy puddle highlights and
places snow on upward-facing ground and roofs. Water is explicitly masked out; this example
does not calculate shelter under bridges or snow depth. The Accumulate toggle integrates
rainfall/snowfall and drying/melting using an exact, frame-rate-independent helper. Surface
state persists across weather changes; wetness, snow cover and puddle sliders allow manual
inspection. Surface weather can be disabled without losing its stored values. Reset clears
wetness and snow. The simple Lambert adapter approximates sky highlights; it does not reflect
buildings. PBR adapters can reuse the same albedo and roughness helpers.

Opaque geometry writes depth before precipitation. A conservative, example-owned 256×384
`r32float` height map excludes particles below roofs and covered bridges. This field costs
384 KiB, is uploaded once, and is borrowed by the layer. It represents only the highest
surface at each horizontal location; it is not a collision simulation or a general 3D
occlusion volume. Features smaller than a texel can exclude nearby air. Outside the map,
the surface height is zero. Applications with changing buildings must update the field.

Particle positions are evaluated from identifier, seed, clock, and velocity without state
textures or CPU particle updates. Changing velocity or volume dimensions changes the
analytic trajectories. Keep volume size fixed while moving its center. Extending a clock
for very long sessions eventually loses float precision; applications can reset the effect
between sessions. Fade at volume boundaries hides recycling. Particle count is capped at
262,144; practical limits depend on overdraw, viewport, and hardware.

Fog integrates exponential density along a ray in local metres. Variation modulates that
density with warped, multiscale noise sampled along twelve ray segments. Fog drift moves
the field along the wind direction in metres per second; its speed is independent of
precipitation wind speed. Wisps also deform gently as they drift. Drift accumulates over
time, so changing its speed does not jump the fog to a new position. The shader is shared by material and depth-pass fog and adds no
textures, history, or render passes. The fixed sample count can undersample small wisps
along very long rays; this remains a neighborhood-scale approximation. The underlying height profile is constant below
the base height and decays exponentially above it. The visibility slider uses `3.912 / distance`
as base extinction, corresponding to 2% transmittance through a homogeneous medium. Height
falloff makes visibility greater above that base. The model uses a daylight-dependent fog tint, without
light scattering, shadowed fog, or temporal accumulation. Materials must opt into the fog
module in this example. The same analytic integral also powers the height mode of
`createVolumetricFogCompositeShaderPass` in `@luma.gl/effects`, demonstrated by Visualization City.
That pass can fog opaque geometry from depth; transparent precipitation applies fog in its material
afterward to avoid using the background depth. Neither path models a planet-scale atmosphere.

Run `yarn --cwd examples/deck/weather test:visual` for both-backend movement,
pause, fog, map/globe projection, depth-occlusion, surface-mask, and ownership checks. GPU module tests separately
check analytic fog and seeded, world-anchored motion. Projection tests round-trip local positions
through the actual Deck shaders, including high latitudes and globe poles. The pinned Deck patch
corrects its WGSL globe tangent-basis selection to match GLSL.

The district geometry is rendered by `../river-district-layer.ts`, shared with the other riverfront
examples. It uses luma.gl's Lambert material for lighting, optional `heightFog`, and `surfaceBuffer`
for view-space normals/roughness and selection output. The layer owns its generated mesh buffer and
model; Deck owns their layer lifecycle. Fog defaults to zero density.
