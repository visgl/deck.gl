# RFC: Data Loading Enhancements (for loaders.gl)

* **Author**: Ib Green
* **Date**: May 2019
* **Status**: **Draft**

## Abstract

This RFC suggests a number of improvements to loading support in deck.gl, in particular to support seamless optional integration with loaders.gl.

## Background

The intention of loaders.gl (loaders are designed to be directly compatible with luma.gl and deck.gl) is not fully realized in deck.gl v7.0.


## Proposal: Add `parse` method

```js
import {parse, registerLoaders} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/CSV';
registerLoaders(CSVLoader);

new AnyLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  data: CSV_URL,
  // NEW: Accept a parse methods
  parse,
});
```


## Proposal: Add 'onDataLoaded' callback

Sometimes the application needs to extract something extra from the data. For instance, the PointCloudLayer example uses the bounding box of the point cloud to initialize viewState for the OrbitController.

BEFORE:
```js
fetch(LAZ_SAMPLE).then(data => {data.header. ...}); // Calculate View State from header

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
});
```

AFTER:
```js 
new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  // NEW: Provide a callback to let application react to loaded/parsed/transfored data
  onDataLoaded: data => this._setViewStateFromHeader(data)
});
```


## Proposal: Make PointCloudLayer accept a "Geometry-shaped" object

Today custom code is required to extract the positions attribute etc and pass in as top-level props, see the PointCloudLayer example.

BEFORE:
```js
fetch(LAZ_SAMPLE).then(...); // Extract numInstances and positions, calculate View State

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  numInstances: state.pointsCount,
  instancePositions: state.points
});
```

AFTER:
```js
import {parse, registerLoaders} from '@loaders.gl/core';
import {LAZLoader} from '@loaders.gl/las';
registerLoaders(LAZLoader);

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  data: LAZ_SAMPLE,
  parse // NEW: See above
});
```
