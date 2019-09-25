import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';

import {MAPBOX_STYLES} from '../../constants/defaults';
import {getLayerParams} from '../../utils/layer-params';

const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 11,
  maxZoom: 20,
  pitch: 30,
  bearing: 0
};

const TOOLTIP_STYLE = {
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9
};

export default function createLayerDemoClass(settings) {
  const renderLayer = (data, params, extraProps = {}) => {
    if (!data && !settings.allowMissingData) {
      return null;
    }

    const props = {...settings.props, ...extraProps, data};

    if (params) {
      Object.keys(params).forEach(key => {
        props[key] = params[key].value;
        if (key.startsWith('get')) {
          props.updateTriggers = props.updateTriggers || {};
          props.updateTriggers[key] = props[key];
        }
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

    static get parameters() {
      return getLayerParams(renderLayer([]), settings.propParameters);
    }

    static renderInfo() {
      const name = settings.Layer.layerName;
      return (
        <div>
          <h3>{name}</h3>
          <p>
            Explore {name}
            's API <br />
            {settings.dataUrl && (
              <a href={settings.dataUrl} target="_new">
                Sample data
              </a>
            )}
          </p>
        </div>
      );
    }

    constructor(props) {
      super(props);
      this.state = {
        hoveredItem: null
      };
    }

    _getTooltip(pickedInfo) {
      if (!pickedInfo.object) {
        return null;
      }
      const {formatTooltip} = settings;
      return {
        text: formatTooltip ? formatTooltip(pickedInfo.object) : pickedInfo.index,
        style: TOOLTIP_STYLE
      };
    }

    render() {
      const {params, data} = this.props;
      const layers = [renderLayer(data, params)];

      return (
        <DeckGL
          pickingRadius={5}
          initialViewState={INITIAL_VIEW_STATE}
          getTooltip={this._getTooltip}
          controller={true}
          layers={layers}
        >
          <StaticMap reuseMaps mapStyle={MAPBOX_STYLES.LIGHT} preventStyleDiffing={true} />
        </DeckGL>
      );
    }
  }

  return DemoClass;
}
