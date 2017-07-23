/* eslint-disable max-len */
import {CompositeLayer} from 'deck.gl';
import MultiIconLayer from './multi-icon-layer';
import {json as requestJson} from 'd3-request';
import {fontInfo} from './font';

/* Constants */
const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
  getText: x => x.text,
  getPosition: x => x.coordinates,
  getColor: x => x.color || DEFAULT_COLOR,
  getSize: x => x.size || 32,
  getAngle: x => x.angle || 0
};

export default class TextLayer extends CompositeLayer {

  initializeState() {
    this.state = {
      iconAtlas: fontInfo.data
    };
    this.cleanIconMapping(fontInfo.metadata);
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    if (changeFlags.dataChanged) {
      this.transformStringToLetters();
    }
  }

  transformStringToLetters() {
    const {data, getText, getPosition} = this.props;
    if (!data || data.length === 0) {
      return;
    }

    const transformedData = data.map(val => {
      const text = getText(val);
      const letters = Array.from(text);
      const position = getPosition(val);
      if (!text) {
        return [];
      }
      return letters.map((letter, i) => Object.assign({}, val, {text: letter, position, index: i, len: text.length}));
    }).reduce((prev, curr) => [...prev, ...curr]);

    this.setState({data: transformedData});
  }

  cleanIconMapping(iconMappingPath) {
    requestJson(iconMappingPath, (error, response) => {
      if (!error) {
        const iconMapping = {};
        response.forEach(val => {
          iconMapping[String.fromCharCode(val.index)] = {
            x: val.x,
            y: val.y,
            width: val.width,
            height: val.height,
            mask: true
          };
        });
        this.setState({iconMapping});

      } else {
        throw new Error(error.toString());
      }
    });
  }

  renderLayers() {
    const {data, iconAtlas, iconMapping} = this.state;
    const {getColor, getSize, getAngle} = this.props;

    return [
      new MultiIconLayer(Object.assign({}, this.props, {
        id: 'multi-icon-layer-for-text-rendering',
        data,
        iconAtlas,
        iconMapping,
        getIcon: d => d.text,
        getPosition: d => d.position,
        getLetterIndexInString: d => d.index,
        getStringLength: d => d.len,
        getColor,
        getSize,
        getAngle,
        updateTriggers: {
          getAngle,
          getColor,
          getSize
        }
      }))
    ];
  }
}

TextLayer.layerName = 'TextLayer';
TextLayer.defaultProps = defaultProps;
