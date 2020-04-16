# RFC: Automatic and Explicit Highlighting

* **Authors**: Ravi Akkenapally and Ib Green
* **Date**: August 9, 2017
* **Status**: **Implemented**

Notes:
* Please add comments as reviews to the [PR](https://github.com/visgl/deck.gl/pull/839)


## Overview

The new **picking** shader module in luma.gl v4 offers a simple, unified way to implement picking in all deck.gl layers. It is expected that all core layers will be converted to use this module early in the the deck.gl 4.2 dev cycle.

In addition to handling normal picking color selection, the picking module also supports highlighting of one object by specifying  **pickingSelectedColor** module parameter.

This RFC explores how this feature can be exposed to deck.gl applications, both as an explicit property, and an automatic hover selection feature.

## Deck.gl picking selection feature

Use cases:

1. [**Already supported**]: Hover over objects and get information of currently pointed object.

2. [**Proposed**] Specify an object that should to be highlighted with a highlight color .

3. [**Proposed**] Hover over objects and automatically highlight currently pointed object with a default/given highlight color.

The following use case is not covered in the current proposal, and would likely require a different technical approach, but is mentioned for completeness:

4. **[Future] **Ability to select multiple objects that need to be highlighted (like clicking on an object's toggles its selection state or user provides a set of picking colors)

Layer props:

1. **pickable** {Boolean, default: false} : Indicates whether deck.gl performs picking [**Existing**]

2. **highlightedObjectIndex** {Int: default: null} : [**Proposed**] - If set, the object (if any) at that index will be shown as selected. If the value doesn’t point to valid index, no object is selected.

3. **autoHighlight** {Boolean, default: false} : [**Proposed**] for now, this is a boolean value, indicating that deck.gl will automatically track the hovered over object. Note: This could be extended in future to specify ‘hover’ , ‘click’ etc events, for different types of tracking. **highlightedObjectIndex** prop takes precedence when both **highlightedObjectIndex** and **autoHighlight** are set to valid values. To disable **highlightedObjectIndex** set it to `null`.

4. **highlightColor **{vec4: default: transparent light-blue color [0, 0, 128, 128]} : [**Proposed**] - This indicates which color should be used to display the selected object, if any.


This table describes what these prop values should be for above mentioned use cases:
| Use case # | pickable | autoHighlight | highlightedObjectIndex | highlightColor | Implementation notes |
|------------|----------|---------------|---------------------| -------------- |---------------------|
|1           |true      |*              |*                    |*               |- Render to FBO and perform readPixels to obtain current object details.|
|2           |*         |value ignored  |valid index value    |Vec4 or default color |- Retrieve objects picking color at ‘highlightedObjectIndex’, pass it to picking shader module.|
|3           |true      |true           |default (-1) or null |Vec4 or default color |- Render to FBO and perform readPixels to obtain current object details. Pass its picking color to picking shader module.|


**autoHighlight issues**

* Mouse leave

* An object in another layer is selected.

**Considerations**

* Which prop should take precedence - **selectedObject** or **autoHighlight**?

    * Current spec says **selectedObject**

* Naming and number of props

    *  it’s a tradeoff between having easily understandable props, and fewer props.

* Default values - should **autoHighlight** be off by default? Will make it harder to discover this great feature.
