// This module implement some utility functions to work with
// the geojson-binary format defined at loaders.gl:
// https://github.com/visgl/loaders.gl/blob/master/modules/gis/docs/api-reference/geojson-to-binary.md

const GEOM_TYPES = ['points', 'lines', 'polygons'];

/**
 * Return the feature for an accesor
 *
 * @param {Object} data - The data in binary format
 * @param {Number} index - The requested index
 */
export function binaryToFeatureForAccesor(data, index) {
  if (!data) {
    return null;
  }

  const featureIndex = 'startIndices' in data ? data.startIndices[index] : index;
  const geometryIndex = data.featureIds.value[featureIndex];

  if (featureIndex !== -1) {
    return getPropertiesForIndex(data, geometryIndex, featureIndex);
  }

  return null;
}

function getPropertiesForIndex(data, propertiesIndex, numericPropsIndex) {
  const feature = {
    properties: {...data.properties[propertiesIndex]}
  };

  for (const prop in data.numericProps) {
    feature.properties[prop] = data.numericProps[prop].value[numericPropsIndex];
  }

  return feature;
}

/**
 * Return the index of feature (numericProps or featureIds) for given feature id
 * Example: findIndexBinary(data, 'id', 33) will return the index in the array of numericProps
 * of the feature 33.
 * @param {Object} data - The data in binary format
 * @param {String} uniqueIdProperty - Name of the unique id property
 * @param {Number} featureId - feature id to find
 */
export function findIndexBinary(data, uniqueIdProperty, featureId) {
  if (!data) {
    return -1;
  }

  for (const gt of GEOM_TYPES) {
    const index = findIndexByType(data, uniqueIdProperty, featureId, gt);
    if (index !== -1) {
      return index;
    }
  }

  return -1;
}

function findIndexByType(data, uniqueIdProperty, featureId, geomType) {
  if (!data) {
    return -1;
  }

  if (!(geomType in data) || !data[geomType].positions.value.length) return -1;

  // Look for the uniqueIdProperty
  let index = -1;
  if (data[geomType].numericProps[uniqueIdProperty]) {
    index = data[geomType].numericProps[uniqueIdProperty].value.indexOf(featureId);
  } else {
    const propertyIndex = data[geomType].properties.findIndex(
      elem => elem[uniqueIdProperty] === featureId
    );
    index = data[geomType].featureIds.value.indexOf(propertyIndex);
  }

  return index;
}

// Custom picking color to keep binary indexes
export function calculatePickingColors(geojsonBinary, encodePickingColor) {
  const pickingColors = {
    points: null,
    lines: null,
    polygons: null
  };
  for (const key in pickingColors) {
    const featureIds = geojsonBinary[key].globalFeatureIds.value;
    pickingColors[key] = new Uint8ClampedArray(featureIds.length * 3);
    const pickingColor = [];
    for (let i = 0; i < featureIds.length; i++) {
      encodePickingColor(featureIds[i], pickingColor);
      pickingColors[key][i * 3 + 0] = pickingColor[0];
      pickingColors[key][i * 3 + 1] = pickingColor[1];
      pickingColors[key][i * 3 + 2] = pickingColor[2];
    }
  }

  return pickingColors;
}
