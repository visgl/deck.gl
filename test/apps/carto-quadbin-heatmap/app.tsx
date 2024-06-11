import {getResolution} from 'quadbin';
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import {PickingInfo} from '@deck.gl/core';
import {fetchMap, HeatmapTileLayer} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';

import RangeInput from './range-input';
import {getPalette, getPaletteGradient} from './palette-utils';

const PALETTES = {
  Prism: 'Prism',
  'Prism 1': 'Prism-1',
  'Prism 2': 'Prism-2',
  Vivid: 'Vivid',
  Sunset: 'Sunset',
  Temps: 'Temps'
};

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
let KEY = undefined;

// Rough estimate, should consider scaling due to Mercator projection also
const EARTH_SURFACE = 510 * 10e6;
const DENSITY_UNITS = '/km²';

function getTooltip(info?: PickingInfo): any {
  if (!info?.object) return null;

  const cellResolution = Number(getResolution(info.object.id));
  const unitDensity = Math.pow(4.0, cellResolution);
  const value = info.object.properties[KEY];
  const density = (value * unitDensity) / EARTH_SURFACE;
  return `${KEY}: ${Math.round(density)}${DENSITY_UNITS}`;
}

export default function App({layers, initialViewState = INITIAL_VIEW_STATE, mapStyle = MAP_STYLE}) {
  const [palette, setPalette] = useState(Object.values(PALETTES)[0]);
  const [colorDomain, setColorDomain] = useState<[number, number]>([0, 100]);
  const [radiusPixels, setRadiusPixels] = useState(20);
  const [visible, setVisible] = useState(false);
  const [maxDensity, setMaxDensity] = useState(1);
  const linearGradient = getPaletteGradient(palette);
  const colorRange = getPalette(palette, false);

  layers = layers.map((l: any) => {
    const {layerName} = l.constructor;
    if (!l.props.visible) return null;

    if (!['QuadbinTileLayer'].includes(layerName)) {
      return l;
    }

    const getWeight = d => {
      if (!KEY) KEY = Object.keys(d.properties)[0];
      let value = d.properties[KEY];
      value = isNaN(value) ? 1 : value;
      return value;
    };

    return new HeatmapTileLayer(l.props, {
      // Heatmap effect props
      colorDomain: colorDomain.map(n => n / 100) as [number, number],
      colorRange,
      radiusPixels,
      visible,
      onViewportLoad: () => setVisible(true),
      onMaxDensityChange: setMaxDensity,
      intensity: 10,

      getWeight,
      opacity: 0.8,
      pickable: true,
      autoHighlight: false
    });
  });

  return (
    <>
      <DeckGL
        layers={layers}
        initialViewState={initialViewState}
        controller={true}
        getTooltip={getTooltip}
      >
        {/*
        // @ts-ignore */}
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>
      <ObjectSelect title="palette" obj={PALETTES} value={palette} onSelect={setPalette} />
      <div
        style={{
          position: 'absolute',
          top: 33,
          right: 3,
          width: 192,
          height: 20,
          background: linearGradient,
          border: '3px solid white'
        }}
      ></div>
      <RangeInput
        bottom={60}
        min={0}
        max={100}
        value={colorDomain}
        onChange={setColorDomain}
        formatLabel={(x: number, index: number) => {
          const label = index === 0 ? 'min' : 'max';
          return formatLabel(x, label);
        }}
      />
      <RangeInput
        bottom={0}
        min={0}
        max={100}
        value={radiusPixels}
        onChange={setRadiusPixels}
        formatLabel={(x: number) => formatLabel(x, 'radius')}
      />
      <div
        style={{
          position: 'absolute',
          padding: 4,
          background: 'white',
          right: 3,
          top: 64,
          width: 190
        }}
      >{`Max density: ${Math.round(maxDensity / EARTH_SURFACE)}${DENSITY_UNITS}`}</div>
    </>
  );
}

// const apiBaseUrl = 'https://-us-east1-24.dev.api.carto.com';
const apiBaseUrl = 'https://gcp-us-east1-24.dev.api.carto.com';

export function renderToDOM(container: HTMLElement) {
  const root = createRoot(container);

  fetchMap({
    apiBaseUrl,
    cartoMapId: '7d802fb9-db3d-41d8-a2f0-8f3efda83f2a'
  }).then(
    // cartoMapId: '4b093ac8-b58d-40ba-ba62-fa7d6e59a06f'}).then(
    // cartoMapId: 'b66d2b74-6b82-4849-9f74-e569f8fbf423'}).then(
    // cartoMapId: '78ca1fc9-b6ec-4345-9ac9-1628c3c7d21c'}).then(<-- use default apiBaseUrl
    ({initialViewState, layers}) => {
      root.render(<App initialViewState={initialViewState} layers={layers} />);
    }
  );
}

function ObjectSelect({title, obj, value, onSelect, top = 0}) {
  const keys = Object.values(obj).sort();
  return (
    <>
      <select
        onChange={e => onSelect(e.target.value)}
        style={{position: 'absolute', padding: 4, margin: 2, width: 200, right: 0, top}}
        value={value}
      >
        <option hidden>{title}</option>
        {keys.map((f: any) => (
          <option key={f} value={f}>
            {`${title}: ${f}`}
          </option>
        ))}
      </select>
      <br></br>
    </>
  );
}

function formatLabel(n: number, label: string) {
  return `${label ? label + ': ' : ''}` + Math.round(n);
}
