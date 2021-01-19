export function binaryToFeature(geojsonBinary, index) {
  const geomType = binaryGuessGeomType(geojsonBinary);

  if (!geomType) {
    return null;
  }

  const attr = {
    points: null,
    lines: 'pathIndices',
    polygons: 'primitivePolygonIndices'
  };

  return binaryToFeatureIndexAttr(geojsonBinary[geomType], index, attr[geomType]);
}

export function binaryToFeatureIndexAttr(data, index, indexAttr) {
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

export function binaryGuessGeomType(data) {
  if (data && Promise.resolve(data) !== data) {
    if (data.points && data.points.featureIds.value.length) {
      return 'points';
    } else if (data.lines && data.lines.featureIds.value.length) {
      return 'lines';
    } else if (data.polygons && data.polygons.featureIds.value.length) {
      return 'polygons';
    }
  }
  return null;
}
