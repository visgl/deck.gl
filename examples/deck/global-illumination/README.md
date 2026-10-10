# Riverfront global illumination

See [setup and commands](../README.md) before running this example.

Colored diffuse bounce from visible buildings using the existing screen-space GI graph.

Run `yarn --cwd examples/deck/global-illumination start`.

Uses the shared `riverfront-lighting-scene.ts` fixture and one `SceneBufferEffect` for scene-linear `rgba16float` color, opaque depth, view normals/roughness and `rg16float` current-minus-previous UV motion. `SceneShaderPassEffect` binds these borrowed textures to existing luma.gl graphs and coordinates history invalidation. Camera motion is reconstructed from depth; firefly cores additionally write object motion. Resize and Center invalidate history, and pause settles a bounded number of frames before becoming idle.

The complete shared-buffer graphs require WebGPU; the Device selector and support metadata expose that requirement. `FireflyLayer` itself supports WebGL2 and WebGPU. Global illumination and shaft occlusion depend on visible screen-space geometry and cannot include hidden or off-screen emitters/occluders. These examples do not add geometric light shadows. The Fireflies example adds planar emitter reflections clipped to the river, using the existing river-water material for optional surface ripples; it does not reflect the rest of the scene. Fireflies and HDR night lighting request floating-point, extended-range display output on HDR-capable displays and otherwise tone-map to SDR.
