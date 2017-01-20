import {get, map} from './container';

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
    const choropleths = featureToPolygons(feature);
    for (const choropleth of choropleths) {
      choropleth.featureIndex = featureIndex;
    }
    result.push(...choropleths);
  });
  return result;
}

/*
 * converts one GeoJSON features from object to a list of GeoJSON polygon-style
 * coordinates
 * @param {Object} data - geojson object
 * @returns {[Number,Number,Number][][][]} array of choropleths
 */
function featureToPolygons(feature) {
  const geometry = get(feature, 'geometry');
  const type = get(geometry, 'type');
  const coordinates = get(geometry, 'coordinates');

  let polygonsWithHoles;
  switch (type) {
  case 'MultiPolygon':
    polygonsWithHoles = coordinates;
    break;
  case 'Polygon':
    polygonsWithHoles = [coordinates];
    break;
  case 'LineString':
    // create a LineStringLayer for LineString and MultiLineString?
    polygonsWithHoles = [[coordinates]];
    break;
  case 'MultiLineString':
    polygonsWithHoles = map(coordinates, coords => [coords]);
    break;
  default:
    polygonsWithHoles = [];
  }
  return map(polygonsWithHoles,
    polygonWithHoles => map(polygonWithHoles,
      polygon => map(polygon, coord => [get(coord, 0), get(coord, 1), get(coord, 2) || 0])
    )
  );
}
