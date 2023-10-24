/**
 * Adds access token to Authorization header in loadOptions
 */
export function injectAccessToken(loadOptions: any, accessToken: string): void {
  if (!loadOptions?.fetch?.headers?.Authorization) {
    loadOptions.fetch = {
      ...loadOptions.fetch,
      headers: {...loadOptions.fetch?.headers, Authorization: `Bearer ${accessToken}`}
    };
  }
}

export function mergeBoundaryData(geometry, properties) {
  const mapping = {};
  for (const {geoid, ...rest} of properties.properties) {
    if ((geoid as string) in mapping) {
      throw new Error(`Duplicate geoid key in mapping: ${geoid}`);
    }
    mapping[geoid] = rest;
  }

  for (const type of ['points', 'lines', 'polygons']) {
    geometry[type].properties = geometry[type].properties.map(({geoid}) => mapping[geoid]);
  }

  const length = geometry.polygons.positions.value.length / geometry.polygons.positions.size;
  for (const key in properties.numericProps) {
    const sourceProp = properties.numericProps[key].value;
    const TypedArray = sourceProp.constructor;
    const destProp = new TypedArray(length);
    geometry.polygons.numericProps[key] = {value: destProp, size: 1};
    const polygonIndices = geometry.polygons.polygonIndices.value;
    for (let i = 0; i < polygonIndices.length - 1; i++) {
      const startIndex = polygonIndices[i];
      const endIndex = polygonIndices[i + 1];
      const featureId = geometry.polygons.globalFeatureIds.value[startIndex];
      destProp.fill(sourceProp[featureId], startIndex, endIndex);
    }
  }

  return geometry;
}
