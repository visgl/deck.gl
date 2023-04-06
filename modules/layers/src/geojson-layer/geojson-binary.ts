// This module implement some utility functions to work with
// the geojson-binary format defined at loaders.gl:
// https://github.com/visgl/loaders.gl/blob/master/modules/gis/docs/api-reference/geojson-to-binary.md

import {
  BinaryFeatures,
  BinaryLineFeatures,
  BinaryPointFeatures,
  BinaryPolygonFeatures,
  Feature
} from '@loaders.gl/schema';

export type BinaryFeatureTypes = BinaryPointFeatures | BinaryLineFeatures | BinaryPolygonFeatures;

type FeaureOnlyProperties = Pick<Feature, 'properties'>;

/**
 * Return the feature for an accesor
 */
export function binaryToFeatureForAccesor(
  data: BinaryFeatureTypes,
  index: number
): FeaureOnlyProperties | null {
  if (!data) {
    return null;
  }

  const featureIndex = 'startIndices' in data ? (data as any).startIndices[index] : index;
  const geometryIndex = data.featureIds.value[featureIndex];

  if (featureIndex !== -1) {
    return getPropertiesForIndex(data, geometryIndex, featureIndex);
  }

  return null;
}

function getPropertiesForIndex(
  data: BinaryFeatureTypes,
  propertiesIndex: number,
  numericPropsIndex: number
): FeaureOnlyProperties {
  const feature = {
    properties: {...data.properties[propertiesIndex]}
  };

  for (const prop in data.numericProps) {
    feature.properties[prop] = data.numericProps[prop].value[numericPropsIndex];
  }

  return feature;
}

// Custom picking color to keep binary indexes
export function calculatePickingColors(
  geojsonBinary: BinaryFeatures,
  encodePickingColor: (id: number, result: number[]) => void
): Record<string, Uint8ClampedArray | null> {
  const pickingColors: Record<string, Uint8ClampedArray | null> = {
    points: null,
    lines: null,
    polygons: null
  };
  for (const key in pickingColors) {
    const featureIds = geojsonBinary[key].globalFeatureIds.value;
    pickingColors[key] = new Uint8ClampedArray(featureIds.length * 3);
    const pickingColor = [];
    for (let i = 0; i < featureIds.length; i++) {
      encodePickingColor(featureIds[i], pickingColor);
      pickingColors[key]![i * 3 + 0] = pickingColor[0];
      pickingColors[key]![i * 3 + 1] = pickingColor[1];
      pickingColors[key]![i * 3 + 2] = pickingColor[2];
    }
  }

  return pickingColors;
}

// Returns an array where each index contains a global feature id and the corresponding value 
// is the feature id in the respective layer that feature will be rendered in
export function calculateGlobalToLocalFeatureIds(geojsonBinary: BinaryFeatures) {
  const {points, lines, polygons} = geojsonBinary;

  const globalToLocalFeatureIds: number[] = [];
  if (polygons) {
    for (let i = 0; i < polygons.polygonIndices.value.length - 1; i++) {
      const startIdx = polygons.polygonIndices.value[i];
      const globalFeatureId = polygons.globalFeatureIds.value[startIdx];
      globalToLocalFeatureIds[globalFeatureId] = i;
    }
  }
  if (lines) {
    for (let i = 0; i < lines.pathIndices.value.length - 1; i++) {
      const startIdx = lines.pathIndices.value[i];
      const globalFeatureId = lines.globalFeatureIds.value[startIdx];
      globalToLocalFeatureIds[globalFeatureId] = i;
    }
  }
  if (points) {
    for (let i = 0; i < points.featureIds.value.length; i++) {
      const globalFeatureId = points.globalFeatureIds.value[points.featureIds.value[i]];
      globalToLocalFeatureIds[globalFeatureId] = i;
    }
  }

  return globalToLocalFeatureIds;
}
