// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, UpdateParameters} from '@deck.gl/core';
import AnimatedArcLayer, {AnimatedArcLayerProps} from './animated-arc-layer';

const MAX_ARCS_PER_LAYER = 2500;

type ArcsGroup<DataT> = {
  startTime: number;
  endTime: number;
  data: DataT[];
};

/** Same effect as the AnimatedArcLayer, but perf optimized.
 * Data is divided into smaller groups, and one sub layer is rendered for each group.
 * This allows us to cheaply cull invisible arcs by turning layers off and on.
 */
export default class AnimatedArcGroupLayer<DataT = any, ExtraProps = {}> extends CompositeLayer<
  ExtraProps & Required<AnimatedArcLayerProps<DataT>>
> {
  layerName = 'AnimatedArcGroupLayer';
  defaultProps = AnimatedArcLayer.defaultProps;

  state!: {
    groups: ArcsGroup<DataT>[];
  };

  updateState({props, changeFlags}: UpdateParameters<this>) {
    if (changeFlags.dataChanged) {
      // Sort and group data
      const {data, getSourceTimestamp, getTargetTimestamp} = props;
      // @ts-ignore
      const groups = sortAndGroup(data, getSourceTimestamp, getTargetTimestamp);
      this.setState({groups});
    }
  }

  renderLayers() {
    const {timeRange} = this.props;
    const {groups = []} = this.state;

    return groups.map(
      (group, index) =>
        new AnimatedArcLayer(
          this.props,
          this.getSubLayerProps({
            id: index.toString(),
            data: group.data,
            visible: group.startTime < timeRange[1] && group.endTime > timeRange[0],
            timeRange
          })
        )
    );
  }
}

function sortAndGroup<DataT>(
  data: DataT[],
  getStartTime: (d: DataT) => number,
  getEndTime: (d: DataT) => number,
  groupSize: number = MAX_ARCS_PER_LAYER
): ArcsGroup<DataT>[] {
  const groups: ArcsGroup<DataT>[] = [];
  let group: ArcsGroup<DataT>;

  data.sort((d1, d2) => getStartTime(d1) - getStartTime(d2));

  for (const d of data) {
    if (!group || group.data.length >= groupSize) {
      group = {
        startTime: Infinity,
        endTime: -Infinity,
        data: []
      };
      groups.push(group);
    }
    group.data.push(d);
    group.startTime = Math.min(group.startTime, getStartTime(d));
    group.endTime = Math.max(group.endTime, getEndTime(d));
  }
  return groups;
}
