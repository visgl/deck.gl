# Riverfront depth of field

See [setup and commands](../README.md) before running this example.

A deck.gl riverfront scene using the existing `dofCompositeShaderPass` from `@luma.gl/effects`, `SceneBufferEffect` for sampled scene depth, and `ShaderPassEffect` for presentation. No custom blur shader is needed.

The initial automatic tour chooses a different visible building every five seconds. Click a building to hold focus there; enable **Automatic focus** to resume the tour. Focus eases in reciprocal distance with a 0.65-second time constant, including while the camera moves. **Lens blur** controls an exaggerated miniature-lens look, rather than a calibrated photographic lens. Toggle **Depth of field** to compare the unblurred scene.

This capture path requires WebGPU. The example borrows scene-depth textures and lets the shared effects own and clean up GPU resources.

Run `yarn --cwd examples/deck/depth-of-field start`, build with `yarn --cwd examples/deck/depth-of-field build`, and verify interaction/rendering with `yarn --cwd examples/deck/depth-of-field test:visual`.
