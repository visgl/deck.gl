# RFC: Thoughts on binary attribute generation

## Proposal: "Official" metric unit for deck.gl

Megarows/second.

We use this when we talk about attribute generation and rendering:

## Proposal: Add benchmarks for full layer regeneration from big data.

| Layer             | Full regeneration | color regeneration |
| LineLayer:        | 10Mrows/second    | 30Mrows/second     |
| ScatterplotLayer  | 12Mrows/second    | |

## Proposal: add and `unit` and `iterations` props to `Probe.bench`

This way we can get benchmark output specified directly in `Mrows/s`.

Or maybe we can just use a custom `Bench` formatter?



### Proposal: Use TransformFeedback for generating attributes from binary data

We are extending the JS accessor system to handle "bundles" of binary data (columns).

* Binary data transformation to attributes is a "canonical use case" for TransformFeedback.
* The initial setup would generate a custom shader that maps inputs to outputs
* Using transform feedback we might be able to present numbers in the Gigarows/second for the binary case!

The specification of how the binary input columns map to the attribute arrays could be done in a couple of different ways:

* We could allow the layer to write snippets of GLSL code describing the mapping. This might be a possible first use case for (a variant of) the GLSL accessor RFC?
* We could provide a simple abstract operation system (similar to arrow predicates) that would allow the user to pick columns without coding.

```
getColor: [Column('intensity'), Column('intensity'), Column('intensity'), Constant(255)]
```



### Proposal: Do NOT support a JS API for generating attributes from binary data

For custom cases (presumed "rare"), JS code could of course still be needed to transform the binary data.
* However, the JS API for iterating over binary data is quite "clunky"
* It is questionable how much use the JS solution would see if we implement transform feedback as the main solution for the binary input data case.
* The JS solution adds complexity to the attribute iteration system.
* After all, the app can do its own data preprocessing and doesn't necessarily need to do it using an accessor.
* Especially as the Transform class now provides Texture fallbacks to cover the WebGL1 case.


It might be better to provide some general utilities for working with binary arrays rather than build it into the already highly complex attribute management system.


## Improved 64 bit support

Provide support for default handling of 64-bit attributes in AttributeManager, to let us remove numerous duplicated instance generation functions

Add an `fp64low` flag to AttributeManager.add().

Add a new path to `attribute.js` that `fp64lowPart`s the code.
```js
  _updateBufferViaStandardAccessor(data, props) {
    const state = this.userData;

    const {accessor} = state;
    const {value, size, fp64low} = this;
    const accessorFunc = props[accessor];

    assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);

    let i = 0;

    if (fp64low) {
      for (const object of data) {
        const objectValue = accessorFunc(object);
        this._normalizeValue(objectValue, value, i);
        this._fp64low(objectValue);
        i += size;
      }
    } else {
      for (const object of data) {
        const objectValue = accessorFunc(object);
        this._normalizeValue(objectValue, value, i);
        i += size;
      }
    }
    this.update({value});
  }
```



## Remove Unnecessary Custom Attribute Generators

By adding support for 64-bit attributes in Attribute Manager we can remove the majority of custom attribute generators

Layers that will no longer need custom attribute generators:

| Layer              | Custom Attribute Generators         | Replacement   |
| ---                | ---                                 | ---           |
| `ArcLayer`         | calculateInstancePositions, calculateInstancePositions64Low | Rewrite to use `instanceSourcePositions64`, `instanceTargetPositions64` |
| `BitmapLayer`      | `calculatePositions`, `calculatePositions64xyLow` | Non-standard input format? Rewrite? |
| `GridCellLayer`    | `calculateInstancePositions64xyLow` | Rewrite to use `instancePositions64` |
| `HexagonCellLayer` | `calculateInstancePositions64xyLow` | Rewrite to use `instancePositions64` |
| `LineLayer`        | `calculateInstancePositions64xyLow` | Rewrite to use `instancePositions64` |
| `PointCloudLayer`  | `calculateInstancePositions64xyLow` | Rewrite to use `instancePositions64` |
| `ScatterplotLayer` | `calculateInstancePositions64xyLow` | Rewrite to use `instancePositions64` |
| `LineLayer`        | `calculateInstancePositions64xyLow` | Rewrite to use `instancePositions64` |


Layers that still actually need custom attribute generators:

| Layer              | Custom Attribute Generators         | Comment   |
| ---                | ---                                 | ---           |
| `MultiIconLayer`   | calculateInstanceOffsets            | |
| `ScreenGridLayer`  | calculateInstancePositions, calculateInstanceCounts ||


## Variable Primitive Layers

Tesselating layers (PathLayer and SolidPolygonLayer) have separate issues that are not addressed in this RFC.




### Support Float64Arrays

To allow high precision coordinates to be efficiently handled in binary (columnar) input data, `Float64Array` should be a supported input type and should be a valid input to a 64 bit attribute:

The function that populates attributes


`Float64Array` values cannot be manipulated in shaders, the splitting into 32 bit components must be done in JS. Once that is done, the data becomes amenable to shader use, including transform feedback to preprocess accessor. So we want a highly optimized JS function to split 64-bit arrays

TODO - could webassembly improve performance?

```js
// Function that splits 64 bit values into 
function fp64ify-interleaved(float64Array, float32Array) {
  float32Array = float32Array || new Float32Array(float64Array.buffer); // 
  for (let i = 0; i < float64Array.length) {
  	const value64 = float64Array
  	float32Array[i * 2] = value64;
  	float32Array[i * 2 + 1] = value64 - Math.fround(value64);
  }
}

function fp64ify-split(float64Array, float32ArrayHigh, float32ArrayLow) {
  for (let i = 0; i < float64Array.length) {
  	const value64 = float64Array
  	float32ArrayHigh[i] = value64;
  	float32ArrayLow[i] = value64 - Math.fround(value64);
  }
}
```


## Proposal: Which JS case to optimize for?

The fastest case is the one where data is already available in sub-arrays, that can be copied to the binary attribute.

`getPosition: row => row.position`

By optimizing for this path we seem to be able to get numbers of 70Mrows/s which is of course nice for bragging rights.

However this RFC makes the assumption that this is not the primary case we want to optimize for:
* Big data (millions of rows) is not typically to be JSON formatted, some form of CSV/DSV would be more common.
* In this case we would have `longitude` and `latitude` as top level columns, and have to combine those.
* Even when it is JSON formatted, the cost for generating the subobjects has been incurred earlier in the "load-parse-attributize" chain. The fact that we don't see the object creation cost in our attribute generator doesn't mean it isn't there.

We should probably choose a flat data structure to use for our reference benchmarks, or maybe show both numbers. 



## Proposal: Use `forEach` in custom layer attribute generators

### Use Case: Support Chunked Arrays

By having layer attribute calculation function use a `forEach` function instead of iterating directly, we can support more advanced cases such as chunked input data.

```
for (const chunk of data)
  for (const row of chunk) {
  }
}
```

The default could be a "zero-cost" outer iterator that just returns `data`.

### Other Pros/Cons

* By keeping iteration in the layer attribute updaters we gain some speed in the JS update case and some code elegance.
* however we limit extensibility and ability to select optimized iteration paths dependening on input. 
* If we move to TransformFeedback for binary attribute data generation, we will have path that is an order of magnitude faster as our main foundation for perf. Being able to support more advanced use case related to columnar data then seems worth a perf hit on the JS Side.


