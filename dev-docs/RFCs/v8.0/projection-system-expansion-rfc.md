# Projection System Expansion RFC

* **Author**: Xiaoji Chen
* **Date**: October 2019
* **Status**: **Pending Review**

## Overview

As the community of deck.gl grow, we see new use cases emerge regarding both input data formats (e.g. fixed coordinate frame) and output projection methods (e.g. globe, Stereographic, Conic, etc.). The existing projection system is limiting the scenarios that we can address due to its tight coupling of geospatial data and the WebMercator projection. This RFC proposes changes to the projection system (including the `Layer` and `Viewport` classes and the `project` shader module) to create a more extensible architecture that allows future expansion.


## Projection System: History and Current State

deck.gl started as an overlay component for Mapbox. Initially, it only supported one coordinate system (`LNGLAT`) projected using Web Mercator and strictly synchronized with the base map. `IDENTITY` and `METER_OFFSETS` support were added in v5 to address use cases in ML and autonomy visualization. The concept of `View` and "view state" were introduced in v6, the first attempt to project the same data differently onto one canvas. The `LNGLAT` auto-offset mode was added in v6 to provide better precision under the hood.

The current data flow and interaction between components:

![projection system](https://raw.github.com/uber-common/deck.gl-data/master/images/dev-docs/projection-rfc.png)

## Problems and Proposals

### Consistent common space

Related: [Coordinate Space RFC](/dev-docs/RFCs/v8.0/coordinate-space-rfc.md)

The current common space is defined such that 1 common unit is equal to 1 screen pixel at the viewport center.

For legacy reasons, the Web Mercator space is left-handed while the identity space is right-handed. Both are scaled to the zoom level of the current viewport. At a pre-determined zoom level, both spaces could switch to a dynamic offset mode to compensate for float32 precision loss.

This has traditionally created much complexity and confusion when it comes to calculating the common space positions and sizes (e.g. [PR2230](https://github.com/uber/deck.gl/pull/2230), [PR2844](https://github.com/uber/deck.gl/pull/2844)).

The proposal is to move the common space to a fixed scale and orientation. All coordinate systems will project to a right-handed common space. The scale is determined so that 1 common unit is equal to 1 screen pixel at the viewport center at zoom level `0`.

This change will allow us to:

- Add new projection modes that are agnostic of the input data coordinate system.
- Explore caching the common space calculation results in a buffer, thus improve shader perf on redraws that are triggered by only view state change.


### Decouple coordinate system and projection mode

Related: [Projection Mode Improvements](/dev-docs/RFCs/vNext/projection-mode-improvements-rfc.md)

The current system hard-codes the mapping between input data format and their presentation:

| coordinateSystem | Common Space | Supported View Type |
| --- | --- | --- |
| `LNGLAT` (default) | Web Mercator | `MapView`/`FirstPersonView` |
| `LNGLAT_DEPRECATED` | Web Mercator | `MapView`/`FirstPersonView` |
| `LNGLAT_AUTO_OFFSET` | offseted Web Mercator (dynamic origin) | `MapView`/`FirstPersonView` |
| `LNGLAT_OFFSETS` | offseted Web Mercator (fixed origin) | `MapView`/`FirstPersonView` |
| `METER_OFFSETS` | offseted Web Mercator (fixed origin) | `MapView`/`FirstPersonView` |
| `IDENTITY` | offseted identity (dynamic orgin) | `OrthographicView`/`OrbitView` |

Proposal:

- `COORDINATE_SYSTEM` enums - discribe the input data, provided by user via `layer.props.coordinateSystem`.
  + `LNGLAT`
  + `LNGLAT_OFFSETS`
  + `METER_OFFSETS`
  + `WGS84`
  + `CARTESIAN`
  + `DEFAULT` - `LNGLAT` if rendering into a geospatial view, `CARTESIAN` otherwise
- `PROJECTION_MODE` enums - discribe the common space, defined by the viewport. The viewport will also supply projection matrices that properly view these defined common spaces.
  + `WEB_MERCATOR` - the surface of the earth to 512x512 square (Mapbox scale convention)
  + `WEB_MERCATOR_AUTO_OFFSET` - `WEB_MERCATOR` using auto-offset mode
  + `WGS84` - the 3D earth in a R~=100 sphere (1px:65536m at zoom=0) (any precision concerns?)
  + `IDENTITY` - no transform

Notes:

- `COORDINATE_SYSTEM.LNGLAT_DEPRECATED` will be removed. From the user's perspective, `coordinateSystem` should only describe the data that they have. The `Fp64Extension` may communicate with the project module via an internal setting to disable the auto offset.

## Open Questions

WIP
