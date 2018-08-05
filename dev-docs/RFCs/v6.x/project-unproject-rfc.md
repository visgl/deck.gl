# RFC - Project / Unproject Improvements

* **Author**: Ib Green
* **Date**: August, 2018
* **Status**: **Conceptual Draft**

References:
* [View Class Extensions RFC](../v6.1/view-class-extension-rfc.md) for deck.gl v6.1.
* [View Class RFC](../v5.2/view-class-rfc.md) for deck.gl v5.2.
* [Multi Viewport RFC](../v5.0/multi-viewport-rfc.md) for deck.gl v5.
* [First Person Geospatial Viewport RFC](../v5.0/first-person-geospatial-viewport-rfc.md) for deck.gl v5.
* [Infovis Viewport RFC](../v4.0/non-geospatial-viewports-rfc.md) for deck.gl v4.


## Summary

This RFC is intended to propose an enhanced project/unproject functionality for API for deck.gl that can handle the many considerations arising from advance features that have been introduced into deck.gl over time.


## Considerations

This is a partial list of considerations that should inform the design of a new `project`/`unproject` API for deck.gl


### Multiple Views

Picking already renders all viewports, so an object can be picked in any viewport. But pick info is not fully updated.

* Should the pickInfo object contain a view descriptor reference?
* Should relative coordinates be resolved within viewports?
* Ability to restrict picking to certain viewport?


### Multiple Coordinate Systems

Now each layer can have its own coordinate system. Either LNGLAT or METER_OFFSETS, and every METER_OFFSETS layer can have its own center point and model matrix (the latter should also be true for LNGLAT).

Does it make sense to have a `Deck` level `project`/`unproject` function?

* Should it return values in all coordinate systems?
* Should it traverse the layer list to extract a list of coordinate systems?
* Or should there be an API to unproject towards a specific layer Id?


### Custom Coordinate Systems

There is even the idea of supporting completely different, installable projections. Presumably these will be able to expose `project`/`unproject` functions to JS.

Can those "installable" functions be integrated into a generic `project`/`unproject` system.


### Adjustable Ante-Meridian

Shaders are now able to dynamically adjust the "placement" of the ante-meridian, should JS functions also do this to ensure shader and JS rendered calculations and rendering always align?

Can layers use different ante-meridians? Does it matter, since we already have to deal with different coordinate system.


### Model matrix inversion

A lot of model matrices, not exactly cheap to calculate inverted matrices? On demand?

