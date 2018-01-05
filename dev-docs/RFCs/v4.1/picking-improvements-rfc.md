# RFC: Picking Improvements

* **Author**: Shaojing Li
* **Date**: May 10, 2017
* **Status**: This is a direction RFC, more detail is needed for implementation

Notes:
* Some features have now been implemented and/or covered in more detail in later RFCs, see the text for details.


## Motivation

For any data visualization applications, interactivity is important for helping users better understand the data being presented and extract additional information that can’t be properly displayed statically. Interactivity is usually achieved through user sending command to a specific object drawn on the screen through GUI, and the renderer updating the rendered content according to the command.

Among anything, picking, or selection, is one of the most common means that users interact with applications.

## Description

Deck.gl currently supports very limited ways of selecting rendered object, specifically mouse picking through pointer hovering and clicking. Our users repeated ask deck.gl to provide more flexible selecting functionality including selection through mouse drag, multiple element selection, keyboard selection, etc.

Our current picking result is exposed in relatively rigid and low-level APIs: the onHover / onClick props that takes callback functions provided by the applications.

Implementation-wise, selection in deck.gl is implemented through the “color-coding picking” algorithm. While simple and efficient for current setups, it also has some intrinsic problems both from functionality and performance perspective. Alternative picking algorithms should be investigated for other use cases.

Performance-wise, in deck.gl, picking pass is executed on every event, with or without pickable areas and with or without user expressing their intention of picking, usually through key pressing or mouse movement. This could be optimized.

### Impacted Parties

Impacted parties of this improvement / change is mostly deck.gl developers and users.

### Backwards Compatibility

Since this is expected to be implemented as a backward compatible  “improvement” feature, no significant efforts are needed from the existing users. New users will be benefited with the new functionalities being provided.

## Proposed Features

Phase 1: 4.0
* Rectangular selection

Phase 2: 4.1
* Automatic highlighting of picked element

Phase 3: TBD
* Intuitive keyboard or keyboard-assisted selections (e.g. select multiple by control + click)
* Select overlapping objects
* Transformed rectangular selection
* Polygonal Lasso selection
* Lasso selection

### Proposal: Automatic highlighting of picked element

Sometimes, a highlighted layer following the mouse pointer during the drag is useful for helping the user with this operation. This could be done by the application by adding an extra layer but it would be nice to get this functionality automatically.

Provide default behavior to highlighted picked element. The default behavior should be able to be turned off without impacting rendering performance. This was originally implemented “ad-hoc” for some iteration of HexagonLayer and GridLayer but later removed during API audit.

NOTE:
* Automatic highlighting has been implmented in 5.0 and is covered in detail in a separate [RFC]().


### Proposal: Better picking arbitration algorithm

Currently, deck.gl’s color-code picking algorithm provides pixel-accurate picking boundary same as the underlying geometry elements. However, in some cases, different picking boundaries are preferred for better user experience. For example, on touchscreen devices, it’s better that a more lenient boundary is provided for each element. In other situations, the user might also want to assign larger clickable areas to more important elements.

Note:
* This was implemented in 4.1 by the addition of a `radius` parameter to `queryObject`
* Is there a way to control radius for built-in events?


### Even better picking arbitration algorithm

To have better picking arbitration when using “color-coded” picking, we need to have different geometries / layers generated and rendered in the picking pass.


### Proposal: Rectangular selection using color-coding picking

The process of rectangular selection starts with correctly identifying a mouse down, mouse drag and mouse up event sequence. deck.gl will rely on its new event handling system to detect this kind of gesture. Then, a new deck.gl method named `pickObjects(topLeft, bottomRight)` is triggered to calculate the actual picked elements. In this new function, the picking framebuffer is read back and pixels within the rectangle area specified by the` topLeft` and `bottomRight` arguments are checked in a loop. Indices of rendered element present in this rectangular picking area will then by put into an array for output.

After the array of picked elements is assembled, a callback function send in as the `onElementSelected` prop of deck.gl will get called and so that the application could manipulate the list of picked elements.

The rectangular selection can be implemented in two flavors. One is to select all objects that are entirely enclosed in the selection rectangle or lasso (window selection). The other is to select all objects that are crossed by the selection rectangle or lasso (crossing selection).

### Proposal: Transformed rectangular selection
// TODO:

### Proposal: Polygonal Lasso selection

This feature is an extension to the rectangular selection feature as the selection area is now an arbitrary polygon instead of rectangle. This is also a key feature requested by the Maps team and should be considered a high priority.

Implementing this feature requires deck.gl’s event handling system to detect a different sets of event sequences, which is generally indicated by a keyboard button or by changing the whole app to a “polygon selection mode”.

After the polygon is specified, deck.gl needs to scan for all points inside the polygon for selected
elements and then these set of elements will be provided to the onElementSelected callback.

// TODO: implementation details to be added here


### Proposal: Lasso selection

To further lessen the restrictions, lasso selection allows users to draw a freeform closed curve and select every primitives within the curve.

// TODO: implementation details to be added here


### Select overlapping (hidden) objects

Implementing this would require deck.gl reverting to original picking implementation in version 3. In  version 3, each layer has its own picking framebuffer and the picking is done for every layer. This has shown to have performance problems as some applications uses 80+ layers, so is not a viable general solution.

To effectively implement this feature, we would need the ray casting picking as described in next section.

The use-case for this feature still needs to be determined.


### Intuitive keyboard-assisted selections

(e.g. select multiple objects by control + click on each of them)

This feature requires deck.gl to have an internal state variable, e. g. `currentPickedElement`, to  remember the selected elements while user is conducting multi-select.


### New ray casting picking algorithms

This is a completely new algorithm for implementing picking with its own advantages and disadvantages.

Advantage:
* Simple and straightforward
* Pure CPU operation that does not stall GPUs
* Done in world space and independent of rendering settings and rendering loop
* Better performance if picking from multiple viewpoints
* Handles transparent geometries elegantly
* Can pick multiple objects along the picking ray

Disadvantage:
* Requires spatial indexing for relatively complicated scenes
* Hard to get pixel-accurate picking boundaries

Naive ray casting picking is relatively easy to implement. Deck.gl would need a ray class that represent a ray originated from the camera along the direction decided by camera and mouse pointer. This ray will then be tested against all layer elements for intersections and intersected elements are usually linked in a near-to-far sequence.

Intersection testing is a major part of ray casting picking. Usually in game engines, intersection testing is needed for physics simulation as well so there is no extra work for it. While in visualization applications, this is not true, regular / abstract geometries are often used to represent information. so intersections testing are usually only needed among rays and geometry primitives, which is very fast.

To have ray-primitive intersection test to be efficient for a layer or a scene, some form of spatial indexing is necessary, this could be off-the-shelf solution of KD-tree, octa-tree or other spatial segregation data structures.

To implement the multi-pick functionality mentioned in this document in ray casting picking, we need to form a “selection volume” from a user specified rectangle or polygon or other shapes. Then, the selection volume would be tested against possible geometry primitives for intersection.

One current application, actually has implemented a “polygon area selection” feature in 2D top-down view. The way Magellan does it is similar to “ray casting” in the sense that the “polygon selection area” is transformed to the world space and all possible geometry primitives (road segments), after proper spatial indexing, are tested against this transform polygon for intersection / inclusion.

// More implementation details to add


## Remarks and discussions


## References

* [Selection tools of Photoshop](https://helpx.adobe.com/photoshop/using/tools.html#selection_tools_gallery)
* [Selection basics for Blender](https://wiki.blender.org/index.php/Doc:2.4/Manual/Modeling/Meshes/Selecting/Basics)
* [Select objects in AutoCAD](https://knowledge.autodesk.com/support/autocad-lt/learn-explore/caas/CloudHelp/cloudhelp/2015/ENU/AutoCAD-LT/files/GUID-243E4DD0-8947-4905-AFE2-BE9B903A8C3F-htm.html)
