import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import {PickingInfo} from '@deck.gl/core';
import {fetchMap, getPaletteGradient, QuadbinHeatmapTileLayer} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';

import RangeInput from './range-input';

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

function getTooltip(info?: PickingInfo): any {
  if (!info?.object) return null;
  return info.object.properties.name;
}

export default function App({layers, initialViewState = INITIAL_VIEW_STATE, mapStyle = MAP_STYLE}) {
  const [palette, setPalette] = useState(Object.values(PALETTES)[0]);
  const [rangeScale, setRangeScale] = useState(300);
  const [radius, setRadius] = useState(20);

  const linearGradient = getPaletteGradient(palette);

  layers = layers.map((l: any) => {
    const {layerName} = l.constructor;
    if (!['QuadbinTileLayer'].includes(layerName)) {
      return l;
    }

    return new QuadbinHeatmapTileLayer(l.props, {
      // Heatmap effect props
      palette,
      radiusPixels: radius,
      rangeScale,

      getWeight: d => d.properties.population_sum,
      pickable: false
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
        min={10}
        max={1000}
        value={rangeScale}
        onChange={setRangeScale}
        formatLabel={(x: number) => formatLabel(x, 'intensity')}
      />
      <RangeInput
        bottom={0}
        min={0}
        max={30}
        value={radius}
        onChange={setRadius}
        formatLabel={(x: number) => formatLabel(x, 'radius')}
      />
    </>
  );
}

export function renderToDOM(container: HTMLElement) {
  const root = createRoot(container);

  fetchMap({cartoMapId: '78ca1fc9-b6ec-4345-9ac9-1628c3c7d21c'}).then(
    ({initialViewState, layers}) => {
      root.render(<App initialViewState={initialViewState} layers={layers} />);
    }
  );
}

function ObjectSelect({title, obj, value, onSelect}) {
  const keys = Object.values(obj).sort();
  return (
    <>
      <select
        onChange={e => onSelect(e.target.value)}
        style={{position: 'absolute', padding: 4, margin: 2, width: 200, right: 0}}
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
