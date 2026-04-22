# Patches

## `@luma.gl+webgl+9.3.2.patch`

Fixes `WEBGLRenderPass` crashing (`Cannot read properties of undefined (reading 'map')`)
when `@deck.gl/arcgis` calls `beginRenderPass` with a framebuffer wrapping a raw native
`WebGLFramebuffer` supplied by the ArcGIS API for JavaScript. In that path
`webglFramebuffer.colorAttachments` is undefined, so the `.map(...)` call to build
`drawBuffers` throws on every frame.

The fix is already merged on luma.gl's `master` branch (see
`modules/webgl/src/adapter/resources/webgl-render-pass.ts` and the new
`WEBGLRenderPass#drawBuffers for wrapped external WebGLFramebuffer` test).

**Remove this patch once `@luma.gl/webgl` > 9.3.2 is published and this repo is
upgraded past it.**
