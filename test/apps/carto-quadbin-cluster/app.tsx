import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import {TooltipContent} from 'modules/core/src/lib/tooltip';
import {PickingInfo} from '@deck.gl/core';
import {colorContinuous, fetchMap} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';

import RangeInput from './range-input';
import {GL} from '@luma.gl/constants';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const BLENDING = {
  'Normal': 'normal',
  'Additive': 'additive',
  'Subtractive': 'subtractive'
};

const PALETTES = {
  ArmyRose: 'ArmyRose',
  DarkMint: 'DarkMint',
  Emrld: 'Emrld',
  Peach: 'Peach',
  Prism: 'Prism',
  Sunset: 'Sunset',
  Temps: 'Temps',
  Tropic: 'Tropic',
  Vivid: 'Vivid'
};

const LABELS = {
  None: 'None',
  Full: 'Full',
  Rounded: 'Rounded'
};

function getTooltip({
  object
}: PickingInfo<{count: number; id: bigint; __sourceTile: any}>): TooltipContent {
  if (!object) return null;
  const {count} = object;
  return `count: ${count}`;
}

export default function App({layers, initialViewState, mapStyle = MAP_STYLE}) {
  const [blending, setBlending] = useState(Object.values(BLENDING)[0]);
  const [labels, setLabels] = useState(Object.values(LABELS)[2]);
  const [palette, setPalette] = useState(Object.values(PALETTES)[3]);
  const [radiusRange, setRadiusRange] = useState<[number, number]>([20, 100]);
  const [aggregation, setAggregation] = useState(5);
  const [opacity, setOpacity] = useState(50);
  const [lineWidth, setLineWidth] = useState(1);

  layers = layers.map((l: any) => {
    const {layerName} = l.constructor;
    if (!['QuadbinTileLayer'].includes(layerName)) {
      return l;
    }

    return l.clone({
      aggregation,
      radiusRange, 
      highlightColor: [255, 255, 255, 50],
      getFillColor: colorContinuous({attr: 'value', domain: [0, 1], colors: palette}),
      ...(labels !== 'None' && {
        getText: labels === 'Full' ? d => String(d.count) : d => formatCount(d.count)
      }),
      updateTriggers: {
        getFillColor: [opacity, palette],
        getText: labels
      },
      parameters: createParameters(blending),
      opacity: opacity / 100,

      getLineWidth: lineWidth,
      stroked: lineWidth > 0,
      getLineColor: [255, 255, 255],
      lineWidthUnits: 'pixels'
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
      <ObjectSelect title="labels" obj={LABELS} value={labels} onSelect={setLabels} top={30} />
      <ObjectSelect title="blending" obj={BLENDING} value={blending} onSelect={setBlending} top={60} />
      <RangeInput
        name={'Radius'}
        bottom={150}
        min={0}
        max={100}
        value={radiusRange}
        onChange={setRadiusRange}
        formatLabel={(x: number, index: number) => {
          const label = index === 0 ? 'min' : 'max';
          return formatLabel(x, label);
        }}
      />
      <RangeInput
        name={'Cluster size'}
        bottom={100}
        min={1}
        max={7}
        value={aggregation}
        onChange={setAggregation}
        formatLabel={(x: number) => formatLabel(x, 'size')}
      />
      <RangeInput
        name={'Opacity'}
        bottom={50}
        min={0}
        max={100}
        value={opacity}
        onChange={setOpacity}
        formatLabel={(x: number) => formatLabel(x, '')}
      />
      <RangeInput
        name={'Line width'}
        bottom={0}
        min={0}
        max={10}
        value={lineWidth}
        onChange={setLineWidth}
        formatLabel={(x: number) => formatLabel(x, 'pixels')}
      />
    </>
  );
}

export function renderToDOM(container: HTMLElement) {
  const root = createRoot(container);
  const params = new URLSearchParams(location.search.slice(1));
  const cartoMapId = params.has('id') ? params.get('id')! : '82729c69-cc8d-4b65-a01a-2a0ed1a18818';

  fetchMap({cartoMapId}).then(
    ({initialViewState, layers}) => {
      root.render(<App initialViewState={initialViewState} layers={layers} />);
    }
  );
}

function formatLabel(n: number, label: string) {
  return `${label ? label + ': ' : ''}` + Math.round(n);
}

function ObjectSelect({title, obj, value, onSelect, top = 0}) {
  const keys = Object.values(obj);
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

function formatCount(count: number): string {
  if (count < 1000) {
    return `${count}`;
  }
  if (count < 1000000) {
    const thousands = Math.floor(count / 1000);
    return `${thousands}k`;
  }
  const millions = Math.floor(count / 1000000);
  return `${millions}M`;
}

function createParameters(blending) {
  const parameters: any = {depthTest: false};
  if (blending === 'additive') {
    parameters.blendFunc = [GL.SRC_ALPHA, GL.DST_ALPHA];
    parameters.blendEquation = GL.FUNC_ADD;
  } else if (blending === 'subtractive') {
    parameters.blendFunc = [GL.ONE, GL.ONE_MINUS_DST_COLOR, GL.SRC_ALPHA, GL.DST_ALPHA];
    parameters.blendEquation = [GL.FUNC_SUBTRACT, GL.FUNC_ADD];
  }

  return parameters;
}
