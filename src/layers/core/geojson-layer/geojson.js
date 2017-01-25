import {Container} from '../../../lib/utils';
import flatten from 'lodash.flatten';

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

  const type = Container.get(geojson, 'type');
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
    return Container.get(geojson, 'features');
  default:
    throw new Error('Unknown geojson type');
  }
}

// Linearize
export function separateAndFlattenGeojsonFeatures(features) {
  const pointFeatures = [];
  const lineFeatures = [];
  const polygonOutlineFeatures = [];
  const polygonFeatures = [];
  Container.forEach(features, feature => {
    const type = Container.get(feature, 'geometry.type');
    const coordinates = Container.get(feature, 'geometry.coordinates');
    const properties = Container.get(feature, 'properties');
    switch (type) {
    case 'Point':
      pointFeatures.push(feature);
      break;
    case 'MultiPoint':
      // TODO - split multipoints
      Container.forEach(coordinates, point => {
        pointFeatures.push({geometry: {coordinates: point}, properties, feature});
      });
      break;
    case 'LineString':
      // Wrap single lines into array of paths
      lineFeatures.push({geometry: {coordinates: [coordinates]}, properties, feature});
      break;
    case 'MultiLineString':
      // MultiLine is already array of paths
      lineFeatures.push(feature);
      break;
    case 'Polygon':
      polygonFeatures.push(feature);
      // A polygon is already an array of paths
      polygonOutlineFeatures.push(feature);
      break;
    case 'MultiPolygon':
      // Break multipolygons into multiple polygons with same properties
      Container.forEach(coordinates, polygon => {
        polygonFeatures.push({geometry: {coordinates: polygon}, properties, feature});
      });
      // A polygon is already an array of paths, but we need to flatten into a single list
      polygonOutlineFeatures.push({
        geometry: {coordinates: flatten(coordinates)}, properties, feature
      });
      break;
      // Not yet supported
    case 'GeometryCollection':
    default:
      throw new Error(`GeoJsonLayer: ${type} not supported.`);
    }
  });

  return {
    pointFeatures,
    lineFeatures,
    polygonOutlineFeatures,
    polygonFeatures
  };
}

/*
  _extractPoints(pointFeatures) {
    const {pointColor, pointSize, getPointColor, getPointSize} = this.props;
    const points = [];

    pointFeatures.forEach(feature => {
      const {coordinates, type} = feature.geometry;
      (type === 'Point' ? [coordinates] : coordinates).forEach(coord => {
        points.push({
          position: [Number(coord[0]), Number(coord[1]), 0],
          color: getPointColor(feature) || pointColor,
          radius: getPointSize(feature) || pointSize
        });
      });
    });

    return points;
  }

  _extractPaths(feature) {
    const {coordinates, type} = feature.geometry;

    let paths = [];

    switch (type) {
    case 'LineString':
      paths = [coordinates];
      break;
    case 'Polygon':
    case 'MultiLineString':
    case 'LineSegments':
      paths = coordinates;
      break;
    case 'MultiPolygon':
      paths = flatten(coordinates);
      break;
    default:
      break;
    }

    return paths.map(
      path => path.map(
        coordinate => [coordinate[0], coordinate[1], coordinate[2] || 0]
      )
    );
  }
*/
