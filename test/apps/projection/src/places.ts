// luma.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as arrow from 'apache-arrow';
import placesGeojson from '../places.geo.json';

type PlacesGeojsonFeatureCollection = {
  type: 'FeatureCollection';
  features: PlacesGeojsonFeature[];
};

type PlacesGeojsonFeature = {
  type: 'Feature';
  properties: {
    name: string;
    adm0name: string;
    pop_max: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
};

type PlacesArrowColumns = {
  coordinates: arrow.FixedSizeList<arrow.Float64>;
  name: arrow.Utf8;
  country: arrow.Utf8;
  population: arrow.Uint32;
};

export type PlacesArrowTable = arrow.Table<PlacesArrowColumns>;

export function generatePlaces(): PlacesArrowTable {
  return makePlacesArrowTable(placesGeojson as unknown as PlacesGeojsonFeatureCollection);
}

export function makePlacesArrowTable(
  featureCollection: PlacesGeojsonFeatureCollection
): PlacesArrowTable {
  const featureCount = featureCollection.features.length;
  const coordinateValues = new Float64Array(featureCount * 2);
  const nameValues = new Array<string>(featureCount);
  const countryValues = new Array<string>(featureCount);
  const populationValues = new Uint32Array(featureCount);

  for (let featureIndex = 0; featureIndex < featureCount; featureIndex++) {
    const feature = featureCollection.features[featureIndex];
    validatePlaceFeature(feature, featureIndex);

    const coordinateValueIndex = featureIndex * 2;
    coordinateValues[coordinateValueIndex] = feature.geometry.coordinates[0];
    coordinateValues[coordinateValueIndex + 1] = feature.geometry.coordinates[1];
    nameValues[featureIndex] = feature.properties.name;
    countryValues[featureIndex] = feature.properties.adm0name;
    populationValues[featureIndex] = feature.properties.pop_max;
  }

  const coordinates = makeFloat64Vector2(coordinateValues);
  const name = arrow.vectorFromArray(nameValues, new arrow.Utf8());
  const country = arrow.vectorFromArray(countryValues, new arrow.Utf8());
  const population = new arrow.Vector<arrow.Uint32>([
    new arrow.Data<arrow.Uint32>(new arrow.Uint32(), 0, featureCount, 0, {
      [arrow.BufferType.DATA]: populationValues
    })
  ]);

  return new arrow.Table<PlacesArrowColumns>({coordinates, name, country, population});
}

function makeFloat64Vector2(
  values: Float64Array
): arrow.Vector<arrow.FixedSizeList<arrow.Float64>> {
  const coordinateType = new arrow.FixedSizeList(
    2,
    new arrow.Field('values', new arrow.Float64(), false)
  );
  const coordinateValueData = new arrow.Data<arrow.Float64>(
    new arrow.Float64(),
    0,
    values.length,
    0,
    {
      [arrow.BufferType.DATA]: values
    }
  );
  const coordinateData = new arrow.Data<arrow.FixedSizeList<arrow.Float64>>(
    coordinateType,
    0,
    values.length / 2,
    0,
    {},
    [coordinateValueData]
  );

  return new arrow.Vector<arrow.FixedSizeList<arrow.Float64>>([coordinateData]);
}

function validatePlaceFeature(feature: PlacesGeojsonFeature, featureIndex: number): void {
  if (feature.geometry.type !== 'Point' || feature.geometry.coordinates.length !== 2) {
    throw new Error(`places.geojson feature ${featureIndex} must have Point geometry`);
  }
  if (
    typeof feature.geometry.coordinates[0] !== 'number' ||
    typeof feature.geometry.coordinates[1] !== 'number'
  ) {
    throw new Error(`places.geojson feature ${featureIndex} coordinates must be numeric`);
  }
  if (typeof feature.properties.name !== 'string') {
    throw new Error(`places.geojson feature ${featureIndex} properties.name must be a string`);
  }
  if (typeof feature.properties.adm0name !== 'string') {
    throw new Error(`places.geojson feature ${featureIndex} properties.adm0name must be a string`);
  }
  if (
    !Number.isInteger(feature.properties.pop_max) ||
    feature.properties.pop_max < 0 ||
    feature.properties.pop_max > 0xffffffff
  ) {
    throw new Error(`places.geojson feature ${featureIndex} properties.pop_max must fit uint32`);
  }
}
