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
import {GeoJsonLayer, type GeoJsonLayerProps} from '@deck.gl/layers';
import {convertGeoArrowGeometry} from '@loaders.gl/core/geoarrow';
import {DataType, Table, type RecordBatch} from 'apache-arrow';
import type {Feature, Geometry} from 'geojson';
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
export type GeoArrowLayerProps = Omit<LayerProps, 'data'> &
  Pick<
    GeoJsonLayerProps,
    'filled' | 'stroked' | 'extruded' | 'wireframe' | 'elevationScale' | 'material'
  > & {
    /** Polygon elevation constant, field name, or Arrow column in source row order. */
    getElevation?: number | string | import('apache-arrow').Vector;
    /** A GeoArrow table or batch, or a URL or promise that resolves to one. */
    data?: Table | RecordBatch | string | Promise<Table | RecordBatch> | null;
    /** Geometry column. Defaults to the declared primary geometry or first GeoArrow field. */
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

  declare state: {
    /** Native geometry with the layout required by the renderer. */
    renderData?: Table | RecordBatch | null;
    /** Selected column and encoding for the loaded source. */
    geometry?: {columnName: string; geometryType: GeoArrowLayerGeometryType} | null;
    /** Decoded geometry for formats handled by the GeoJSON renderer. */
    features?: Feature<Geometry, GeoArrowFeatureProperties>[] | null;
  };

  /** Rebuilds decoded features only when the geometry input changes. */
  override updateState(params: UpdateParameters<this>): void {
    super.updateState(params);
    /** Current source and geometry selection. */
    const {props, oldProps, changeFlags} = params;
    const data = this.getSourceData();
    if (!data?.numRows) {
      this.setState({geometry: null, features: null, renderData: null});
      return;
    }
    if (
      this.state.geometry &&
      !changeFlags.dataChanged &&
      props.data === oldProps.data &&
      this.usesGeoJsonRenderer(props, this.state.geometry.geometryType) ===
        this.usesGeoJsonRenderer(oldProps, this.state.geometry.geometryType) &&
      props.getGeometry === oldProps.getGeometry &&
      props.geometryType === oldProps.geometryType
    ) {
      return;
    }
    /** Selected field and declared encoding. */
    const geometry = resolveGeoArrowGeometry(data, props.getGeometry, props.geometryType);
    /** Whether the geometry encoding supports native rendering before styling is considered. */
    const native = [
      'geoarrow.point',
      'geoarrow.linestring',
      'geoarrow.polygon',
      'geoarrow.multipolygon'
    ].includes(geometry.geometryType);
    /** Prepared renderer input stays columnar when the selected renderer supports it. */
    const useNative = native && !this.usesGeoJsonRenderer(props, geometry.geometryType);
    this.setState({
      geometry,
      renderData: useNative ? this.prepareNativeGeometry(data, geometry) : data,
      features: useNative
        ? null
        : makeGeoArrowFeatures(data, geometry.columnName, geometry.geometryType)
    });
  }

  /** Restores the original Arrow row for both native and decoded geometry. */
  override getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    /** Selection after the geometry sublayer resolves multipart features. */
    const info = super.getPickingInfo(params);
    const data = this.getSourceData();
    if (data && info.index >= 0) {
      info.index = this.state.features ? info.object.properties.rowIndex : info.index;
      info.object = data.get(info.index);
    }
    return info;
  }

  /** Dispatches prepared geometry to its renderer. */
  override renderLayers(): Layer | null {
    const {
      data: _source,
      dataTransform: _dataTransform,
      query: _query,
      onDataLoad: _onDataLoad,
      onDataProgress: _onDataProgress,
      getGeometry,
      geometryType,
      getRadius,
      getFillColor,
      getElevation,
      colors,
      widths,
      tessellated,
      model,
      ...layerProps
    } = this.props;
    /** Geometry prepared for the current input. */
    const {geometry, features, renderData: data} = this.state;
    if (!data || !geometry) {
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
        stroked: layerProps.stroked ?? false,
        getElevation: makeGeoArrowFeatureAccessor(data, getElevation, 1000),
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
          getElevation: [getElevation, layerProps.updateTriggers?.getElevation],
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
          ...this.getSubLayerProps({id: 'points'}),
          data,
          getPosition: geometry.columnName,
          getRadius,
          getFillColor: getFillColor as ArrowScatterplotLayerProps['getFillColor']
        } as ArrowScatterplotLayerProps);
      case 'geoarrow.linestring':
        return new ArrowPathLayer({
          ...layerProps,
          ...this.getSubLayerProps({id: 'paths'}),
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
          ...this.getSubLayerProps({id: 'polygons'}),
          data,
          getPolygon: geometry.columnName,
          getFillColor: getFillColor as ArrowSolidPolygonLayerProps['getFillColor'],
          tessellated,
          model
        } as ArrowSolidPolygonLayerProps);
    }
    return null;
  }

  /** Uses the standard renderer for polygon faces and extensions that require its attributes. */
  private usesGeoJsonRenderer(
    props: GeoArrowLayerProps,
    geometryType: GeoArrowLayerGeometryType
  ): boolean {
    /** Polygon-only styles never change the renderer for native points or lines. */
    const isPolygon =
      geometryType === 'geoarrow.polygon' || geometryType === 'geoarrow.multipolygon';
    return Boolean(
      props.extensions?.length ||
        (isPolygon &&
          (props.extruded || props.wireframe || props.stroked || props.filled === false))
    );
  }

  /** Adapts separated coordinates without expanding the source into feature rows. */
  private prepareNativeGeometry(
    data: Table | RecordBatch,
    geometry: {columnName: string; geometryType: GeoArrowLayerGeometryType}
  ): Table | RecordBatch {
    let type = data.getChild(geometry.columnName)?.type;
    while (type && DataType.isList(type)) {
      type = type.children[0].type;
    }
    if (!type || !DataType.isStruct(type)) {
      return data;
    }
    const table = 'batches' in data ? data : new Table(data.schema, [data]);
    return convertGeoArrowGeometry(table, geometry.geometryType, {
      geometryColumn: geometry.columnName,
      coordinates: 'interleaved',
      fallback: 'error'
    });
  }

  /** Returns the Arrow source after Layer resolves an asynchronous data prop. */
  private getSourceData(): Table | RecordBatch | null {
    const {data} = this.props;
    return data && typeof data === 'object' && 'schema' in data ? data : null;
  }
}
