# RFC: GPU based screen grid aggregation

* **Authors**: Ravi Akkenapally
* **Date**: Feb 2018
* **Status**: **Implemented**

## Problem

Given a set of points we need to render a grid on the screen, where color of each cell is a linear function of number of points that fall into the cell. We first project the points to the screen and then aggregate them by the cell they fall into.

## Status Quo

In existing ScreenGridLayer, projections and aggregation are performed on CPU, where each point is processed sequentially, and resulting data is set as an attribute to render the grid cells with correct color.

## Proposed

Current solution can be optimized by performing projection and aggregation on GPU. Multiple points can be processed in parallel and the result of aggregation can stay in GPU memory and be consumed by the rendering cycle of grid cells. This approach is faster than implementing this sequentially on CPU and then transferring data to GPU.

A new class ‘GPUGridAggregator’ will be added that takes points data and grid dimensions as input and performs aggregation. Aggregation can be requested on GPU or CPU, when requested on GPU and current browser supports all required WebGL features, aggregation will be performed on GPU otherwise it is performed on CPU. Result of aggregation is WebGL Buffer objects which can be set as attributes or uniforms (uniform buffer objects).

### constructor()

‘ScreenGridAggregator’ constructor takes following arguments and constructs an object.

* gl (WebGLContext) : used for querying WebGL features and creating required webgl resources.
* opts (Object) : Optionally contains and ‘id’ and ‘sahderCache’ object for caching/re-using shaders.


### run()

Performs aggregation either on CPU or GPU based on the provided options and browser’s WebGL capabilities.

Input:
* positions (Array) : Array of points in world space (lng, lat).
* positions64xyLow (Array) : Array of low precision values of points in world space (lng, lat).
* weights  (Array, optional, default: null) : Array of weights, if null, a default weight of 1 is used for all points.
* cellSize: (Array) : Size of the cell, cellSize[0] is width and cellSize[1] is height.
* width: (Number, Optional) : Grid width in pixels, deduced from ‘viewport’ when not provided.
* height: (Number, Optional) : Grid height in pixels, deduced from ‘viewport’ when not provided.
* viewport: (Object, Viewport) : Contains size of viewport and also used to perform projection.
* useGPU: (Boolean, optional, default: true) : When true and browser supports required WebGL features, aggregation is performed on GPU, otherwise on CPU.
* changeFlags: (Object, Optional) : Object with following keyed values, that determine whether to re-create internal WebGL resources for performing aggregation compared to last run. If no value is provided, all flags are treated to be true.
	* dataChanged (Bool) : should be set to true when data is changed.
	* viewportChanged (Bool) : should be set to true when viewport is changed.
	* cellSizeChagned (Bool) : should be set to true when cellSize is changed.
* countsBuffer: (Buffer, optional) : used to update aggregation data per grid, details in Output section.
* maxCountBuffer: (Buffer, optional) : used to update total aggregation data, details in Output section.
* projectPoints (Bool) : when true performs aggregation in screen space.
* gridTransformMatrix (Mat4) : used to transform input positions before aggregating them (for example, lng/lat can be moved to +ve range, when doing world space aggregation, projectPoints=false).

### Output
* results(Object): Contains following Buffer objects. If these buffers are not provided to the method, new Buffers with enough size are created and returned.
  * countsBuffer (Buffer): Buffer object that contains one element (4 floats) for each grid-cell. Each element contains following data:
	* Red channel : number of points aggregated to this cell.
	* Green channel : total weight of all points aggregated to this cell.
	* Blue and Alpha channels are not used.
  * maxCountBuffer (Buffer) : Buffer object with one element (4 floats) containing following values.
	* Red channel : total number of aggregated points, any points that are outside of viewport bounds are not included.
	* Green channel : total weight of all aggregated points.
	* Apha channel : maximum weight of all grid cells.
	* Blue channel is not used.

### Sample Code

Performing aggregation on CPU:

```
 const opts = {
  positions, // (lng, lat) array
  weights,
  cellSize,
  viewport,
  useGPU: false
 };

  const sa = new ScreenGridAggregator(gl);
  const result = sa.run(opts);

  //result contains Buffer object with aggregated data.
```

Performing aggregation on GPU and reading back results:

```
 const opts = {
  positions, // (lng, lat) array
  weights,
  cellSize,
  viewport,
  useGPU: true
 };

  const sa = new ScreenGridAggregator(gl);
  const result = sa.run(opts);

  //result contains Buffer object with aggregated data.
```

## Implementation

### Aggregation on CPU

This will match with current implementation where each point is first projected using current viewport then depending on which cell the pint belongs corresponding counter, and weight value are updated, this data is used to create Buffer objects that are returned.

### Aggregation on GPU

Aggregation is implemented by rendering all points to a framebuffer using custom shaders and additive blending. Then these textures are asynchronously read into provided Buffer objects (without doing CPU adn GPU sync) and returned.

#### Aggregation to Grid cells

A float texture with R32F format with size equal to the grid is created. Each cell is represented by one pixel in this texture. Blending is set to “gl.FUNC_ADD’” , so every time a pixel at this location is rendered, the existing pixel color and current color being rendered are added and stored at this pixel.
Provided ‘positions’ and ‘weights’ are set as attributes, and grid params such as ‘cellSize’, and ‘gridSize’ as set as uniforms. Projection matrix is retirieved from “viewport” object and also set as uniforms.
In vertex shader we first perform viewport projections on point position, then it will be converted to grid coordinate. Finally the position is moved to pixel center to guarantee the correct pixel is rendered.

```
  vec2 windowPos = project_position(positions);
  windowPos = project_to_pixel(windowPos);

  // Transform (0,0):windowSize -> (0, 0): gridSize
  vec2 pos = floor(windowPos / cellSize);

  // Transform (0,0):gridSize -> (-1, -1):(1,1)
  pos = (pos * (2., 2.) / (gridSize)) - (1., 1.);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);
```


In Fragment shader we output 1.0 for red channel and weight of the point (passed as varying from vertex shader) for green channel.

```
  gl_FragColor = vec4(1., vWeights, 0, 0.0);
```

Blending is set to ‘gl.FUNC_ADD’ so after rendering all points, each pixels red channel contains total number points and green channel contains total weight of all points that are accumulated into corresponding grid cell.

#### Finding out maximum and total weights(Optional)

To find out maximum weight in any given cell and total number of points and total weight, we can do another round of rendering step. In this step, a single point is rendered for each grid-cell, count is obtained by sampling render target texture from above step and passed to Fragment shader. Render target format is set to RGBA32F texture, and use blendEquationSeperate to set ‘gl.FUNC_ADD’ for RGB channels and ‘gl.MAX’ for Alpha channel. At end of the rendering step red channel will contain total point count,  green channel contains total weight, and alpha channel contains maximum weight. Based on these values, we can also calculate average weight value for each grid cell.

Vertex shader maps every vertex to same location, and passes down texture coordinates to Fragment shader.

```
attribute vec2 positions;
attribute vec2 texCoords;
varying vec2 vTextureCoord;
void main(void) {
  // Map each position to single pixel
   gl_Position = vec4(-1.0, -1.0, 0.0, 1.0);

  vTextureCoord = texCoords;
}
```

Fragment shader obtains the count for each grid-cell by sampling the texture generated in first step. Fragment color is generated with both Red and Alpha channel containing the count value.

```
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  // Red: total count, Green: total weight, Alpha: maximum weight
  gl_FragColor = vec4(textureColor.r, textureColor.g, 0., textureColor.g);
}
```

## Integration

“GPUAggregator” class returns aggregation data in “Buffer” objects.
countsBuffer : This Buffer object contains count and weight of each grid, this can be set as an attribute to layer’s vertex shader.
maxCountBuffer : This Buffer object contains total count, total weight and max weight values. These values don’t change per grid cell, and this Buffer can be set as Uniform Buffer object.
In layer’s vertex shader, above data can be used to determine color the cell, that represents the amount of data aggregated to this cell.

## Validation

### Validation by reading data from output Buffer objects

Following unit tests will be written to verify the aggregation results, that include count and weight for each cell, maximum weight of all cells and total number of points aggregated.
A known set of input points aggregated using GPU and results are verified.
A random large set of input points will be aggregated once using CPU and once using GPU and results will be compared for equality.

### Validation using full render cycle

A new layer “GPUScreenGridLayer” will be added, and a new render test case will be added taking same set of parameters as existing “ScreenGridLayer”. The output of the new layer will be compared against existing core layer golden-image.

## Performance

### Performance can be measured in following two ways

* A Bench test is added the compares aggregation times between GPU and CPU. When aggregation is performed on GPU, GPU and CPU will be synced by calling “Buffer.getData()”. As shown in table below, GPU Aggregation is 4.0 to 4.6 times faster. But in real world use cases, GPU consumes this Buffer data without syncing with GPU, hence actual speed benefits will be more than this.

```
100 thousand random points:
├─ CPU 100K: 8.26 iterations/s
├─ GPU 100K: 32.3 iterations/s

1 Million random points:
├─ CPU 1M: 1.03 iterations/s
├─ GPU 1M: 4.76 iterations/s
```

* “GPUScreenGridLayer” is rendered and FPS is compared while performing zoom in/out operations. Every time a zoom is changed, it triggeres projection and aggregation of all input points. These are the observed FPS numbers.

```
1 Million points:
GPU: 50 - 53 FPS
CPU:  2 - 3 FPS

5 Million points:
GPU: 30 - 38 FPS
CPU: 0 -1 FPS

10 Million points:
GPU: 15 - 20 FPS
CPU: UI is completely blocked and doesn't respond.
```

Above numbers show GPU Aggregation can be 25 to 30 times faster.

## Exploration of GPGPU Frameworks

Existing GPGPU frameworks such as [gpu.js](https://github.com/gpujs/gpu.js) and [deeplearnjs.org](https://deeplearnjs.org/index.html) provide interface to perform basic vector operations using Arrays and Matrices. Such operations are performed on GPU using float textures and shaders. The Aggregation problem this RFC is addressing requires customization of entire GPU pipeline (operations at camera or screen space, multiple render passes, custom blending and custom vertex and fragment shaders), which are not addressable above mentioned frameworks.

## Limitations

### Picking (Can be worked around)

Picking information is not available. CPU aggregation maintains list of all aggregated points in a JS object, which is accessible based on instance index. This data can't be saved using GPU aggregation. Alternatively, with additional texture reads (based on current mouse position, or [lng, lat]) we can provide aggregated value and count as picking information. (i.e. when user hovers over a grid-cell, picking information can only contain the aggregated value, and aggregation count of that cell). If we want to match existing picking information, a CPU aggregation has to be performed , may be we can provide this information on demand, like when user does a mouse-click.

### Shader Module integration (Solvable)

“GPUGridAggregator” returns it results in form of Buffers, one Buffer is used as attribute to provide vertex data and another Buffer is used as Uniform Buffer Object (UBO) to provide uniforms. UBO is supported only in Shading Language version 3.0, and layers shaders have to be upgraded to this version. When that is done, existing Shader Modules (like, “picking” , “projection” etc) can not be used due to incompatibility between 1.0 and 3.0 Shading Language versions. (https://github.com/visgl/deck.gl/issues/1592). This is not a limitation if we make color not depend on maxCount/maxWeight values (by using ‘colorRange’ and ‘colorDomain’ instead of ‘minColor’ and ‘maxColor’);

### “lowerPercentile” and “upperPercentile” (Should fallback to CPU)

When this is extended to Grid and Hexagon layers, these props can't be supported. This requires first sorting all bins based on a aggregated value. For GPU we have  to enforce these values to 0 and 100 respectively.
