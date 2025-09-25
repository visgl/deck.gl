// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayerProps, DefaultProps} from '@deck.gl/core';
import {_Tile2DHeader, TripsLayer, TripsLayerProps} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';

import type {TilejsonResult} from '@carto/api-client';
import VectorTileLayer, {VectorTileLayerProps} from './vector-tile-layer';
import {transformTrajectoryData, type TileBounds, normalizeTimestamp} from './trajectory-utils';
import {autocomputeSpeed} from './trajectory-speed-utils';
import {createBinaryProxy, createEmptyBinary} from '../utils';

const defaultProps: DefaultProps<TrajectoryTileLayerProps> = {
  ...TripsLayer.defaultProps,
  data: VectorTileLayer.defaultProps.data,
  autocomputeSpeed: false,
  renderMode: 'trips',
  currentTime: 0,
  trailLength: 1000
};

/** All properties supported by TrajectoryTileLayer. */
export type TrajectoryTileLayerProps<FeaturePropertiesT = unknown> = _TrajectoryTileLayerProps &
  Omit<TripsLayerProps<FeaturePropertiesT>, 'data'> &
  Pick<
    VectorTileLayerProps<FeaturePropertiesT>,
    'getFillColor' | 'getLineColor' | 'uniqueIdProperty'
  >;

/** Properties added by TrajectoryTileLayer. */
type _TrajectoryTileLayerProps = {
  data: null | TilejsonResult | Promise<TilejsonResult>;

  /**
   * Set to true to automatically compute speed for each vertex and store in properties.speed
   */
  autocomputeSpeed?: boolean;

  /**
   * Rendering mode for trajectories.
   * - 'paths': Static path rendering
   * - 'trips': Animated trip rendering with time controls
   */
  renderMode?: 'paths' | 'trips';
};

/**
 * Helper function to wrap `getFillColor` accessor into a `getLineColor` accessor
 * which will invoke `getFillColor` for each vertex in the line
 * @param getFillColor
 * @returns
 */
function getLineColorFromFillColor(getFillColor: TrajectoryTileLayerProps['getFillColor']) {
  return (d: any, info: any) => {
    const {index, data, target} = info;
    const startIndex = data.startIndices[index];
    const endIndex = data.startIndices[index + 1];
    const nVertices = endIndex - startIndex;
    const colors = new Array(nVertices).fill(0).map((_, i) => {
      const vertexIndex = startIndex + i;
      const properties = createBinaryProxy(data, vertexIndex);
      const vertex = {properties} as any;
      return typeof getFillColor === 'function'
        ? getFillColor(vertex, {index: vertexIndex, data, target})
        : getFillColor;
    });

    return colors;
  };
}

// @ts-ignore
export default class TrajectoryTileLayer<
  FeaturePropertiesT = any,
  ExtraProps extends {} = {}
> extends VectorTileLayer<FeaturePropertiesT, Required<_TrajectoryTileLayerProps> & ExtraProps> {
  static layerName = 'TrajectoryTileLayer';
  static defaultProps = defaultProps;

  state!: VectorTileLayer['state'] & {
    trajectoryIdColumn: string;
    timestampColumn: string;
    minTime: number;
    maxTime: number;
  };

  constructor(...propObjects: TrajectoryTileLayerProps<FeaturePropertiesT>[]) {
    // @ts-ignore
    super(...propObjects);
  }

  updateState(parameters) {
    super.updateState(parameters);
    if (parameters.props.data && parameters.props.data.widgetSource) {
      const dataSourceProps = parameters.props.data.widgetSource.props;
      const {trajectoryIdColumn, timestampColumn} = dataSourceProps;

      if (!trajectoryIdColumn) {
        throw new Error(
          'TrajectoryTileLayer: trajectoryIdColumn is required in data source configuration'
        );
      }
      if (!timestampColumn) {
        throw new Error(
          'TrajectoryTileLayer: timestampColumn is required in data source configuration'
        );
      }

      this.setState({trajectoryIdColumn, timestampColumn});
    }

    // Read timestampRange from the data source (tilejson)
    if (parameters.props.data && parameters.props.data.timestampRange) {
      const {min, max} = parameters.props.data.timestampRange;
      const minTime = normalizeTimestamp(min);
      const maxTime = normalizeTimestamp(max);
      this.setState({minTime, maxTime});
    }
  }

  async getTileData(tile) {
    const data = await super.getTileData(tile);
    if (!data || !data.points) return data;

    // Get tile bounds from the tile object
    const tileBounds = tile.bbox as TileBounds;
    const {minTime, maxTime} = this.state;

    const lines = transformTrajectoryData(
      data.points,
      this.state.trajectoryIdColumn,
      this.state.timestampColumn,
      tileBounds,
      {min: minTime, max: maxTime}
    );

    if (!lines) return null;
    if (this.props.autocomputeSpeed) {
      autocomputeSpeed(lines);
    }
    return {...createEmptyBinary(), lines};
  }

  renderSubLayers(
    props: TrajectoryTileLayerProps & {
      id: string;
      data: any;
      _offset: number;
      tile: _Tile2DHeader;
      _subLayerProps: CompositeLayerProps['_subLayerProps'];
    }
  ): GeoJsonLayer | GeoJsonLayer[] | null {
    if (props.data === null) {
      return null;
    }

    // This may not be as efficient as just rendering a PathLayer, but it allows to
    // switch between the render modes without reloading data
    const showTrips = props.renderMode === 'trips';

    // Normalize currentTime to match the normalized timestamps in the data
    const normalizedCurrentTime = props.currentTime! - this.state.minTime;
    const {minTime, maxTime} = this.state;
    const totalTimeSpan = maxTime - minTime;

    const layerProps = {
      getWidth: props.getWidth,
      widthUnits: props.widthUnits || 'pixels',
      lineJointRounded: props.jointRounded !== undefined ? props.jointRounded : true,
      capRounded: props.capRounded !== undefined ? props.capRounded : true,
      _pathType: props._pathType || 'open'
    };

    const getLineColor = props.getFillColor
      ? getLineColorFromFillColor(props.getFillColor)
      : props.getLineColor;

    const modifiedProps = {
      ...props,
      getLineColor,
      _subLayerProps: {
        ...props._subLayerProps,
        linestrings: {
          type: TripsLayer,
          currentTime: showTrips ? normalizedCurrentTime : totalTimeSpan,
          trailLength: showTrips ? props.trailLength : totalTimeSpan,
          parameters: {depthTest: false},
          ...layerProps,
          ...props._subLayerProps?.linestrings
        }
      }
    };

    return super.renderSubLayers(modifiedProps as any);
  }
}
