import React, {Component} from 'react';
import DeckGL from 'deck.gl';
import autobind from 'autobind-decorator';

import {MAPBOX_STYLES} from '../../constants/defaults';

const defaultViewport = {
  mapStyle: MAPBOX_STYLES.LIGHT,
  longitude: -122.4,
  latitude: 37.7,
  zoom: 9,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

function propToParam(key, value) {
  const param = {
    name: key,
    displayName: key,
    value
  };

  switch (typeof value) {
  case 'boolean':
    return {...param, type: 'checkbox'};
  case 'number':
    if (/pixels|width|height|size|scale/i.test(key)) {
      param.max = 100;
      param.step = 1;
    } else {
      param.max = 1;
      param.step = 0.01;
    }
    return {...param, type: 'range', min: 0};
  case 'function':
    if (key.indexOf('get') === 0) {
      // is accessor
      return {...param, type: 'function'};
    }
    break;
  default:
  }
  return null;
}

function paramToProp(value, param) {
  return param.value;
}

export default function createLayerDemoClass(settings) {

  const renderLayer = (data, params, extraProps = {}) => {
    const props = {...settings.props, ...extraProps};
    props.data = data && data.features || data || [];

    if (params) {
      Object.keys(params).forEach(key => {
        props[key] = paramToProp(props[key], params[key]);
      });
    }

    return new settings.Layer(props);
  };

  class DemoClass extends Component {

    static get data() {
      return {
        url: settings.dataUrl
      };
    }

    static viewport = defaultViewport;

    static get parameters() {
      const layer = renderLayer();
      const params = {};

      Object.keys(layer.props).forEach(key => {
        const p = propToParam(key, layer.props[key]);
        if (p) {
          params[key] = p;
        }
      });

      return params;
    }

    static renderInfo() {
      const name = settings.Layer.layerName;
      return (
        <div>
          <h3>{ name }</h3>
          <p>Explore {name}'s API</p>
        </div>
      );
    }

    constructor(props) {
      super(props);
      this.state = {
        hoveredItem: null
      };
    }

    @autobind _onHover(info) {
      this.setState({hoveredItem: info});
    }

    _renderTooltip() {
      const {hoveredItem} = this.state;
      if (hoveredItem && hoveredItem.index >= 0) {
        const {formatTooltip} = settings;
        const info = formatTooltip ? formatTooltip(hoveredItem.object) : hoveredItem.index;
        return (
          <div className="tooltip"
            style={{left: hoveredItem.x, top: hoveredItem.y}}>
            { info }
          </div>
        );
      }
      return null;
    }

    render() {
      const {viewport, params, data} = this.props;
      const layer = renderLayer(data, params, {
        onHover: this._onHover
      });

      return (
        <div>
          <DeckGL {...viewport} layers={ [layer] } />
          { this._renderTooltip() }
        </div>
      );
    }
  }

  return DemoClass;
}
