// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, type UpdateParameters} from '@deck.gl/core';
import {tableFromArrays, type Table} from 'apache-arrow';
import AnimatedArcLayer, {type AnimatedArcLayerProps} from './animated-arc-layer';
import type {Flight} from './app';

const MAX_ARCS_PER_LAYER = 2500;

/** Arrow batch and time bounds for culling arcs outside the current time window. */
type ArcGroup = {
  /** First departure in the group. */
  startTime: number;
  /** Last arrival in the group. */
  endTime: number;
  /** Source rows for the SQL position and timestamp accessors. */
  data: Table;
};

/** One day's decoded flights and the style of its animated arcs. */
type GroupProps = Omit<AnimatedArcLayerProps, 'data'> & {
  /** Flights with timestamps relative to the shared timeline. */
  data: Flight[];
};

/** Partitions flights for time-window culling and renders the visible Arrow groups. */
export default class AnimatedArcGroupLayer extends CompositeLayer<GroupProps> {
  static layerName = 'AnimatedArcGroupLayer';

  state!: {groups: ArcGroup[]};

  override updateState({props, changeFlags}: UpdateParameters<this>) {
    if (changeFlags.dataChanged) {
      this.setState({groups: groupFlights(props.data)});
    }
  }

  override renderLayers() {
    const timeRange: [number, number] = this.props.timeRange ?? [0, 1];
    return this.state.groups?.map(
      ({data, startTime, endTime}, index) =>
        new AnimatedArcLayer(this.props, this.getSubLayerProps({id: String(index)}), {
          data,
          visible: startTime < timeRange[1] && endTime > timeRange[0],
          getSourcePosition: {sql: 'FLOAT64x3(lon1, lat1, alt1)'},
          getTargetPosition: {sql: 'FLOAT64x3(lon2, lat2, alt2)'},
          getTimestamps: {sql: 'FLOAT32x2(time1, time2)'}
        })
    );
  }
}

/** Groups flights by departure time without mutating the source rows. */
function groupFlights(data: Flight[]): ArcGroup[] {
  const sorted = [...data].sort((left, right) => left.time1 - right.time1);
  const groups: ArcGroup[] = [];
  for (let start = 0; start < sorted.length; start += MAX_ARCS_PER_LAYER) {
    const flights = sorted.slice(start, start + MAX_ARCS_PER_LAYER);
    groups.push({
      startTime: flights[0].time1,
      endTime: flights.reduce((latest, flight) => Math.max(latest, flight.time2), -Infinity),
      data: tableFromArrays({
        lon1: Float64Array.from(flights, flight => flight.lon1),
        lat1: Float64Array.from(flights, flight => flight.lat1),
        alt1: Float64Array.from(flights, flight => flight.alt1),
        lon2: Float64Array.from(flights, flight => flight.lon2),
        lat2: Float64Array.from(flights, flight => flight.lat2),
        alt2: Float64Array.from(flights, flight => flight.alt2),
        time1: Float32Array.from(flights, flight => flight.time1),
        time2: Float32Array.from(flights, flight => flight.time2)
      })
    });
  }
  return groups;
}
