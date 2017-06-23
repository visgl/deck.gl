/* global document, window */
/* eslint-disable max-len */
import {CompositeLayer, IconLayer, WebMercatorViewport} from 'deck.gl';
import {makeTextureAtlasFromLabels} from './label-utils';
import {tagmapLayout} from './tagmap-utils';
import colorbrewer from 'colorbrewer';

/* Constants */
const defaultProps = {
  getLabel: x => x.label,
  getWeight: x => x.weight,
  getPosition: x => x.coordinates,
  // ['#1d91c0', '#41b6c4', '#7fcdbb', '#c7e9b4', '#edf8b1']
  colorScheme: colorbrewer.YlGnBu[9].slice(1, 6).reverse(),
  minFontSize: 14,
  maxFontSize: 32,
  weightThreshold: 1
};

export default class TagmapLayer extends CompositeLayer {

  initializeState() {
    // create canvas for measuring the text size
    const canvas = document.createElement('canvas');
    this.state = {canvas};
  }

  updateState({props, oldProps, changeFlags}) {
    // super.updateState({props, oldProps, changeFlags});

    if (changeFlags.dataChanged) {
      this.updateLabelAtlas();
      this.updateLayout();
    } else if (changeFlags.viewportChanged ||
        props.minFontSize !== oldProps.minFontSize ||
        props.maxFontSize !== oldProps.maxFontSize ||
        props.weightThreshold !== oldProps.weightThreshold) {
      this.updateLayout();
    }
  }

  updateLabelAtlas() {
    const {data, getLabel} = this.props;
    if (!data || data.length === 0) {
      return;
    }

    const {gl} = this.context;
    // font size for texture generation
    const fontSize = 32;
    // avoid generating duplicate labels
    const labels = Array.from(new Set(data.map(getLabel)));
    // use the texture generator from label layer
    // need to be optimized
    const {texture, mapping} = makeTextureAtlasFromLabels(gl, {data: labels, fontSize});

    // mappingDict -- key: label, val: mapping box in the texture
    const mappingDict = {};
    mapping.forEach((x, i) => {
      mappingDict[labels[i]] = x;
    });
    this.setState({data, texture, mapping: mappingDict});
  }

  updateLayout() {
    const {data} = this.state;
    if (!data || data.length === 0) {
      return;
    }

    const {viewport} = this.context;
    // data accessor
    const {getPosition, getLabel, getWeight} = this.props;
    // vis param
    const {minFontSize, maxFontSize, weightThreshold, colorScheme} = this.props;
    const visParam = {minFontSize, maxFontSize, weightThreshold, colorScheme};

    // filter to only visualize labels in the viewport
    const transform = new WebMercatorViewport(Object.assign({}, viewport));
    const labelsInViewport = this.state.data.map(x => {
      const pCoords = transform.project(getPosition(x));
      return Object.assign({}, {pCoords}, x);
    }).filter(x => {
      return x.pCoords[0] >= 0 && x.pCoords[0] <= viewport.width && x.pCoords[1] >= 0 && x.pCoords[1] <= viewport.height;
    });

    // generate tagmap
    const {tags} = tagmapLayout(labelsInViewport, transform, this.state.canvas, {getLabel, getPosition: x => x.pCoords, getWeight}, visParam);
    this.setState({tags});
  }

  renderLayers() {
    const {tags} = this.state;

    return [
      new IconLayer(Object.assign({}, this.props, {
        id: 'tag-map',
        iconAtlas: this.state.texture,
        iconMapping: this.state.mapping,
        data: tags,
        // weird scaling related to texture mapping and viewport change (pitch)
        sizeScale: window.devicePixelRatio * 1.25,
        getIcon: d => d.term,
        getPosition: d => d.position,
        getColor: d => d.color,
        getSize: d => d.size
      }))
    ];
  }
}

TagmapLayer.layerName = 'TagmapLayer';
TagmapLayer.defaultProps = defaultProps;
