// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  type GetPickingInfoParams,
  type Layer,
  type LayerProps,
  type PickingInfo,
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
  data: Table | RecordBatch;
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
    const {props, oldProps} = params;
    if (
      this.state.geometry &&
      props.data === oldProps.data &&
      props.getGeometry === oldProps.getGeometry &&
      props.geometryType === oldProps.geometryType
    ) {
      return;
    }
    /** Selected field and declared encoding. */
    const geometry = resolveGeoArrowGeometry(props.data, props.getGeometry, props.geometryType);
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
          features: makeGeoArrowFeatures(props.data, geometry.columnName, geometry.geometryType)
        });
    }
  }

  /** Restores the original Arrow row for both native and decoded geometry. */
  override getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    /** Selection after the geometry sublayer resolves multipart features. */
    const info = super.getPickingInfo(params);
    if (info.index >= 0) {
      info.index = this.state.features ? info.object.properties.rowIndex : info.index;
      info.object = this.props.data.get(info.index);
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
    if (features) {
      return new GeoJsonLayer<GeoArrowFeatureProperties>({
        ...layerProps,
        ...this.getSubLayerProps({id: 'features'}),
        data: features,
        stroked: false,
        getPointRadius: makeGeoArrowFeatureAccessor(data, getRadius, 1),
        getFillColor: makeGeoArrowFeatureAccessor(data, getFillColor, [0, 0, 0, 255]),
        getLineColor: makeGeoArrowFeatureAccessor(data, colors, [0, 0, 0, 255]),
        getLineWidth: makeGeoArrowFeatureAccessor(data, widths, 1),
        updateTriggers: {
          getPointRadius: getRadius,
          getFillColor,
          getLineColor: colors,
          getLineWidth: widths
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
