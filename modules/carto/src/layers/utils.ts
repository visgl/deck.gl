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
    const geom = geometry[type];
    if (geom.positions.value.length === 0) {
      continue;
    }

    geom.properties = geom.properties.map(({geoid}) => mapping[geoid]);

    // numericProps need to be filled to match length of positions buffer
    const {positions, globalFeatureIds} = geom;
    let indices: TypedArray = null;
    if (type === 'lines') indices = geom.pathIndices.value;
    if (type === 'polygons') indices = geom.polygonIndices.value;
    const length = positions.value.length / positions.size;
    for (const key in properties.numericProps) {
      const sourceProp = properties.numericProps[key].value;
      const TypedArray = sourceProp.constructor;
      const destProp = new TypedArray(length);
      geom.numericProps[key] = {value: destProp, size: 1};

      if (!indices) {
        for (let i = 0; i < length; i++) {
          // points
          const featureId = globalFeatureIds.value[i];
          destProp[i] = sourceProp[featureId];
        }
      } else {
        // lines|polygons
        for (let i = 0; i < indices.length - 1; i++) {
          const startIndex = indices[i];
          const endIndex = indices[i + 1];
          const featureId = globalFeatureIds.value[startIndex];
          destProp.fill(sourceProp[featureId], startIndex, endIndex);
        }
      }
    }
  }

  return geometry;
}
