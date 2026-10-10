// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Layer, type LayerProps} from '@deck.gl/core';
import {RecordBatch, Table} from 'apache-arrow';
import {ArrowScatterplotLayer, type ArrowScatterplotLayerProps} from './arrow-scatterplot-layer';
import {ArrowPathLayer, type ArrowPathLayerProps} from './arrow-path-layer';
import {
  ArrowSolidPolygonLayer,
  type ArrowSolidPolygonLayerProps
} from './arrow-solid-polygon-layer';

/** Native GeoArrow geometries dispatched by the composite layer. */
export type GeoArrowLayerGeometryType =
  | 'geoarrow.point'
  | 'geoarrow.linestring'
  | 'geoarrow.polygon'
  | 'geoarrow.multipolygon';

/** GeoArrow metadata-driven composite props. Geometry-specific props pass to the selected child. */
export type GeoArrowLayerProps = Omit<LayerProps, 'data'> & {
  data: Table | RecordBatch;
  /** Geometry column. Defaults to the first field with GeoArrow extension metadata. */
  getGeometry?: string;
  /** Explicit native encoding when extension metadata is absent. */
  geometryType?: GeoArrowLayerGeometryType;
  /** Point radius column or constant. */
  getRadius?: ArrowScatterplotLayerProps['getRadius'];
  /** Point fill or polygon fill color. */
  getFillColor?:
    | ArrowScatterplotLayerProps['getFillColor']
    | ArrowSolidPolygonLayerProps['getFillColor'];
  /** Linestring color. */
  getColor?: ArrowPathLayerProps['color'];
  /** Linestring width. */
  getWidth?: ArrowPathLayerProps['width'];
  /** Optional pre-tessellated polygon interpretation. */
  tessellated?: ArrowSolidPolygonLayerProps['tessellated'];
  /** GPU model selection forwarded to the selected native renderer. */
  model?: ArrowPathLayerProps['model'];
};

/** Selects an Arrow core layer from GeoArrow field metadata without materializing GeoJSON. */
export class GeoArrowLayer extends CompositeLayer<GeoArrowLayerProps> {
  static override layerName = 'GeoArrowLayer';

  override renderLayers(): Layer {
    const {
      data,
      getGeometry,
      geometryType,
      getRadius,
      getFillColor,
      getColor,
      getWidth,
      tessellated,
      model,
      ...layerProps
    } = this.props;
    const geometry = resolveGeoArrowGeometry(data, getGeometry, geometryType);
    switch (geometry.geometryType) {
      case 'geoarrow.point':
        return new ArrowScatterplotLayer({
          ...layerProps,
          id: `${this.props.id}-points`,
          data,
          getPosition: geometry.columnName,
          getRadius,
          getFillColor: getFillColor as ArrowScatterplotLayerProps['getFillColor']
        } as ArrowScatterplotLayerProps);
      case 'geoarrow.linestring':
        return new ArrowPathLayer({
          ...layerProps,
          id: `${this.props.id}-paths`,
          data,
          paths: geometry.columnName,
          color: getColor,
          width: getWidth,
          model
        } as ArrowPathLayerProps);
      case 'geoarrow.polygon':
      case 'geoarrow.multipolygon':
        return new ArrowSolidPolygonLayer({
          ...layerProps,
          id: `${this.props.id}-polygons`,
          data,
          getPolygon: geometry.columnName,
          getFillColor: getFillColor as ArrowSolidPolygonLayerProps['getFillColor'],
          tessellated,
          model
        } as ArrowSolidPolygonLayerProps);
    }
  }
}

/** Resolves one native GeoArrow geometry column from schema extension metadata. */
export function resolveGeoArrowGeometry(
  data: Table | RecordBatch,
  columnName?: string,
  explicitGeometryType?: GeoArrowLayerGeometryType
): {columnName: string; geometryType: GeoArrowLayerGeometryType} {
  const fields = data.schema.fields;
  const field = columnName
    ? fields.find(candidate => candidate.name === columnName)
    : fields.find(candidate =>
        getGeoArrowExtensionName(candidate.metadata)?.startsWith('geoarrow.')
      );
  if (!field) {
    throw new Error(
      columnName
        ? `GeoArrowLayer geometry column "${columnName}" is missing`
        : 'GeoArrowLayer could not find a GeoArrow extension field'
    );
  }
  const extensionName = explicitGeometryType ?? getGeoArrowExtensionName(field.metadata);
  if (!isSupportedGeoArrowGeometryType(extensionName)) {
    throw new Error(
      `GeoArrowLayer does not yet dispatch "${extensionName ?? 'untyped'}"; use a native point, linestring, polygon, or multipolygon field`
    );
  }
  return {columnName: field.name, geometryType: extensionName};
}

function getGeoArrowExtensionName(metadata: Map<string, string>): string | undefined {
  return metadata.get('ARROW:extension:name') ?? metadata.get('ARROW:extension_name');
}

function isSupportedGeoArrowGeometryType(
  value: string | undefined
): value is GeoArrowLayerGeometryType {
  return (
    value === 'geoarrow.point' ||
    value === 'geoarrow.linestring' ||
    value === 'geoarrow.polygon' ||
    value === 'geoarrow.multipolygon'
  );
}
