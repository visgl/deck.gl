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
import {get} from '../../../lib/utils';

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
export function getGeojsonFeatures(geojson) {
  // If array, assume this is a list of features
  if (Array.isArray(geojson)) {
    return geojson;
  }

  const type = get(geojson, 'type');
  switch (type) {
  case 'Point':
  case 'MultiPoint':
  case 'LineString':
  case 'MultiLineString':
  case 'Polygon':
  case 'MultiPolygon':
  case 'GeometryCollection':
    // Wrap the geometry object in a 'Feature' object and wrap in an array
    return [
      {type: 'Feature', properties: {}, geometry: geojson}
    ];
  case 'Feature':
    // Wrap the feature in a 'Features' array
    return [geojson];
  case 'FeatureCollection':
    // Just return the 'Features' array from the collection
    return get(geojson, 'features');
  default:
    throw new Error('Unknown geojson type');
  }
}

/*
 * converts a GeoJSON "Feature" object to a list of GeoJSON polygon-style coordinates
 * @param {Object | Array} data - geojson object or array of feature
 * @returns {[Number,Number,Number][][][]} array of choropleths
 */
export function featureToPolygons(feature) {
  const geometry = get(feature, 'geometry');
  // If no geometry field, assume that "feature" is the polygon list
  if (geometry === undefined) {
    return feature;
  }

  const type = get(geometry, 'type');
  const coordinates = get(geometry, 'coordinates');

  let polygons;
  switch (type) {
  case 'MultiPolygon':
    polygons = coordinates;
    break;
  case 'Polygon':
    polygons = [coordinates];
    break;
  case 'LineString':
    // TODO - should lines really be handled in this switch?
    polygons = [[coordinates]];
    break;
  case 'MultiLineString':
    // TODO - should lines really be handled in this switch?
    polygons = coordinates.map(coords => [coords]);
    break;
  default:
    polygons = [];
  }
  return polygons;
}

// DEPRECATED - USED BY OLD CHOROPLETH LAYERS

/*
 * converts list of features from a GeoJSON object to a list of GeoJSON
 * polygon-style coordinates
 * @param {Object} data - geojson object
 * @returns {[Number,Number,Number][][][]} array of choropleths
 */
export function extractPolygons(data) {
  const normalizedGeojson = normalizeGeojson(data);
  const features = get(normalizedGeojson, 'features');

  const result = [];
  features.forEach((feature, featureIndex) => {
    let choropleths = featureToPolygons(feature);

    /* eslint-disable max-nested-callbacks */
    choropleths = choropleths.map(
      choropleth => choropleth.map(
        polygon => polygon.map(
          coord => [
            get(coord, 0),
            get(coord, 1),
            get(coord, 2) || 0
          ]
        )
      )
    );
    /* eslint-enable max-nested-callbacks */

    for (const choropleth of choropleths) {
      choropleth.featureIndex = featureIndex;
    }
    result.push(...choropleths);
  });
  return result;
}

/**
 * "Normalizes" a GeoJSON geometry or "Feature" into a "FeatureCollection",
 * by wrapping it in an extra object/array.
 *
 * @param {object} geojson - geojson data
 * @return {object} - normalized geojson data
 */
export function normalizeGeojson(geojson) {
  const type = get(geojson, 'type');
  switch (type) {
  case 'Point':
  case 'MultiPoint':
  case 'LineString':
  case 'MultiLineString':
  case 'Polygon':
  case 'MultiPolygon':
  case 'GeometryCollection':
    // Wrap the geometry object in a "Feature" and add the feature to a "FeatureCollection"
    return {
      type: 'FeatureCollection',
      features: [
        {type: 'Feature', properties: {}, geometry: geojson}
      ]
    };
  case 'Feature':
    // Add the feature to a "FeatureCollection"
    return {
      type: 'FeatureCollection',
      features: [geojson]
    };
  case 'FeatureCollection':
    // Just return the feature collection
    return geojson;
  default:
    throw new Error('Unknown geojson type');
  }
}
