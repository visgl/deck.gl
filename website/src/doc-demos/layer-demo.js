import React from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import styled from 'styled-components';

import {MAPBOX_STYLES} from '../constants/defaults';

const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 11,
  maxZoom: 20,
  pitch: 30,
  bearing: 0
};

const initialViewStateSerialized = JSON.stringify(INITIAL_VIEW_STATE, null, 2)
  .replace(/"/g, '')  // remove quotes
  .replace(/\n/g, '\n  ');  // add indent

const TOOLTIP_STYLE = {
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9
};

const DemoPlaceholder = styled.div`
height: 50vh;
min-height: 200px;

@media screen and (max-width: 768px) {
  height: 60vh;
}
`;

const DemoContainer = styled.div`
height: 50vh;
min-height: 200px;
position: absolute;
width: 100%;
left: 0;
top: 0;
overflow: hidden;

@media screen and (max-width: 768px) {
  height: 60vh;
}
`;

const DemoSourceLink = styled.div`
position: absolute;
top: 0;
right: 0;
padding: 8px;
background: #fff;
margin: 12px;
box-shadow: 0 2px 4px rgba(0,0,0,0.3);
cursor: pointer;
font-weight: bold;
font-size: 12px;

&:hover {
  color: ${props => props.theme.colors.primary};
}

svg {
  width: 20px;
  vertical-align: middle;
  margin-right: 4px;
}
`;

function gotoSource(config) {
  const {Layer, getTooltip, props, mapStyle = MAPBOX_STYLES.LIGHT, dependencies = [], loaders, imports} = config;

  const symbols = ['DeckGL', Layer.layerName];
  if (imports) {
    symbols.push(...Object.keys(imports));
  }

  // https://blog.codepen.io/documentation/prefill/
  const source = `\
/*
 * ${window.location.href}
 */
const {${symbols.join(', ')}} = deck;
${loaders ? `\
const {${['registerLoaders', ...loaders].join(', ')}} = loaders;

registerLoaders([${loaders.join(', ')}]);` : ''}

const layer = new ${Layer.layerName}(${props});

new DeckGL({
  ${mapStyle ? `mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',` : ''}
  initialViewState: ${initialViewStateSerialized},
  controller: true,
  ${getTooltip ? `getTooltip: ${getTooltip},` : ''}
  layers: [layer]
});
  `;
  
  const formData = {
    js_external: dependencies.concat([
      'https://unpkg.com/deck.gl@latest/dist.min.js',
      'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js'
    ]).join(';'),
    title: `deck.gl ${Layer.layerName}`,
    parent: 48721472,
    tags: ['webgl', 'data visualization'],
    editors: '001',
    css: `
  body {
    margin: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  
  .deck-tooltip {
    font-size: 0.8em;
    font-family: Helvetica, Arial, sans-serif;
  }
  `,
    js: source
  };

  const form = document.createElement('form');
  form.action = 'https://codepen.io/pen/define/';
  form.method = 'POST';
  form.style.display = 'none';
  document.body.appendChild(form);
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'data';
  input.value = JSON.stringify(formData);
  form.appendChild(input);
  window.open('', 'deck-example-codepen');
  form.target = 'deck-example-codepen';
  form.submit();
  form.remove();
}

export default function makeLayerDemo(config) {
  const {Layer, getTooltip, props, mapStyle = MAPBOX_STYLES.LIGHT, imports} = config;

  function Demo() {
    const _getTooltip = getTooltip && eval(getTooltip);
    const styledGetTooltip = pickingInfo => {
      const text = _getTooltip && _getTooltip(pickingInfo);
      return text && {
        text,
        style: TOOLTIP_STYLE
      };
    };

    const layerProps = eval(`(function getProps(globals){
      const _global = typeof global === 'undefined' ? self : global;
      Object.assign(_global, globals);
      return ${props};
    })`)(imports);
    const layer = new Layer(layerProps);

    return (
      <DemoPlaceholder>
        <DemoContainer>
          <DeckGL
            pickingRadius={5}
            initialViewState={INITIAL_VIEW_STATE}
            getTooltip={styledGetTooltip}
            controller={true}
            layers={[layer]}
          >
            {mapStyle && <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />}
          </DeckGL>
        </DemoContainer>
        <DemoSourceLink onClick={() => gotoSource(config)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
          Edit on Codepen
        </DemoSourceLink>
      </DemoPlaceholder>
    );
  }
  return React.memo(Demo);
}
