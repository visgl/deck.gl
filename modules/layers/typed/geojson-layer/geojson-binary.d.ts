import {
  BinaryFeatures,
  BinaryLineFeatures,
  BinaryPointFeatures,
  BinaryPolygonFeatures,
  Feature
} from '@loaders.gl/schema';
export declare type BinaryFeatureTypes =
  | BinaryPointFeatures
  | BinaryLineFeatures
  | BinaryPolygonFeatures;
declare type FeaureOnlyProperties = Pick<Feature, 'properties'>;
/**
 * Return the feature for an accesor
 */
export declare function binaryToFeatureForAccesor(
  data: BinaryFeatureTypes,
  index: number
): FeaureOnlyProperties | null;
export declare function calculatePickingColors(
  geojsonBinary: BinaryFeatures,
  encodePickingColor: (id: number, result: number[]) => void
): Record<string, Uint8ClampedArray | null>;
export {};
// # sourceMappingURL=geojson-binary.d.ts.map
