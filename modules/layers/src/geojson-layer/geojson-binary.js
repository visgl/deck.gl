export function geoJsonBinaryToFeature(data, index) {
  let feature;
  const featureIdIndex = data.featureIds.value.indexOf(index);

  if (featureIdIndex > -1) {
    feature = {};
    feature.properties = {...data.properties[index]};
    for (const prop in data.numericProps) {
      feature.properties[prop] =
        data.numericProps[prop].value[featureIdIndex * data.numericProps[prop].size];
    }
  }

  return feature;
}

export function findIndexGeoJsonBinary(data, uniqueIdProperty, featureId) {
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

  return index;
}
