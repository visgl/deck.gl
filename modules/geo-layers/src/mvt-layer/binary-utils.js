export function binaryToFeature(geojsonBinary, index) {
  const geomType = getLayerDataGeomType(geojsonBinary);
  if (!geomType) {
    return null;
  }

  const feature = {};

  const data = geojsonBinary[geomType];

  // Select feature index depending on geometry type
  let geometryIndex;
  let featureIndex;
  switch (geomType) {
    case 'points':
      geometryIndex = data.featureIds.value[index];
      featureIndex = geometryIndex;
      break;
    case 'lines':
      featureIndex = data.pathIndices.value[index];
      geometryIndex = data.featureIds.value[featureIndex];
      break;
    case 'polygons':
      featureIndex = data.polygonIndices.value[index];
      geometryIndex = data.featureIds.value[featureIndex];
      break;
    default:
      featureIndex = -1;
      geometryIndex = featureIndex;
  }

  if (featureIndex !== -1) {
    const numericProps = {};
    // eslint-disable-next-line max-depth
    for (const prop in data.numericProps) {
      numericProps[prop] =
        data.numericProps[prop].value[featureIndex * data.numericProps[prop].size];
    }
    feature.properties = {...data.properties[geometryIndex], ...numericProps};
  }

  return feature;
}

export function getLayerDataGeomType(data) {
  if (Promise.resolve(data) !== data) {
    if (data.points.featureIds.value.length) {
      return 'points';
    } else if (data.lines.featureIds.value.length) {
      return 'lines';
    } else if (data.polygons.featureIds.value.length) {
      return 'polygons';
    }
  }
  return null;
}

export function getHightlightedObjectIndex(data, uniqueIdProperty, featureIdToHighlight) {
  const geomType = getLayerDataGeomType(data);

  if (geomType) {
    // Look for the uniqueIdProperty
    let index = -1;
    if (data[geomType].numericProps[uniqueIdProperty]) {
      index = data[geomType].numericProps[uniqueIdProperty].value.indexOf(featureIdToHighlight);
    } else {
      const propertyIndex = data[geomType].properties.findIndex(
        elem => elem[uniqueIdProperty] === featureIdToHighlight
      );
      index = data[geomType].featureIds.value.indexOf(propertyIndex);
    }

    if (index !== -1) {
      // Select geometry index depending on geometry type
      // eslint-disable-next-line default-case
      switch (geomType) {
        case 'points':
          return data[geomType].featureIds.value.indexOf(index);
        case 'lines':
          return data[geomType].pathIndices.value.indexOf(index);
        case 'polygons':
          return data[geomType].polygonIndices.value.indexOf(index);
      }
    }
  }
  return -1;
}
