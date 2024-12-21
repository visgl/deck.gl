import type {BinaryFeatures} from '@loaders.gl/schema';
/**
 * Return the index of feature (numericProps or featureIds) for given feature id
 * Example: findIndexBinary(data, 'id', 33) will return the index in the array of numericProps
 * of the feature 33.
 * @param {Object} data - The data in binary format
 * @param {String} uniqueIdProperty - Name of the unique id property
 * @param {Number|String} featureId - feature id to find
 * @param {String} layerName - the layer to search in
 */
export default function findIndexBinary(
  data: BinaryFeatures,
  uniqueIdProperty: string,
  featureId: string | number,
  layerName: string
): number;
// # sourceMappingURL=find-index-binary.d.ts.map
