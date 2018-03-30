/* eslint-disable max-len */
import {CompositeLayer, WebMercatorViewport} from 'deck.gl';
import {TextLayer} from 'deck.gl';
import TagMapWrapper from './tagmap-wrapper';
import colorbrewer from 'colorbrewer';

const defaultProps = {
  getLabel: x => x.label,
  getWeight: x => x.weight,
  getPosition: x => x.coordinates,
  colorScheme: colorbrewer.YlGnBu[9].slice(1, 6).reverse(),
  minFontSize: 14,
  maxFontSize: 32,
  weightThreshold: 1
};

export default class TagmapLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tags: []
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (changeFlags.dataChanged) {
      this.updateTagMapData();
      this.updateTagMapVis();
    } else if (
      changeFlags.viewportChanged ||
      props.minFontSize !== oldProps.minFontSize ||
      props.maxFontSize !== oldProps.maxFontSize ||
      props.weightThreshold !== oldProps.weightThreshold
    ) {
      this.updateTagMapVis();
    }
  }

  updateTagMapData() {
    const {data, getLabel, getPosition, getWeight} = this.props;
    const tagMap = new TagMapWrapper();
    tagMap.setData(data, {getLabel, getPosition, getWeight});
    this.setState({tagMap});
  }

  updateTagMapVis() {
    const {tagMap} = this.state;
    if (!tagMap) {
      return;
    }

    const {viewport} = this.context;
    const {minFontSize, maxFontSize, weightThreshold, colorScheme} = this.props;
    const transform = new WebMercatorViewport(Object.assign({}, viewport));

    tagMap.setVisParam({minFontSize, maxFontSize, weightThreshold, colorScheme});
    const tags = tagMap.getTags({transform, viewport});
    this.setState({tags});
  }

  renderLayers() {
    const {tags} = this.state;

    return [
      new TextLayer({
        id: 'tagmap-layer',
        data: tags,
        getText: d => d.label,
        getPosition: d => d.position,
        getColor: d => d.color,
        getSize: d => d.size
      })
    ];
  }
}

TagmapLayer.layerName = 'TagmapLayer';
TagmapLayer.defaultProps = defaultProps;
