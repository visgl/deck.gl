import React, {Component} from 'react';
import DeckGL from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import autobind from 'autobind-decorator';

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

export default function createLayerDemoClass(settings) {
  const renderLayer = (data, params, extraProps = {}) => {
    if (!data && !settings.allowMissingData) {
      return null;
    }

    const props = {...settings.props, ...extraProps, data};

    if (params) {
      Object.keys(params).forEach(key => {
        props[key] = params[key].value;
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

    @autobind
    _onHover(info) {
      this.setState({hoveredItem: info});
    }

    _renderTooltip() {
      const {hoveredItem} = this.state;
      if (hoveredItem && hoveredItem.index >= 0) {
        const {formatTooltip} = settings;
        const info = formatTooltip ? formatTooltip(hoveredItem.object) : hoveredItem.index;
        return (
          info && (
            <div className="tooltip" style={{left: hoveredItem.x, top: hoveredItem.y}}>
              {info
                .toString()
                .split('\n')
                .map((str, i) => (
                  <p key={i}>{str}</p>
                ))}
            </div>
          )
        );
      }
      return null;
    }

    render() {
      const {params, data} = this.props;
      const layers = [
        renderLayer(data, params, {
          onHover: this._onHover
        })
      ];

      return (
        <div>
          <DeckGL pickingRadius={5}
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers} >
            <StaticMap reuseMaps
              mapStyle={MAPBOX_STYLES.LIGHT}
              mapboxApiAccessToken={process.env.MapboxAccessToken} />
          </DeckGL>
          {this._renderTooltip()}
        </div>
      );
    }
  }

  return DemoClass;
}
