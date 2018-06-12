# RFC: Data Filter

* **Authors**: Xiaoji Chen
* **Date**: June 2018
* **Status**: Review

## Overview

Add a generic data filter to deck.gl's Layer class.

## Background

A common use case in data visualization applications is to update deck.gl layers with a data filter. A data filter shows/hides certain objects in the data array by some dynamic criteria. For example, of an input array of taxi pick up locations, only show those within a given time window. The app may also need to change this filter frequently, e.g. show an animation of how pick up locations change over the course of a day.

Currently, there are two ways to apply a data filer:

* Supply the filtered data array to the layer's `data` prop. This triggers recalculation of all attributes, and can be expensive depending on the size of the data.
* Update a single attribute to produce invisible elements. For example, return `0` with `getRadius` for the ScatterplotLayer. This requires a custom logic for each layer, and for some layers there is no accessor with this effect (e.g. PolygonLayer - transparent color does not hide an object from picking).


## Proposed Features

### New Layer Props

Add two new props to base Layer:

* `getFilterValue` (function|number) - accessor to the "filterable" value of each data object. Default `1`.
* `filterRange` ([number, number]) - the [min, max] bounds of the filter values to display. Default `[0.5, 1.5]`.

Add a default attribute to the base Layer attributeManager:

* `instanceFilterValue` - auto populated with accessor `getFilterValue`.

If neither props are supplied, the performance impact is minimal (1 generic vertex attribute + 1 uniform).

#### Examples

Use case 1: filter layer data by a moving time window, without re-generating any attribute:

```js
new ScatterplotLayer({
    ...
    getFilterValue: d => d.time,
    filterRange: [currentTime, currentTime + 1000] // currentTime is a number updated per animation frame
});
```

Use case 2: custom filtering without manipulating the data object, thus avoiding re-generating all attributes:

```js
new ScatterplotLayer({
    ...
    getFilterValue: d => isVisible(d) ? 1 : 0
});
```

#### TODO

* Add feature to Layer class
* Add data filter prop forwarding to CompositeLayer
* Add data filter prop handling to aggregation layers


### New Shader Module

Add a new shader module `filter` and add it as a default module. It adds the uniform `vec2 filterRange` from the layer prop with the same name. It also adds two vertex shader functions:

* `void filter_setVisibility(float filterValue)` - determine visibility by checking value against `filterRange`
* `void filter_setVisibility(bool visible)` - override the data filter with custom logic

Ands one fragment shader function:

* `vec4 filter_filterColor(vec4)` - recolor/discard the fragment based on the data filter.

#### Examples

To use this module, a layer may add the following to its vertex shader:

```glsl
attribute float instanceFilterValue;

void main() {
    ...
    filter_setVisibility(instanceFilterValue);
}
```

And the following to its fragment shader:

```glsl
void main() {
    ...
    gl_FragColor = filter_filterColor(gl_FragColor);    
}
```

