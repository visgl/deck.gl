// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Viewport} from '@deck.gl/core';
import {lerp} from '@math.gl/core';
import {GeoBoundingBox} from '../tileset-2d/index';

const availableTransformations = {
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon
};

function Point([pointX, pointY]: [number, number], [nw, se]: number[][], viewport: Viewport) {
  const x = lerp(nw[0], se[0], pointX);
  const y = lerp(nw[1], se[1], pointY);

  return viewport.unprojectFlat([x, y]);
}

function getPoints(geometry, bbox: number[][], viewport: Viewport) {
  return geometry.map(g => Point(g, bbox, viewport));
}

function MultiPoint(multiPoint, bbox: number[][], viewport: Viewport) {
  return getPoints(multiPoint, bbox, viewport);
}

function LineString(line, bbox: number[][], viewport: Viewport) {
  return getPoints(line, bbox, viewport);
}

function MultiLineString(multiLineString, bbox: number[][], viewport: Viewport) {
  return multiLineString.map(lineString => LineString(lineString, bbox, viewport));
}

function Polygon(polygon, bbox: number[][], viewport: Viewport) {
  return polygon.map(polygonRing => getPoints(polygonRing, bbox, viewport));
}

function MultiPolygon(multiPolygon, bbox: number[][], viewport: Viewport) {
  return multiPolygon.map(polygon => Polygon(polygon, bbox, viewport));
}

export function transform(geometry, bbox: GeoBoundingBox, viewport: Viewport) {
  const nw = viewport.projectFlat([bbox.west, bbox.north]);
  const se = viewport.projectFlat([bbox.east, bbox.south]);
  const projectedBbox = [nw, se];

  return {
    ...geometry,
    coordinates: availableTransformations[geometry.type](
      geometry.coordinates,
      projectedBbox,
      viewport
    )
  };
}
