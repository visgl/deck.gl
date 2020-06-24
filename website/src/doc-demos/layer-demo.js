import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import styled from 'styled-components';

import {MAPBOX_STYLES} from '../constants/defaults';
import {getLayerParams, ASYNC_ORIGINAL} from '../utils/layer-params';
import makeExample from '../components/example';

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

const DemoPlaceholder = styled.div`
height: 30vh;
min-height: 200px;
transition: height 300ms;
pointer-events: none;

&:hover {
  height: 80vh;
}
@media screen and (max-width: 768px) {
  &:hover {
    height: 60vh;
  }
}
`;

const DemoOuterContainer = styled.div`
height: 30vh;
min-height: 200px;
transition: height 300ms;
position: absolute;
width: 100%;
left: 0;
top: 0;
overflow: hidden;

&:hover {
  height: 80vh;
}
@media screen and (max-width: 768px) {
  &:hover {
    height: 60vh;
  }
}
`;

const DemoInnerContainer = styled.div`
position: absolute;
width: 100%;
height: 80vh;
pointer-events: all;

#deckgl-wrapper {
  transform: translateY(-25%);
  transition: transform 300ms;
}
&:hover #deckgl-wrapper {
  transform: translateY(0);
}
@media screen and (max-width: 768px) {
  height: 60vh;
}
`;

export default function makeLayerDemo({layer, getTooltip, parameters, mapStyle = MAPBOX_STYLES.LIGHT}) {

  const renderLayer = (params, props = {}) => {
    if (params) {
      Object.keys(params).forEach(key => {
        props[key] = params[key].value;
        if (key.startsWith('get')) {
          props.updateTriggers = props.updateTriggers || {};
          props.updateTriggers[key] = props[key];
        }
      });
    }

    return layer.clone(props);
  };

  class DemoClass extends Component {
    static parameters = getLayerParams(layer, parameters);

    static title = layer.constructor.layerName;

    static renderInfo() {
      const name = layer.constructor.layerName;
      const dataUrl = layer.props[ASYNC_ORIGINAL].data;

      return (
        <div>
          <p>
            Explore {name}
            's API <br />
            {dataUrl && (
              <a href={dataUrl} target="_new">
                Sample data
              </a>
            )}
          </p>
        </div>
      );
    }

    _getTooltip(pickedInfo) {
      if (!pickedInfo.picked) {
        return null;
      }
      return {
        text: getTooltip ? getTooltip(pickedInfo) : pickedInfo.index,
        style: TOOLTIP_STYLE
      };
    }

    render() {
      const {params} = this.props;
      const layers = [renderLayer(params)];

      return (
        <DeckGL
          pickingRadius={5}
          initialViewState={INITIAL_VIEW_STATE}
          getTooltip={this._getTooltip}
          controller={true}
          layers={layers}
        >
          {mapStyle && <StaticMap reuseMaps mapStyle={mapStyle.LIGHT} preventStyleDiffing={true} />}
        </DeckGL>
      );
    }
  }

  const Demo = makeExample(DemoClass);

  return () => <DemoPlaceholder><DemoOuterContainer><DemoInnerContainer><Demo /></DemoInnerContainer></DemoOuterContainer></DemoPlaceholder>;
}
