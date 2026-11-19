// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  type GetPickingInfoParams,
  type Layer,
  type LayerProps,
  type PickingInfo,
  type Unit,
  type UpdateParameters
} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {RecordBatch, Table} from 'apache-arrow';
import {ArrowScatterplotLayer, type ArrowScatterplotLayerProps} from './arrow-scatterplot-layer';
import {ArrowPathLayer, type ArrowPathLayerProps} from './arrow-path-layer';
import {
  ArrowSolidPolygonLayer,
  type ArrowSolidPolygonLayerProps
} from './arrow-solid-polygon-layer';

import {
  makeGeoArrowFeatures,
  makeGeoArrowFeatureAccessor,
  type GeoArrowFeatureProperties
} from './geoarrow-feature-data';
import {resolveGeoArrowGeometry, type GeoArrowLayerGeometryType} from './resolve-geoarrow-geometry';

export {resolveGeoArrowGeometry, type GeoArrowLayerGeometryType} from './resolve-geoarrow-geometry';

/** GeoArrow metadata-driven composite props. Geometry-specific props pass to the selected child. */
export type GeoArrowLayerProps = Omit<LayerProps, 'data'> & {
  /** Geometry table, record batch, or a URL or promise that resolves to one. */
  data?: Table | RecordBatch | string | Promise<Table | RecordBatch> | null;
  /** Geometry column. Defaults to the first field with GeoArrow extension metadata. */
  getGeometry?: string;
  /** Explicit geometry encoding when extension metadata is absent. */
  geometryType?: GeoArrowLayerGeometryType;
  /** Point radius column or constant. */
  getRadius?: ArrowScatterplotLayerProps['getRadius'];
  /** Point fill or polygon fill color. */
  getFillColor?:
    | ArrowScatterplotLayerProps['getFillColor']
    | ArrowSolidPolygonLayerProps['getFillColor'];
  /** Linestring color. */
  colors?: ArrowPathLayerProps['colors'];
  /** Linestring width. */
  widths?: ArrowPathLayerProps['widths'];
  /** Multiplier applied to point radii in pixels. */
  radiusScale?: number;
  /** Minimum point radius in pixels. */
  radiusMinPixels?: number;
  /** Maximum point radius in pixels. */
  radiusMaxPixels?: number;
  /** Units for line widths. Defaults to pixels. */
  widthUnits?: Unit;
  /** Multiplier applied to line widths. */
  widthScale?: number;
  /** Minimum line width in pixels. */
  widthMinPixels?: number;
  /** Maximum line width in pixels. */
  widthMaxPixels?: number;
  /** Optional pre-tessellated polygon interpretation. */
  tessellated?: ArrowSolidPolygonLayerProps['tessellated'];
  /** GPU model selection forwarded to the selected native renderer. */
  model?: ArrowPathLayerProps['model'];
};

/**
 * Renders GeoArrow geometry with source-row picking.
 * WKB, WKT, mixed geometry, MultiPoint, and MultiLineString use GeoJSON
 * dispatch and accept CPU-readable style columns.
 */
export class GeoArrowLayer extends CompositeLayer<GeoArrowLayerProps> {
  static override layerName = 'GeoArrowLayer';

  /** Rebuilds decoded features only when the geometry input changes. */
  override updateState(params: UpdateParameters<this>): void {
    super.updateState(params);
    /** Current source and geometry selection. */
    const {props, oldProps, changeFlags} = params;
    if (
      this.state.geometry &&
      !changeFlags.dataChanged &&
      props.data === oldProps.data &&
      props.getGeometry === oldProps.getGeometry &&
      props.geometryType === oldProps.geometryType
    ) {
      return;
    }
    /** Resolved data. The base layer supplies an empty array before loading. */
    const {data} = props;
    if (!data || typeof data !== 'object' || !('schema' in data)) {
      this.setState({geometry: null, features: null});
      return;
    }
    /** Selected field and declared encoding. */
    const geometry = resolveGeoArrowGeometry(data, props.getGeometry, props.geometryType);
    switch (geometry.geometryType) {
      case 'geoarrow.point':
      case 'geoarrow.linestring':
      case 'geoarrow.polygon':
      case 'geoarrow.multipolygon':
        this.setState({geometry, features: null});
        break;
      default:
        this.setState({
          geometry,
          features: makeGeoArrowFeatures(data, geometry.columnName, geometry.geometryType)
        });
    }
  }

  /** Restores the original Arrow row for both native and decoded geometry. */
  override getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    /** Selection after the geometry sublayer resolves multipart features. */
    const info = super.getPickingInfo(params);
    /** Source table for the picked row. */
    const {data} = this.props;
    if (info.index >= 0 && data && typeof data === 'object' && 'schema' in data) {
      info.index = this.state.features ? info.object.properties.rowIndex : info.index;
      info.object = data.get(info.index);
    }
    return info;
  }

  /** Dispatches prepared geometry to its renderer. */
  override renderLayers(): Layer | null {
    const {
      data,
      getGeometry,
      geometryType,
      getRadius,
      getFillColor,
      colors,
      widths,
      tessellated,
      model,
      ...layerProps
    } = this.props;
    /** Geometry prepared for the current input. */
    const {geometry, features} = this.state;
    if (!geometry || !data || typeof data !== 'object' || !('schema' in data)) {
      return null;
    }
    if (features) {
      /** Inherited extension and accessor refresh triggers for the decoded child. */
      const subLayerProps = this.getSubLayerProps({id: 'features'});
      return new GeoJsonLayer<GeoArrowFeatureProperties>({
        ...layerProps,
        ...subLayerProps,
        data: features,
        highlightedObjectIndex:
          layerProps.highlightedObjectIndex == null
            ? null
            : features.findIndex(
                feature => feature.properties.rowIndex === layerProps.highlightedObjectIndex
              ),
        stroked: false,
        pointRadiusUnits: 'pixels',
        pointRadiusScale: layerProps.radiusScale ?? 1,
        pointRadiusMinPixels: layerProps.radiusMinPixels ?? 0,
        pointRadiusMaxPixels: layerProps.radiusMaxPixels ?? 1e9,
        lineWidthUnits: layerProps.widthUnits ?? 'pixels',
        lineWidthScale: layerProps.widthScale ?? 1,
        lineWidthMinPixels: layerProps.widthMinPixels ?? 0,
        lineWidthMaxPixels: layerProps.widthMaxPixels ?? Number.MAX_SAFE_INTEGER,
        getPointRadius: makeGeoArrowFeatureAccessor(data, getRadius, 1),
        getFillColor: makeGeoArrowFeatureAccessor(data, getFillColor, [0, 0, 0, 255]),
        getLineColor: makeGeoArrowFeatureAccessor(data, colors, [0, 0, 0, 255]),
        getLineWidth: makeGeoArrowFeatureAccessor(data, widths, 1),
        updateTriggers: {
          ...layerProps.updateTriggers,
          ...subLayerProps.updateTriggers,
          getPointRadius: [getRadius, layerProps.updateTriggers?.getRadius],
          getFillColor: [getFillColor, layerProps.updateTriggers?.getFillColor],
          getLineColor: [colors, layerProps.updateTriggers?.colors],
          getLineWidth: [widths, layerProps.updateTriggers?.widths]
        }
      });
    }
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
          colors,
          widths,
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
    return null;
  }
}
