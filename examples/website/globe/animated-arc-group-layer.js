import {CompositeLayer} from '@deck.gl/core';
import AnimatedArcLayer from './animated-arc-layer';

const MAX_ARCS_PER_LAYER = 2500;

/** Same effect as the AnimatedArcLayer, but perf optimized.
 * Data is divided into smaller groups, and one sub layer is rendered for each group.
 * This allows us to cheaply cull invisible arcs by turning layers off and on.
 */
export default class AnimatedArcGroupLayer extends CompositeLayer {
  updateState({props, changeFlags}) {
    if (changeFlags.dataChanged) {
      // Sort and group data
      const {data, getSourceTimestamp, getTargetTimestamp} = props;
      const groups = sortAndGroup(data, getSourceTimestamp, getTargetTimestamp, MAX_ARCS_PER_LAYER);
      this.setState({groups});
    }
  }

  renderLayers() {
    const {timeRange} = this.props;
    const {groups = []} = this.state;

    return groups.map(
      (group, index) =>
        new AnimatedArcLayer(this.props, this.getSubLayerProps({
          id: index.toString(),
          data: group.data,
          visible: group.startTime < timeRange[1] && group.endTime > timeRange[0],
          timeRange
        }))
    );
  }
}

AnimatedArcGroupLayer.layerName = 'AnimatedArcGroupLayer';
AnimatedArcGroupLayer.defaultProps = AnimatedArcLayer.defaultProps;

function sortAndGroup(data, getStartTime, getEndTime, groupSize) {
  const groups = [];
  let group = null;

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
