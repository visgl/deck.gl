# GPUGridAggregator Class (Advanced) (WebGL2)

`GPUGridAggregator` performs grid aggregation on GPU. Aggregation can be performed either in world space or in screen space.

# Usage (Aggregation in World space)
```
const aggregator = new GPUGridAggregator(device);

const results = aggregator.run({
  attributes, // position and weight attributes
  weights: {
    weight1: {
      operation: AGGREGATION_OPERATION.MEAN,
      needMax: true,
    }
  },
  cellSize: [50, 50],
  width: 500,
  height: 500
});

// results.weight1.aggregationBuffer contains, one aggregated value for each grid cell, which is equal to mean weight of all sample points that fall into that grid cell.  
// results.weight1.maxBuffer contains max mean value of all grid cells.

```

# Usage (Aggregation in Screen space)

You can also perform aggregation in screen space by provide a viewport and set `projectPoints` to true. Aggregator will first project positions and then aggregate them in screen space.

```
const aggregator = new GPUGridAggregator(device);

const results = aggregator.run({
  attributes, // position and weight attributes
  weights: {
    weight1: {
      operation: AGGREGATION_OPERATION.MEAN,
      needMax: true,
    }
  },
  cellSize: [50, 50],
  width: 500,
  height: 500,
  viewport,
  projectPoints: true
});

// results.weight1.aggregationBuffer contains, one aggregated value for each grid cell, which is equal to mean weight of all sample points that fall into that grid cell.  
// results.weight1.maxBuffer contains max mean value of all grid cells.

```

## Methods

### constructor

‘ScreenGridAggregator’ constructor takes following arguments and constructs an object.

* device (WebGLContext) : used for querying WebGL features and creating required webgl resources.
* opts (Object) : Optionally contains and ‘id’ and ‘sahderCache’ object for caching/re-using shaders.


### run

Performs aggregation either on CPU or GPU based on the provided options and browser’s WebGL capabilities.

```js
const results = gpuGridAggregator.run({
  positions,
  weights,
  cellSize: [5, 5],
  viewport,
  changeFlags,
  projectPoints: true,
  translation,
  scaling
});
```

Parameters:
* positions (Array) : Array of points in world space (lng, lat).
* weights  (Object) : Object contains one or more weights. Key represents id and corresponding object represents the weight. Each weight object contains following values:

  * `values` (Array, Float32Array or Buffer) : Contains weight values for all points, there should be 3 floats for each point, un-used values can be 0.
  * `size` (Number, default: 1, minValue: 1, maxValue: 3) : Size of a single weight instance. Determines how many distinct weights exist in the array.
  * `operation` (Enum {SUM, MEAN, MIN or MAX}, default: SUM) : Defines aggregation operation.
  * `needMin` (Boolean, default: false) : when true additional aggregation steps are performed to calculate minimum of all aggregation values and total count, result object will contain minBuffer.
  * `needMax` (Boolean, default: false) : when true additional aggregation steps are performed to calculate maximum of all aggregation values and total count, result object will contain maxBuffer.
  * `combineMaxMin` (Boolean, default: false) : Applicable only when `needMin` and `needMax` are set. When true, both min and max values are calculated in single aggregation step using `blendEquationSeparate` WebGL API. But since Alpha channel can only contain one float, it will only provide minimum value for first weight in Alpha channel and RGB channels store maximum value up to 3 weights. Also when selected total count is not available. Result object will contain maxMinBuffer.

* cellSize: (Array) : Size of the cell, cellSize[0] is width and cellSize[1] is height.
* width: (Number, Optional) : Grid width in pixels, deduced from ‘viewport’ when not provided.
* height: (Number, Optional) : Grid height in pixels, deduced from ‘viewport’ when not provided.
* viewport: (Object, Viewport) : Contains size of viewport and also used to perform projection.
* changeFlags: (Object, Optional) : Object with following keyed values, that determine whether to re-create internal WebGL resources for performing aggregation compared to last run. If no value is provided, all flags are treated to be true.
	* dataChanged (Bool) : should be set to true when data is changed.
	* viewportChanged (Bool) : should be set to true when viewport is changed.
	* cellSizeChagned (Bool) : should be set to true when cellSize is changed.
* countsBuffer: (Buffer, optional) : used to update aggregation data per grid, details in Output section.
* maxCountBuffer: (Buffer, optional) : used to update total aggregation data, details in Output section.
* projectPoints (Bool) : when true performs aggregation in screen space.
* translation (Array) : [xOffset, yOffset], used to translate input positions before aggregating them (for example, lng/lat can be moved to +ve range).
* scaling (Array) : [xScale, yScale, isScalingValid] : `xScale`, `yScale` define scaling to be applied before aggregating. Scaling is applied only when `isScalingValie` is > 0.
* createBufferObjects (Bool, options, default: true) : Only applicable when aggregation is performed on CPU. When set to false, aggregated data is not uploaded into Buffer objects. In a typical use case, Applications need data in `Buffer` objects to use them in next rendering cycle, hence by default its value is true, but if needed this step can be avoided by setting this flag to false.

NOTE: When doing screen space aggregation, i.e projectPoints is true, `translation` and `scaling` should be set to transformation required for camera space (NDC) to screen (pixel) space.

Returns:
* An object, where key represents `id` of the weight and value contains following aggregated data.

  * `aggregationBuffer` (Buffer) : Aggregated values per grid cell, aggregation is performed as per specified `operation`. Size of the buffer is 4, with R, G and B channel corresponds to aggregated weights. When input `size` is < 3, G or B channels contain undefined values. Alpha channel contains count of points aggregated into this cell. (R: weight#1 G: weight#2 B: weight#3 A: count)

  * `aggregationTexture` (Texture) : When aggregation is performed on GPU, contains above data as form of texture, useful for applications that want to consume the texture instead of buffer. This value is `null` when aggregation is performed on CPU.

  * `minBuffer` (Buffer, optional) : Contains data for one pixel with R, G, B and A channels contain min value of all aggregated grid cells. When aggregation is performed on CPU, `minBuffer` is `null` but `minData` Array is returned with same data. This value is `null` when `needMin` is false. (R: weight#1 min value G: weight#2 min value B: weight#3 min value A: total count)

  * `minTexture` (Texture2D, optional) : Texture2D object (1X1 size with RGBA_FLOAT_32 format) contains same data as `minBuffer`.

  * `maxBuffer` (Buffer, optional) : Contains data for one pixel with R, G, B and A channels contain max value of all aggregated grid cells. When aggregation is performed on CPU, `maxBuffer` is `null` but `maxData` Array is returned with same data. This value is `null` when `needMax` is false. (R: weight#1 max value G: weight#2 max value B: weight#3 max value A: total count)

  * `maxTexture` (Texture2D, optional) : Texture2D object (1X1 size with RGBA_FLOAT_32 format) contains same data as `maxBuffer`.

  * `maxMinBuffer` (Buffer, optional) : Contains data for one pixel, with RGB channels contains max value of all aggregated grid cells and A channel contains minimum value of all aggregated grid cells. When `combineMaxMin` is `false` this value will be `null`. (R: weight#1 max value G: weight#2 max value B: weight#3 max value A: weight#1 min value)

  * `maxMinTexture` (Texture2D, optional) : Texture2D object (1X1 size with RGBA_FLOAT_32 format) contains same data as `maxMinBuffer`.

  NOTES:
  * `minBuffer`, `maxBuffer` and `maxMinBuffer` are usually consumed by setting them as uniform buffer object or read by the CPU.
  * Aggregation data per cell,  is always in `Buffer` objects to provide common API irrespective of whether aggregation is performed on CPU or GPU.
  * Min-max aggregation results is provided in form of `Texture2D` and `Buffer` objects whether aggregation is performed on CPU or GPU.
  * When aggregation is performed on CPU, min-max  aggregation results are also provided in form of Float32Arrays.


### getData

Reads aggregation results from GPU memory (Buffer) to CPU memory (Typed Arrays).

```js
const aggregationResults = gpuGridAggregator.getData('weightId');
```

Parameters:
  * `weightId` (String) : `id` of the weight for which aggregation data is needed.

Returns:
An object with aggregation results in CPU memory (Typed Arrays). Returned object contains following values :
  * `aggregationData` : Aggregated data per grid cell.
    Following additional arrays exist if they were requested when aggregation is performed.
  * `minData` : Min aggregation results.
  * `maxData` : Max aggregation results.
  * `maxMinData` : Combined max min aggregation results.

Note:
When aggregation is performed on GPU, `getData` performs Buffer read and can potentially an expensive operation due to CPU and GPU sync, in such cases data is also cached to avoid reading from GPU memory for subsequent calls.
