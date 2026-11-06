// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_StatefulComponent} from '@deck.gl/core';

/** Cartesian bins exposed by the lifecycle POC. */
export type GridBin = {position: [number, number, number]; value: number; count: number};

/** Declarative computation whose owner supplies scheduling and identity. */
export abstract class Aggregation<PropsT extends {}> extends _StatefulComponent<PropsT> {
  /** Compute output after relevant props change. */
  protected abstract updateAggregation(): void;
  protected updateComponentState(): void {
    this.updateAggregation();
  }
}

/** Inputs for the Cartesian SUM example. */
export type GridAggregationProps<DataT> = {
  id: string;
  data: readonly DataT[];
  cellSize: number;
  getPosition: (datum: DataT) => readonly number[];
  getWeight: (datum: DataT) => number;
  updateTriggers?: Record<string, unknown>;
};

/** Minimal CPU grid demonstrating independently diffed aggregation props. */
export class GridAggregation<DataT = any> extends Aggregation<GridAggregationProps<DataT>> {
  static componentName = 'GridAggregation';
  static defaultProps = {
    id: 'grid-aggregation',
    data: {type: 'data', value: []},
    cellSize: {type: 'number', value: 1, min: Number.EPSILON},
    getPosition: {type: 'accessor', value: (d: any) => d.position},
    getWeight: {type: 'accessor', value: () => 1},
    updateTriggers: {}
  };

  /** Output identity remains stable until aggregation is recomputed. */
  get bins(): GridBin[] {
    return this.state.bins || [];
  }

  protected updateAggregation(): void {
    const {data, cellSize, getPosition, getWeight} = this.props;
    if (!(cellSize > 0) || !Number.isFinite(cellSize)) throw new Error('Invalid cellSize');
    const bins = new Map<string, GridBin>();
    for (const datum of data) {
      const p = getPosition(datum);
      const x = Math.floor(p[0] / cellSize);
      const y = Math.floor(p[1] / cellSize);
      const key = `${x},${y}`;
      let bin = bins.get(key);
      if (!bin) {
        bin = {position: [(x + 0.5) * cellSize, (y + 0.5) * cellSize, 0], value: 0, count: 0};
        bins.set(key, bin);
      }
      bin.value += getWeight(datum);
      bin.count++;
    }
    this.state.bins = Array.from(bins.values());
  }
}
