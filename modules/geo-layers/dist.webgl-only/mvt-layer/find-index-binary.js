// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const GEOM_TYPES = ['points', 'lines', 'polygons'];
/**
 * Return the index of feature (numericProps or featureIds) for given feature id
 * Example: findIndexBinary(data, 'id', 33) will return the index in the array of numericProps
 * of the feature 33.
 */
export default function findIndexBinary(data, // The data in binary format
uniqueIdProperty, // Name of the unique id property
featureId, // feature id to find
layerName // the layer to search in
) {
    for (const gt of GEOM_TYPES) {
        const index = data[gt] && findIndexByType(data[gt], uniqueIdProperty, featureId, layerName);
        if (index >= 0) {
            return index;
        }
    }
    return -1;
}
function findIndexByType(geomData, uniqueIdProperty, featureId, layerName) {
    const featureIds = geomData.featureIds.value;
    if (!featureIds.length) {
        return -1;
    }
    let startFeatureIndex = 0;
    let endFeatureIndex = featureIds[featureIds.length - 1] + 1;
    if (layerName) {
        const layerRange = getLayerRange(geomData, layerName);
        if (layerRange) {
            startFeatureIndex = layerRange[0];
            endFeatureIndex = layerRange[1] + 1;
        }
        else {
            return -1;
        }
    }
    // Look for the uniqueIdProperty
    let featureIndex = -1;
    if (uniqueIdProperty in geomData.numericProps) {
        const vertexIndex = geomData.numericProps[uniqueIdProperty].value.findIndex((x, i) => x === featureId && featureIds[i] >= startFeatureIndex && featureIds[i] < endFeatureIndex);
        return vertexIndex >= 0 ? geomData.globalFeatureIds.value[vertexIndex] : -1;
    }
    else if (uniqueIdProperty) {
        featureIndex = findIndex(geomData.properties, elem => elem[uniqueIdProperty] === featureId, startFeatureIndex, endFeatureIndex);
    }
    else if (geomData.fields) {
        featureIndex = findIndex(geomData.fields, (elem) => elem.id === featureId, startFeatureIndex, endFeatureIndex);
    }
    return featureIndex >= 0 ? getGlobalFeatureId(geomData, featureIndex) : -1;
}
// Returns [firstFeatureIndex, lastFeatureIndex]
// MVTLoader parses tiles layer-by-layer, so each layer is a continuous range
function getLayerRange(geomData, layerName) {
    if (!geomData.__layers) {
        // Cache a map from properties.layerName to index ranges
        const layerNames = {};
        const { properties } = geomData;
        for (let i = 0; i < properties.length; i++) {
            const { layerName: key } = properties[i];
            if (!key) {
                // ignore
            }
            else if (layerNames[key]) {
                layerNames[key][1] = i;
            }
            else {
                layerNames[key] = [i, i];
            }
        }
        geomData.__layers = layerNames;
    }
    return geomData.__layers[layerName];
}
// Returns global feature id
function getGlobalFeatureId(geomData, featureIndex) {
    if (!geomData.__ids) {
        // Cache a map from featureId to globalFeatureId
        const result = [];
        const featureIds = geomData.featureIds.value;
        const globalFeatureIds = geomData.globalFeatureIds.value;
        for (let i = 0; i < featureIds.length; i++) {
            result[featureIds[i]] = globalFeatureIds[i];
        }
        geomData.__ids = result;
    }
    return geomData.__ids[featureIndex];
}
// Like array.findIndex, but only search within a range
function findIndex(array, predicate, startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
        if (predicate(array[i], i)) {
            return i;
        }
    }
    return -1;
}
//# sourceMappingURL=find-index-binary.js.map