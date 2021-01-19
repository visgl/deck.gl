export function geoJsonBinaryToFeature(data, index, indexAttr) {
  const featureIndex = !indexAttr
    ? index
    : 'value' in data[indexAttr]
      ? data[indexAttr].value[index]
      : data[indexAttr][index];
  const geometryIndex = data.featureIds.value[featureIndex];
  const feature = {};

  if (featureIndex !== -1) {
    feature.properties = {...data.properties[geometryIndex]};
    for (const prop in data.numericProps) {
      feature.properties[prop] =
        data.numericProps[prop].value[featureIndex * data.numericProps[prop].size];
    }
  }

  return feature;
}

export function findFeatureGeoJsonBinary(data, uniqueIdProperty, featureId) {
  const geomTypes = ['points', 'lines', 'polygons'];

  for (const gt of geomTypes) {
    const feature = findFeatureByType(data, uniqueIdProperty, featureId, gt);
    if (feature !== -1) {
      return feature;
    }
  }

  return -1;
}

function findFeatureByType(data, uniqueIdProperty, featureId, geomType) {
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

  return -1;
}
