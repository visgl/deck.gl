# Performance Roadmap


## Major initiatives

### Binary Attribute Support

Long-term goal: deck.gl layers can directly consume binary data. deck.gl's architecture is "binary first" (i.e. code paths are prioritized to ensure "zero overhead"/"minimal copying/iteration" in the binary case, and optimized "to the bone").

Docs:
- [Binary Data](/docs/developer-guide/binary-data.md) - Explains considerations when working with binary data.

RFCs:
- [Binary Data Support RFC](/dev-docs/v7.2/binary-data-rfc.md) - Basic binary array support with deck.gl.
- [GLSL Accessor RFC](/dev-docs/proposals/glsl-accessor-rfc.md) - Proposal for
- [Texture Attribute RFC](/dev-docs/proposals/texture-attribute-rfc.md) - Enable _variable-primitive layers_ read "descriptive attributes" from a single column value.
- [Chunked Data Support](/dev-docs/proposals/chunked-data-rfc.md) - Proposal for enabling deck.gl to work directly with Chunked Columnar data.

### Load data in workers/streaming loads

See loaders.gl


### Build attributes in workers

See RFC


### Use off-screen WebGL context

See luma.gl RFC


### Partial Updates

See RFC


### Improved prop diffing, uniform setting

TBA



## Smaller improvements


### Attributes/WebGL (memory use, buffer creation etc)
- [ ] Provide a target array for attribute updaters to write into, avoiding generation of millions of temporary objects during certain attribute generation.
- [ ] Support generic vertex attributes: Setting an accessor to a constant would cause a generic vertex attribute to be set, completely bypassing attribute generation (requires luma.gl fix).
- [ ] Create a shared `instancePickingColors` attribute (resized to a high water mark) that can be shared between all layers, instead of generating one for each layer (could give a 20-25% boost in attribute update time for many layers, in addition to obvious memory savings).
- [ ] Use single interleaved WebGL buffers with offsets and strides separating attributes (may only give <5% improvement on modern GPUs)
- [x] Pack colors and picking colors as Uint8s instead of Float32s
- [x] Allow apps to pre generate and pass in WebGL `Buffers` (not just typed arrays) as props.

### GeoJsonLayer etc optimizations
- [ ] Eliminate high cost of geojson splitting for Paths and Polygons
    - [ ] Make PathLayer support multipaths, and empty paths
    - [ ] Make SolidPolygonLayer support multipolygons, and empty polygons
    - [ ] Make GeoJson pass through unmodified `FeatureCollection` to `PathLayer` and `SolidPolygonLayer`
- [ ] Improve Tesselation support to ensure custom geometries are built in most efficient way.

### Layer lifecycle optimizations 
- [ ] Separate changeFlag dirtying from layer updates
- [ ] Disable attribute updates for non-visible layers (requires previous)
- [x] Disable CompositeLayer.renderLayers on shouldUpdate returns false (i.e. reuse layers from last render)
- [x] Allow reuse of layers and optimize Layer matching accordingly (see #257)
- [x] Layer matching - Use a map to match layer ids vs. repeated linear searches O(N) vs O(N2)

### Picking
- [ ] Allow the app to control what type of picking a layer supports (e.g. hover vs. click vs. none) - as hovering over a very large layer can cause noticeable CPU activity, while clicks are much less frequent.
- [ ] Under WebGL2, use WebGLBuffer for `readPixels` to reduce GPU roundtrip costs.
- [ ] Mode that disables picking during pan and zoom operations?
- [ ] Document how to override default color based picking, for layers that can provide more efficient mathematical implementations (e.g. regular tilings like grid and hexagons layers).
- [x] Allow multiple layers to render picking colors into the same framebuffer, so that we only need one (or at least fewer) expensive calls to `gl.getPixels`
- [x] Reuse framebuffer between picking operations.

### Effects
- [ ] Provide another appropriately resized framebuffer or texture as common scratch pad area, to avoid each effect allocating its own?
- [ ] Refactor life cycle management so that effects can also use it?

### API optimizations
- [ ] Animation mode - allow some uniforms to be updated between WebGL frames without requiring passing new layers to deck.gl.
- [ ] Expose AttributeManager to apps - so that apps can precalculate attributes, and reuse buffers that are shared between layers.

