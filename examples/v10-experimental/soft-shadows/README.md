# Riverfront soft shadows

See [setup and commands](../README.md) before running this example.

A deck.gl riverfront with animated, geographically calculated summer sunlight. The visible SunLayer, surface lighting, and shadows use the same `@math.gl/sun` direction at the district origin in New York on June 21, 2026. Times are EDT; the animated clock covers a full 24-hour cycle in about 30 seconds by default. Scrubbing time pauses the sun animation. Clouds continue drifting independently.

The example reuses `ShadowMapRenderer` and the `shadow` shader module from `@luma.gl/experimental`, including cascade fitting, blocker search, PCSS penumbrae, and cascade blending. It reuses the Lambert material and shared riverfront mesh fixture. Example code bridges Deck projection/picking and light-space drawing; it contains no independent shadow-filter implementation.

Shadow receivers and casters share local east/north/up meters. The camera adapter converts Deck viewport units and OpenGL clip depth to the renderer's meter distances and WebGPU clip depth. Each cascade has its own caster model/uniform storage. Direct sunlight or moonlight is shadowed; ambient lighting is preserved.

WebGPU and WebGL2 are supported through the same shadow API. WebGPU uses depth cube arrays and comparison samplers; WebGL2 uses depth face arrays and explicit bilinear depth comparisons. Both retain cascades, blocker search, contact-hardening penumbrae, and quality presets. Quality selects the renderer's existing presets. Softness controls the sun's angular radius; the enlarged default makes penumbrae easier to inspect than the physical sun's approximately 0.0047-radian radius. Shadows are geometric, so offscreen buildings can cast onto visible surfaces. SunLayer and MoonLayer draw camera-oriented sky bodies with foreground depth occlusion. `@math.gl/sun` supplies lunar direction and illumination for MoonLayer. Shift-drag or right-drag can tilt past the horizon, up to 165 degrees, to look into the sky. The camera stays at least 20 metres above ground, including after zoom and resize. The Sun and Moon buttons aim at their current positions and pause the sun clock; a body below the horizon uses a visible viewing time. Direct sunlight stops below the horizon; visible moonlight casts faint, soft shadows at night.

CloudLayer adds procedurally shaped, wind-driven sky clouds. Cloud cover, wind speed (metres per second), and direction (degrees clockwise from north, toward which clouds move) are adjustable. Its lighting follows the same solar direction as the scene, including nightfall, and its premultiplied compositing attenuates celestial disks behind clouds. It reuses the `clouds` shader from shadertools and the `valueNoise` dependency shared with height fog. The fixed 64-sample volume slab uses approximate sunlight scattering; receivers sample the same cloud density with `clouds_getTransmittance` to cast moving cloud
shadows on buildings and ground, preserving ambient light. Cloud shadows and cloud animation
have independent toggles. The layers support WebGPU and WebGL2 on perspective flat maps; the shadow renderer also supports both backends.

AtmosphereLayer and the reusable `atmosphere` module replace the default gradient with a
single-scattering Rayleigh/Mie sky. The same module applies distance extinction and in-scattering
to scene geometry. Atmospheric sky and haze controls share the current sun direction; disabling
the atmosphere restores the previous sky background. Sky layers share one camera/ray adapter.
The local spherical model omits multiple scattering, ozone and cloud shadows inside the atmosphere.

Run `yarn start`, `yarn build`, or `yarn test:visual` in this folder.

At night, moonlight follows lunar position, phase and distance, with an illustrative
exposure lift for readability. Lunar shadows are deliberately weak and soft. The
atmosphere ground color uses the same surface color as the district receiver.
