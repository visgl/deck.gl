// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {lerp} from '@math.gl/core';
import {lngLatToWorld, worldToLngLat} from '@math.gl/web-mercator';
import {GeoBoundingBox} from '../tileset-2d/index';

const availableTransformations = {
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon
};

function Point([pointX, pointY]: [number, number], [nw, se]: number[][]) {
  const x = lerp(nw[0], se[0], pointX);
  const y = lerp(nw[1], se[1], pointY);

  return worldToLngLat([x, y]);
}

function getPoints(geometry, bbox: number[][]) {
  return geometry.map(g => Point(g, bbox));
}

function MultiPoint(multiPoint, bbox: number[][]) {
  return getPoints(multiPoint, bbox);
}

function LineString(line, bbox: number[][]) {
  return getPoints(line, bbox);
}

function MultiLineString(multiLineString, bbox: number[][]) {
  return multiLineString.map(lineString => LineString(lineString, bbox));
}

function Polygon(polygon, bbox: number[][]) {
  return polygon.map(polygonRing => getPoints(polygonRing, bbox));
}

function MultiPolygon(multiPolygon, bbox: number[][]) {
  return multiPolygon.map(polygon => Polygon(polygon, bbox));
}

export function transform(geometry, bbox: GeoBoundingBox) {
  // Picking reports WGS84 from tile coordinates independently of the rendering target.
  const nw = lngLatToWorld([bbox.west, bbox.north]);
  const se = lngLatToWorld([bbox.east, bbox.south]);
  const projectedBbox = [nw, se];

  return {
    ...geometry,
    coordinates: availableTransformations[geometry.type](geometry.coordinates, projectedBbox)
  };
}
