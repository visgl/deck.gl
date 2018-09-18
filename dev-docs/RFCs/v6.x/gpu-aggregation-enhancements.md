# RFC: GPU Aggregation enhancements

* **Authors**: Ravi Akkenapally
* **Date**: Sep 2018
* **Status**: **Review**

## Problem

`GPUGridAggregator` needs to support min/max/mean operation and ability to aggregate multiple weights. Current version only supports sum operation on a single weights array. This enhancement makes aggregator more scalable and supports use cases such as GridLayer and HexagonLayer, which require aggregation on two different set of weights, with different aggregation operation, one for Color and one for Elevation calculation.

NOTE: `GPUGridAggregator` is currently an experimental API.


## Proposed

Multiple weights can be supported by internally maintaining a separate texture (used as render target) for each weights array. For each weights array, we set required blend modes based on requested aggregation operation and perform render calls and collect aggregated data into corresponding texture. We could use `Multiple Render Target` feature to perform single draw for aggregating multiple weights, but WebGL2 **does not** support blending per render target, blend setup is global and applies to all render targets. Users can still use `size` parameter, as described below, to pack more than one weight (up to 3) and aggregate all of them with single draw call, provided, aggregation operation is same for all of them.


### Update `run` method

The public API that needs to change is `run()` method. We change input arguments and return object contents. Current style can still be supported as deprecated.

#### weights arguments

Update `run` method to accept weights as an array of objects with following values. Each object will result in one aggregation cycle.

  * id (String) : used to identify the corresponding aggregation buffer and texture in return object. Must be unique for each weights object.
  * values (Array) : ArrayBufferView with weight values.
  * size (Number, default: 1, minValue: 1, maxValue: 3) : Size of a single weight instance. Determines how many distinct weights exist in the array.
  * operation (Enum {SUM, MEAN, MIN or MAX}, default: SUM) : Defines aggregation operation.
  * needMinMax (Boolean, default: false) : when true additional aggregation steps are performed to calculate total min and max aggregation values.
  * combineMinMax (Boolean, default: false) : Applicable only when `needMinMax` is set. When true, both min and max values are calculated in single aggregation step, but only does this for first weight (i.e if `size` is 2 or 3, min and max values are calculated only for first weight)

Existing single weight array can be supported as deprecated by internally converting it into an array with single object, {id: 'weights', values: weights, needMinMax: true, combineMinMax: true}.

Other than `weights` all other arguments to `run` remain same.

#### return object

Result of `run` is an array of objects with one object corresponds to an object in `weights` array parameter. Each object contains following values

  * aggregationBuffer (Buffer) : Aggregated values per grid cell, aggregation is performed as per specified `operation`. Size of the buffer is 4, with R, G and B channel corresponds to aggregated weights. When input `size` is < 3, G or B channels contain undefined values. A channel contains count of points aggregated into this cell.

  * aggregationTexture (Texture, optional) : When aggregation is performed on GPU, contains above data as form of texture, useful for applications that want to consume the a texture instead of buffer. This value is `null` when aggregation is performed on CPU.

  * minBuffer (Buffer, optional) : Contains data for one pixel with R, G, B and A channels contain min value of all aggregated grid cells. When aggregation is performed on CPU, `minBuffer` is `null` but `minData` Array is returned with same data. This value is `null` when `needMinMax` is false.

  * maxBuffer (Buffer, optional) : Contains data for one pixel with R, G, B and A channels contain max value of all aggregated grid cells. When aggregation is performed on CPU, `maxBuffer` is `null` but `maxData` Array is returned with same data. This value is `null` when `needMinMax` is false.

  * minMaxBuffer (Buffer, optional) : Contains data for one pixel, with R channel contains min value of all aggregated grid cells and A channel contains max value of all aggregated grid cells. When `combineMinMax` is `false` this value will be `null`.

  Note: `minBuffer`, `maxBuffer` and `minMaxBuffer` are usually consumed by setting them as uniform buffer object or read by the CPU.


### Implementation

#### weights aggregation

Aggregator internally maintains one texture for each weights object and performs one aggregation loop for each weights object. One aggregation loop (involves setting up Framebuffer object and one draw). Weight values are written into R, G and B channels and a value 1.0 into A channel for count. `blendEquation` is set to [`op`, `gl.SUM`], where `op` is `gl.SUM`, `gl.MIN` or `gl.MAX` based on user provided `operation` parameter.

If `needMinMax` is set another aggregation loop is performed on above results, more details discussed below.

Once aggregation is performed this data is asynchronously read into corresponding buffer before proceeding to the next weights object.


#### MEAN operation

`MIN`, `MAX` AND `SUM` operations can be directly calculated using corresponding `blendEquation`. For calculating `MEAN`, we first need to calculate sums and counts. Then divide each grid cell's sum with corresponding count. We can perform aggregation using `SUM`, and then we can run simple division operation on GPU using `Transform` class like below :

```
 ...

 const {sumBuffer} = aggregationResults;

 const transform = new Transform(gl2, {
   sourceBuffers: {
     inValue: sumBuffer
   },
   vs: `\
#version 300 es
in vec4 inValue;
out vec4 outValue;

void main()
{
  // count is in 'w' channel.
  outValue.xyz = inValue.xyz/inValue.w;
},
   feedbackMap: {
     inValue: 'outValue'
   },
   varyings: ['outValue'],
   elementCount
 });

 const meanBuffer = transform.getBuffer('outValue');

```

Applications can also avoid this step by using `SUM` as operation and then calculating mean as above in applications shader. But this option is provide as convenience.


### needMinMax and combineMinMax

When `needMinMax` set to true, data is aggregated into single pixel to calculate min and max values of weights. Two separate rendering operations are performed, one with setting `blendEquation = gl.MIN` and the other with `blendEquation = gl.MAX`. Resulting data is stored in two separate buffers `minBuffer` and `maxBuffer`. If the `size` was set to 3, each channel in these buffer corresponds to min and max values of these weights. Alpha channel is always used for count.

When `combineMinMax` is set to true, we avoid second render operation by setting `blendEquation = [gl.MIN, gl.MAX]`, but caveat here is it only supported when size = 1.


## conclusion

This change provides more flexible API to customize aggregation in terms of aggregation operations and whether to perform additional aggregation steps to calculate min/max values. And also allows multiple weights to be aggregated in single `run()` call.
