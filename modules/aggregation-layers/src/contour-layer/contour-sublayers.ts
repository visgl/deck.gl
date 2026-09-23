// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Layer} from '@deck.gl/core';
import {PathLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {Matrix4} from '@math.gl/core';

// Contours are generated in bin coordinates, not projection input coordinates.
// The shader bypasses modelMatrix in preprojecting views, so apply only the
// bin-to-common matrix on the CPU. Never call viewport.preproject on this geometry.
function transformContourPosition(this: Layer, position: number[]): number[] {
  const result = position.slice();
  if (this.props.modelMatrix) {
    new Matrix4(this.props.modelMatrix).transformAsPoint(position, result);
  }
  return result;
}

export class ContourPathLayer extends PathLayer {
  static layerName = 'ContourPathLayer';

  usePositionTransforms(): ReturnType<Layer['usePositionTransforms']> {
    return {transformSource: 'projection', transform: transformContourPosition};
  }
}

export class ContourPolygonLayer extends SolidPolygonLayer {
  static layerName = 'ContourPolygonLayer';

  usePositionTransforms(): ReturnType<Layer['usePositionTransforms']> {
    return {transformSource: 'projection', transform: transformContourPosition};
  }
}
