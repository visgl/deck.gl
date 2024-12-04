// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerData, LayerProps} from '@deck.gl/core';
import {PolygonLayerProps, ScatterplotLayerProps} from '..';
import {calculatePickingColors} from './geojson-binary';
import type {ExtendedBinaryFeatureCollection} from './geojson-binary';
import {SeparatedGeometries} from './geojson';

// TODO: PathLayer is not yet typed
type PathLayerProps = LayerProps & Record<string, any>;

export type SubLayersProps = {
  points: Partial<ScatterplotLayerProps>;
  lines: Partial<PathLayerProps>;
  polygons: Partial<PolygonLayerProps>;
  polygonsOutline: Partial<PathLayerProps>;
};

function createEmptyLayerProps(): SubLayersProps {
  return {
    points: {},
    lines: {},
    polygons: {},
    polygonsOutline: {}
  };
}

function getCoordinates(f) {
  return f.geometry.coordinates;
}

export function createLayerPropsFromFeatures(
  features: SeparatedGeometries,
  featuresDiff
): SubLayersProps {
  const layerProps = createEmptyLayerProps();
  const {pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures} = features;

  layerProps.points.data = pointFeatures;
  layerProps.points._dataDiff = featuresDiff.pointFeatures && (() => featuresDiff.pointFeatures);
  layerProps.points.getPosition = getCoordinates;

  layerProps.lines.data = lineFeatures;
  layerProps.lines._dataDiff = featuresDiff.lineFeatures && (() => featuresDiff.lineFeatures);
  layerProps.lines.getPath = getCoordinates;

  layerProps.polygons.data = polygonFeatures;
  layerProps.polygons._dataDiff =
    featuresDiff.polygonFeatures && (() => featuresDiff.polygonFeatures);
  layerProps.polygons.getPolygon = getCoordinates;

  layerProps.polygonsOutline.data = polygonOutlineFeatures;
  layerProps.polygonsOutline._dataDiff =
    featuresDiff.polygonOutlineFeatures && (() => featuresDiff.polygonOutlineFeatures);
  layerProps.polygonsOutline.getPath = getCoordinates;

  return layerProps;
}

export function createLayerPropsFromBinary(
  geojsonBinary: Required<ExtendedBinaryFeatureCollection>,
  encodePickingColor: (id: number, result: number[]) => void
): SubLayersProps {
  // The binary data format is documented here
  // https://github.com/visgl/loaders.gl/blob/master/modules/gis/docs/api-reference/geojson-to-binary.md
  // It is the default output from the `MVTLoader` and can also be obtained
  // from GeoJSON by using the `geojsonToBinary` utility function.
  const layerProps = createEmptyLayerProps();
  const {points, lines, polygons} = geojsonBinary;

  const customPickingColors = calculatePickingColors(geojsonBinary, encodePickingColor);

  layerProps.points.data = {
    length: points.positions.value.length / points.positions.size,
    attributes: {
      ...points.attributes,
      getPosition: points.positions,
      instancePickingColors: {
        size: 4,
        value: customPickingColors.points!
      }
    },
    properties: points.properties,
    numericProps: points.numericProps,
    featureIds: points.featureIds
  } as LayerData<any>;

  layerProps.lines.data = {
    length: lines.pathIndices.value.length - 1,
    startIndices: lines.pathIndices.value,
    attributes: {
      ...lines.attributes,
      getPath: lines.positions,
      instancePickingColors: {
        size: 4,
        value: customPickingColors.lines!
      }
    },
    properties: lines.properties,
    numericProps: lines.numericProps,
    featureIds: lines.featureIds
  } as LayerData<any>;
  layerProps.lines._pathType = 'open';

  layerProps.polygons.data = {
    length: polygons.polygonIndices.value.length - 1,
    startIndices: polygons.polygonIndices.value,
    attributes: {
      ...polygons.attributes,
      getPolygon: polygons.positions,
      pickingColors: {
        size: 4,
        value: customPickingColors.polygons!
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  } as LayerData<any>;
  layerProps.polygons._normalize = false;
  if (polygons.triangles) {
    (layerProps.polygons.data as any).attributes.indices = polygons.triangles.value;
  }

  layerProps.polygonsOutline.data = {
    length: polygons.primitivePolygonIndices.value.length - 1,
    startIndices: polygons.primitivePolygonIndices.value,
    attributes: {
      ...polygons.attributes,
      getPath: polygons.positions,
      instancePickingColors: {
        size: 4,
        value: customPickingColors.polygons!
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  } as LayerData<any>;
  layerProps.polygonsOutline._pathType = 'open';

  return layerProps;
}
