// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// This module implement some utility functions to work with
// the geojson-binary format defined at loaders.gl:
// https://github.com/visgl/loaders.gl/blob/master/modules/gis/docs/api-reference/geojson-to-binary.md

import {BinaryAttribute} from '@deck.gl/core';
import {
  BinaryFeatureCollection,
  BinaryLineFeature,
  BinaryPointFeature,
  BinaryPolygonFeature,
  Feature
} from '@loaders.gl/schema';

export type BinaryFeatureTypes = BinaryPointFeature | BinaryLineFeature | BinaryPolygonFeature;

export type ExtendedBinaryFeatureCollection = {
  [P in keyof Omit<BinaryFeatureCollection, 'shape'>]: BinaryFeatureCollection[P] & {
    attributes?: Record<string, BinaryAttribute>;
  };
};

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

// Custom picking indexes preserve global feature ids in binary data.
export function calculatePickingIndexes(
  geojsonBinary: Required<ExtendedBinaryFeatureCollection>
): Record<string, Uint32Array | null> {
  const pickingIndexes: Record<string, Uint32Array | null> = {
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
