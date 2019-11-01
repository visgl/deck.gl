# RFC: Intuitive Coordinate Spaces

* **Authors**: Tarek Sherif
* **Date**: September 2019
* **Status**: **Draft**


## Summary

This RFC proposes modifications to deck.gl's coordinate spaces to bring them closer to standard 3D model, view and clip spaces, making them easier to reason about and simplifying the implementation of algorithms that use them.

## Overview

deck.gl's [coordinate systems](https://deck.gl/#/documentation/developer-guide/coordinate-systems) include the following:
- World space (model space in standard 3D) - Whatever space the data is defined in, often longitude/latitude or meter offsets
- Common space (world space in standard 3D) - Primary shared space into which world coordinates are transformed, measured in mercator pixels. +x points to the right, +y points down (following the web mercator convention), and +z points above the map surface. Note that unlike the other 3D spaces in deck, this makes common space a left-handed coordinate system. This space also includes the mercator zoom, so it scales up as the zoom increases.
- View space - [Based on mapbox](https://deck.gl/#/documentation/developer-guide/coordinate-systems). Functions almost as a standard view space would, with the camera translated to the origin and the axes rotated so that +x points to the right, +y up and -z into the scene. There is, however, an odd [scaling of the z axis](https://github.com/uber-common/viewport-mercator-project/blob/master/src/web-mercator-utils.js#L195) that makes this space non-isotropic.
- Clip space - The same as standard clip space (as required by the gl). +x is right, +y is up, +z is into the scene, coordinates from (-1, -1, -1) to (1, 1, 1).

The key problems with these system are the following:
- Left-handed common space means it must be treated as a special case compared to the other spaces, e.g. cross products must be reversed.
- Scaled z-axis in view space means common space and view space aren't using the same units. This makes it difficult to map distances between the two or reason about the frustum in common space.
- Zoom applied to common space can be unintuitive. E.g. defining a position in common space requires taking the zoom level into account. In most systems, zoom is considered a camera (view or projection) transform.


## Implementation

The problem of a left-handed common space is easily remedied by modifying the relevant parts of the mercator projection and view matrix calculations. This simply amounts to changing the mercator projection in [project.glsl.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/shaderlib/project/project.glsl.js#L99-L102) to:
```c
return vec2(
  radians(x) + PI,
  PI + log(tan_fp32(PI * 0.25 + radians(lnglat.y) * 0.5)) // Note it's now `PI + ...`
);
```
and removing -y scaling in the initialization of the view matrix in [viewport.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/viewports/viewport.js#L354).

The issue of scaling the z-axis is also easily resolved by removing [that scaling](https://github.com/uber-common/viewport-mercator-project/blob/master/src/web-mercator-utils.js#L195) from the view matrix calculation and adjusting the [near and far planes](https://github.com/uber-common/viewport-mercator-project/blob/master/src/web-mercator-utils.js#L236-L237) accordingly.

Removing the zoom from common space is slightly more complex in that it might affect the use case of sharing a context with Mapbox. The simplest and most intuitive approach would be to apply zoom as a scaling of the z component of the view space translation, i.e. dividing the z component of [this translation](https://github.com/uber-common/viewport-mercator-project/blob/master/src/web-mercator-utils.js#L191) by the mercator scale (2<sup>zoom</sup>). This produces the zoom effect by moving the camera closer to the map surface. The issue that arrises in the case where a depth buffer is being shared with Mapbox is that the depth values will no longer match, since they'll be relative to different near/far planes. It should be straightforward, however, to map the depth values to each other in the shader when required using the two sets of near/far planes as input. It might also be worth considering, given that this (and the removing the y-flip) would move common space away from the standard web mercator projection, whether it would be worthwhile to change the units used to meters. This would remove the need to convert meters to pixels and vice-versa, and would move common space closer to alignment with the WGS84 standard.

