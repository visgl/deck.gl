# RFC: GPU Aggregation enhancements

* **Authors**: Ravi Akkenapally
* **Date**: Sep 2018
* **Status**: **Implemented**

## Abstract

`GPUGridAggregator` needs to support min/max/mean operation and ability to aggregate multiple weights. Current version only supports sum operation on a single weights array. This RFC proposes an enhancement to make aggregator more scalable and supports use cases such as GridLayer and HexagonLayer. These layers require aggregation on two different set of weights, with different aggregation operation, one for Color and one for Elevation calculation.

NOTE: `GPUGridAggregator` is currently an experimental API.


## Proposed

Multiple weights can be supported by internally maintaining a separate texture (used as render target) for each weights array. For each weights array, we set required blend modes based on requested aggregation operation and perform render calls and collect aggregated data into corresponding texture. We could use `Multiple Render Target` feature to perform single draw for aggregating multiple weights, but WebGL2 **does not** support blending per render target, blend setup is global and applies to all render targets. Users can still use `size` parameter, as described below, to pack more than one weight (up to 3) and aggregate all of them with single draw call, provided, aggregation operation is same for all of them.


### Update `run` method

The public API that needs to change is `run()` method. We change input arguments and return object contents. Current style can still be supported as deprecated.

#### weights arguments

Update `run` method to accept weights object, that contains one keyed object for each weight. Each such object will result in one aggregation cycle. `key` of the object works as an identifier and value object contains following values.

  * `values` (Array, Float32Array or Buffer) : Contains weight values for all points, there should be 3 floats for each point, un-used values can be 0.
  * `size` (Number, default: 1, minValue: 1, maxValue: 3) : Size of a single weight instance. Determines how many distinct weights exist in the array.
  * `operation` (Enum {SUM, MEAN, MIN or MAX}, default: SUM) : Defines aggregation operation.
  * `needMin` (Boolean, default: false) : when true additional aggregation steps are performed to calculate minimum of all aggregation values and total count, result object will contain minBuffer.
  * `needMax` (Boolean, default: false) : when true additional aggregation steps are performed to calculate maximum of all aggregation values and total count, result object will contain maxBuffer.
  * `combineMaxMin` (Boolean, default: false) : Applicable only when `needMin` and `needMax` are set. When true, both min and max values are calculated in single aggregation step using `blendEquationSeparate` WebGL API. But since Alpha channel can only contain one float, it will only provide minimum value for first weight in Alpha channel and RGB channels store maximum value upto 3 weights. Also when selected total count is not availabe. Result object will contain maxMinBuffer.

NOTE: Existing array support for `weights` is no longer supported, note this doesn't effect any public API, just the internal/experimental API change only.

Other than `weights` all other arguments to `run` remain same.

#### return object

Result of `run` is an object, where key represents `id` of the weight and value contains following aggregated data.

  * `aggregationBuffer` (Buffer) : Aggregated values per grid cell, aggregation is performed as per specified `operation`. Size of the buffer is 4, with R, G and B channel corresponds to aggregated weights. When input `size` is < 3, G or B channels contain undefined values. Alpha channel contains count of points aggregated into this cell. (R: weight#1 G: weight#2 B: weight#3 A: count)

  * `aggregationTexture` (Texture) : When aggregation is performed on GPU, contains above data as form of texture, useful for applications that want to consume the texture instead of buffer. This value is `null` when aggregation is performed on CPU.

  * `minBuffer` (Buffer, optional) : Contains data for one pixel with R, G, B and A channels contain min value of all aggregated grid cells. When aggregation is performed on CPU, `minBuffer` is `null` but `minData` Array is returned with same data. This value is `null` when `needMin` is false. (R: weight#1 min value G: weight#2 min value B: weight#3 min value A: total count)

  * `maxBuffer` (Buffer, optional) : Contains data for one pixel with R, G, B and A channels contain max value of all aggregated grid cells. When aggregation is performed on CPU, `maxBuffer` is `null` but `maxData` Array is returned with same data. This value is `null` when `needMax` is false. (R: weight#1 max value G: weight#2 max value B: weight#3 max value A: total count)

  * `maxMinBuffer` (Buffer, optional) : Contains data for one pixel, with RGB channels contains max value of all aggregated grid cells and A channel contains minimum value of all aggregated grid cells. When `combineMaxMin` is `false` this value will be `null`. (R: weight#1 max value G: weight#2 max value B: weight#3 max value A: weight#1 min value)

  NOTE: `minBuffer`, `maxBuffer` and `maxMinBuffer` are usually consumed by setting them as uniform buffer object or read by the CPU.

  NOTE: Aggregation result is always in `Buffer` objects to provide common API irrespective of whether aggregation is performed on CPU or GPU. `Texture` objects are provided when aggregation is done on GPU, and `Array` objects are provided when aggregation is performed on CPU.

### Other options

Following new field will be added for additional customization

#### createBufferObjects (Boolean, default: true)

Only applicable when aggregation is performed on CPU. When set to false, aggregated data is not uploaded into Buffer objects. In a typical use case, Applications need data in `Buffer` objects to use them in next rendering cycle, hence by default its value is true, but if needed this step can be avoided by setting this flag to false.

### Implementation

#### weights aggregation

Aggregator internally maintains one texture for each weights object and performs one aggregation loop for each weights object. One aggregation loop (involves setting up `Framebuffer` object and one draw). Weight values are written into R, G and B channels and a value 1.0 into A channel for count. `blendEquation` is set to [`op`, `gl.SUM`], where `op` is `gl.SUM`, `gl.MIN` or `gl.MAX` based on user provided `operation` parameter.

If `needMin` or `needMax` are set additional aggregation loops are performed on above results, more details discussed below.

Once aggregation is performed this data is asynchronously read into corresponding buffers before proceeding to the next weights object.


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


### Total maximum and minimum values

When `needMin` or `needMax` set to true, data is aggregated into single pixel to calculate min and max values of weights. Two separate rendering operations are performed, one with setting `blendEquation = gl.MIN` and the other with `blendEquation = gl.MAX`. Resulting data is stored in two separate buffers `minBuffer` and `maxBuffer`. If the `size` was set to 3, each channel in these buffer corresponds to min and max values of these weights. Alpha channel is always used for count.

When `combineMaxMin` is set to true, we avoid second render operation by setting `blendEquation = [gl.MAX, gl.MIN]`.


## conclusion

This enhancement provides more flexible API to customize aggregation in terms of aggregation operations and whether to perform additional aggregation steps to calculate min/max values. And also allows multiple weights to be aggregated in single `run()` call.
