// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import {log} from '@deck.gl/core';
import type {
  Feature,
  GeoJSON,
  GeoJsonGeometryTypes,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon
} from 'geojson';

type SupportedGeometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

export type SeparatedGeometries = {
  pointFeatures: {geometry: Point}[];
  lineFeatures: {geometry: LineString}[];
  polygonFeatures: {geometry: Polygon}[];
  polygonOutlineFeatures: {geometry: LineString}[];
};

/**
 * "Normalizes" complete or partial GeoJSON data into iterable list of features
 * Can accept GeoJSON geometry or "Feature", "FeatureCollection" in addition
 * to plain arrays and iterables.
 * Works by extracting the feature array or wrapping single objects in an array,
 * so that subsequent code can simply iterate over features.
 *
 * @param {object} geojson - geojson data
 * @param {Object|Array} data - geojson object (FeatureCollection, Feature or
 *  Geometry) or array of features
 * @return {Array|"iteratable"} - iterable list of features
 */
export function getGeojsonFeatures(geojson: GeoJSON): Feature[] {
  // If array, assume this is a list of features
  if (Array.isArray(geojson)) {
    return geojson;
  }

  log.assert(geojson.type, 'GeoJSON does not have type');

  switch (geojson.type) {
    case 'Feature':
      // Wrap the feature in a 'Features' array
      return [geojson];
    case 'FeatureCollection':
      // Just return the 'Features' array from the collection
      log.assert(Array.isArray(geojson.features), 'GeoJSON does not have features array');
      return geojson.features;
    default:
      // Assume it's a geometry, we'll check type in separateGeojsonFeatures
      // Wrap the geometry object in a 'Feature' object and wrap in an array
      return [{geometry: geojson}] as Feature[];
  }
}

// Linearize
export function separateGeojsonFeatures(
  features: Feature[],
  wrapFeature: <T>(row: T, sourceObject: any, sourceObjectIndex: number) => T,
  dataRange: {startRow?: number; endRow?: number} = {}
): SeparatedGeometries {
  const separated: SeparatedGeometries = {
    pointFeatures: [],
    lineFeatures: [],
    polygonFeatures: [],
    polygonOutlineFeatures: []
  };
  const {startRow = 0, endRow = features.length} = dataRange;

  for (let featureIndex = startRow; featureIndex < endRow; featureIndex++) {
    const feature = features[featureIndex];
    const {geometry} = feature;

    if (!geometry) {
      // geometry can be null per specification
      continue; // eslint-disable-line no-continue
    }

    if (geometry.type === 'GeometryCollection') {
      log.assert(Array.isArray(geometry.geometries), 'GeoJSON does not have geometries array');
      const {geometries} = geometry;
      for (let i = 0; i < geometries.length; i++) {
        const subGeometry = geometries[i];
        separateGeometry(
          subGeometry as SupportedGeometry,
          separated,
          wrapFeature,
          feature,
          featureIndex
        );
      }
    } else {
      separateGeometry(geometry, separated, wrapFeature, feature, featureIndex);
    }
  }

  return separated;
}

function separateGeometry(
  geometry: SupportedGeometry,
  separated: SeparatedGeometries,
  wrapFeature: <T>(row: T, sourceObject: any, sourceObjectIndex: number) => T,
  sourceFeature: Feature,
  sourceFeatureIndex: number
) {
  const {type, coordinates} = geometry;
  const {pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures} = separated;

  if (!validateGeometry(type, coordinates)) {
    // Avoid hard failure if some features are malformed
    log.warn(`${type} coordinates are malformed`)();
    return;
  }

  // Split each feature, but keep track of the source feature and index (for Multi* geometries)
  switch (type) {
    case 'Point':
      pointFeatures.push(
        wrapFeature(
          {
            geometry
          },
          sourceFeature,
          sourceFeatureIndex
        )
      );
      break;
    case 'MultiPoint':
      coordinates.forEach(point => {
        pointFeatures.push(
          wrapFeature(
            {
              geometry: {type: 'Point', coordinates: point}
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
      });
      break;
    case 'LineString':
      lineFeatures.push(
        wrapFeature(
          {
            geometry
          },
          sourceFeature,
          sourceFeatureIndex
        )
      );
      break;
    case 'MultiLineString':
      // Break multilinestrings into multiple lines
      coordinates.forEach(path => {
        lineFeatures.push(
          wrapFeature(
            {
              geometry: {type: 'LineString', coordinates: path}
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
      });
      break;
    case 'Polygon':
      polygonFeatures.push(
        wrapFeature(
          {
            geometry
          },
          sourceFeature,
          sourceFeatureIndex
        )
      );
      // Break polygon into multiple lines
      coordinates.forEach(path => {
        polygonOutlineFeatures.push(
          wrapFeature(
            {
              geometry: {type: 'LineString', coordinates: path}
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
      });
      break;
    case 'MultiPolygon':
      // Break multipolygons into multiple polygons
      coordinates.forEach(polygon => {
        polygonFeatures.push(
          wrapFeature(
            {
              geometry: {type: 'Polygon', coordinates: polygon}
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
        // Break polygon into multiple lines
        polygon.forEach(path => {
          polygonOutlineFeatures.push(
            wrapFeature(
              {
                geometry: {type: 'LineString', coordinates: path}
              },
              sourceFeature,
              sourceFeatureIndex
            )
          );
        });
      });
      break;
    default:
  }
}

/**
 * Simple GeoJSON validation util. For perf reasons we do not validate against the full spec,
 * only the following:
   - geometry.type is supported
   - geometry.coordinate has correct nesting level
 */
const COORDINATE_NEST_LEVEL: Record<SupportedGeometry['type'], number> = {
  Point: 1,
  MultiPoint: 2,
  LineString: 2,
  MultiLineString: 3,
  Polygon: 3,
  MultiPolygon: 4
};

export function validateGeometry(type: GeoJsonGeometryTypes, coordinates: any): boolean {
  let nestLevel = COORDINATE_NEST_LEVEL[type] as number;

  log.assert(nestLevel, `Unknown GeoJSON type ${type}`);

  while (coordinates && --nestLevel > 0) {
    coordinates = coordinates[0];
  }

  return coordinates && Number.isFinite(coordinates[0]);
}
