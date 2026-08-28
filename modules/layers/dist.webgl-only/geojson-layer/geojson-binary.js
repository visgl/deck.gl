// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/**
 * Return the feature for an accesor
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
        properties: { ...data.properties[propertiesIndex] }
    };
    for (const prop in data.numericProps) {
        feature.properties[prop] = data.numericProps[prop].value[numericPropsIndex];
    }
    return feature;
}
// Custom picking indexes preserve global feature ids in binary data.
export function calculatePickingIndexes(geojsonBinary) {
    const pickingIndexes = {
        points: null,
        lines: null,
        polygons: null
    };
    for (const key in pickingIndexes) {
        const featureIds = geojsonBinary[key].globalFeatureIds.value;
        pickingIndexes[key] = new Uint32Array(featureIds);
    }
    return pickingIndexes;
}
//# sourceMappingURL=geojson-binary.js.map