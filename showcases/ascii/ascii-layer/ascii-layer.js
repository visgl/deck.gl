import {CompositeLayer, IconLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {makeFontAtlas} from '@deck.gl/layers/dist/esm/text-layer/font-atlas';
import AsciiFilter from './ascii-filter';

const LETTER_HEIGHT = 32;
const PADDING = -4;

const defaultProps = {
  video: null,
  fontFamily: '"Lucida Console", Monaco, monospace',
  timestamp: 0,
  sizeScale: 1
};

export default class AsciiLayer extends CompositeLayer {
  updateState({props, oldProps}) {
    if (props.fontFamily !== oldProps.fontFamily) {
      this._createFontTexture(props.fontFamily);
    }

    if (!props.video || !props.video.readyState) {
      return;
    }

    const {viewport} = this.context;
    const {dimension} = this._updateDimension({
      sizeScale: props.sizeScale,
      width: viewport.width,
      height: viewport.height
    });
    // Update texture
    const attributeBuffers = this.state.filter.getBuffers({
      width: dimension[0],
      height: dimension[1],
      video: props.video
    });

    this.setState({attributeBuffers});
  }

  _createFontTexture(fontFamily) {
    const {gl} = this.context;
    const {mapping: iconMapping, texture: iconAtlas} = makeFontAtlas(gl, {fontFamily});

    let maxAspectRatio = 0;
    for (const char in iconMapping) {
      const {width, height} = iconMapping[char];
      const aspectRatio = width / height;
      maxAspectRatio = aspectRatio > maxAspectRatio ? aspectRatio : maxAspectRatio;
    }

    this.setState({
      iconAtlas,
      iconMapping,
      letterAspectRatio: maxAspectRatio,
      filter: new AsciiFilter(gl, {iconMapping, iconAtlas})
    });
  }

  _updateDimension({width, height, sizeScale}) {
    if (
      width === this.state.width &&
      height === this.state.height &&
      sizeScale === this.state.sizeScale
    ) {
      return this.state;
    }

    const {letterAspectRatio} = this.state;
    const vSpacing = sizeScale * (LETTER_HEIGHT + PADDING);
    const hSpacing = vSpacing * letterAspectRatio;

    const xCount = Math.ceil(width / hSpacing);
    const yCount = Math.ceil(height / vSpacing);
    const grid = [];

    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        grid.push({
          x: (x + 0.5) * hSpacing - width / 2,
          y: (y + 0.5) * vSpacing - height / 2,
          u: x / xCount,
          v: y / yCount
        });
      }
    }
    const newState = {
      grid,
      dimension: [xCount, yCount],
      width,
      height,
      sizeScale
    };
    this.setState(newState);

    return newState;
  }

  renderLayers() {
    if (!this.props.video || !this.props.video.readyState) {
      return null;
    }

    const {grid, iconAtlas, iconMapping, attributeBuffers} = this.state;
    const {sizeScale, timestamp} = this.props;

    return new IconLayer({
      id: 'text',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: grid,
      opacity: 1,
      iconAtlas,
      iconMapping,
      sizeScale: LETTER_HEIGHT * sizeScale,

      getIcon: d => ' ',
      // getColor: d => d.color,
      getPosition: d => [d.x, d.y],

      ...attributeBuffers,

      updateTriggers: {
        getIcon: timestamp,
        getColor: timestamp
      }
    });
  }
}

AsciiLayer.layerName = 'AsciiLayer';
AsciiLayer.defaultProps = defaultProps;
