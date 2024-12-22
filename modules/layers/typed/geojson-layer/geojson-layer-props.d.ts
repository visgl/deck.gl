import {BinaryAttribute, LayerProps} from '@deck.gl/core';
import {PolygonLayerProps, ScatterplotLayerProps} from '..';
import {BinaryFeatures} from '@loaders.gl/schema';
import {SeparatedGeometries} from './geojson';
declare type PathLayerProps = LayerProps & Record<string, any>;
declare type SubLayersProps = {
  points: Partial<ScatterplotLayerProps>;
  lines: Partial<PathLayerProps>;
  polygons: Partial<PolygonLayerProps>;
  polygonsOutline: Partial<PathLayerProps>;
};
declare type ExtendedBinaryFeatures = {
  [P in keyof BinaryFeatures]: BinaryFeatures[P] & {
    attributes?: Record<string, BinaryAttribute>;
  };
};
export declare function createLayerPropsFromFeatures(
  features: SeparatedGeometries,
  featuresDiff: any
): SubLayersProps;
export declare function createLayerPropsFromBinary(
  geojsonBinary: Required<ExtendedBinaryFeatures>,
  encodePickingColor: any
): SubLayersProps;
export {};
// # sourceMappingURL=geojson-layer-props.d.ts.map
