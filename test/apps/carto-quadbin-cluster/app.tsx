import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import {TooltipContent} from 'modules/core/src/lib/tooltip';
import {Accessor, Color, PickingInfo} from '@deck.gl/core';
import {ClusterTileLayer, colorContinuous, fetchMap} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';

import RangeInput from './range-input';
import {Feature} from '@loaders.gl/schema';
import {GL} from '@luma.gl/constants';
import {ScatterplotLayer} from 'deck.gl';
import {
  ClusteredFeaturePropertiesT,
  ParsedQuadbinCell
} from 'modules/carto/src/layers/cluster-utils';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const BLENDING = {
  Normal: 'normal',
  Additive: 'additive',
  Subtractive: 'subtractive'
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

const LABEL_ACCESSORS = {
  Full: d => String(d.properties.count),
  Rounded: d => formatCount(d.properties.count)
};

function getTooltip({object}: PickingInfo<Feature>): TooltipContent {
  if (!object?.properties) return null;
  return `count: ${object.properties.count}`;
}

export default function App({layers, initialViewState, mapStyle = MAP_STYLE}) {
  const [blending, setBlending] = useState(Object.values(BLENDING)[0]);
  const [labels, setLabels] = useState(Object.values(LABELS)[2]);
  const [palette, setPalette] = useState(Object.values(PALETTES)[3]);
  const [radiusRange, setRadiusRange] = useState<[number, number]>([20, 100]);
  const [clusterLevel, setClusterLevel] = useState(5);
  const [opacity, setOpacity] = useState(50);
  const [lineWidth, setLineWidth] = useState(1);

  layers = layers.map((l: any) => {
    const {layerName} = l.constructor;
    if (!['ClusterTileLayer'].includes(layerName)) {
      return l;
    }

    type PropertiesType = {
      longitude_count: number;
      longitude_average: number;
      latitude_average: number;
    };

    const clusterLayer = l as ClusterTileLayer<PropertiesType>;

    function normalize(value, min, max) {
      return (value - min) / Math.max(1, max - min);
    }
    const getFillColor: Accessor<Feature<any, PropertiesType>, Color> = colorContinuous({
      attr: (d: any) => {
        // Normalize value to range 0-1 to match domain
        const value = d.properties.longitude_count;
        const {min, max} = d.properties.stats.longitude_count;
        return normalize(value, min, max);
      },
      domain: [0, 1],
      colors: palette
    });

    const [radiusMin, radiusMax] = radiusRange;
    const radiusDelta = radiusMax - radiusMin;
    const getPointRadius: Accessor<
      Feature<any, ClusteredFeaturePropertiesT<PropertiesType>>,
      number
    > = d => {
      const value = d.properties.longitude_count;
      const {min, max} = d.properties.stats.longitude_count;
      const normalized = normalize(value, min, max);
      return radiusMin + radiusDelta * Math.sqrt(normalized);
    };

    return clusterLayer.clone({
      // Clustering props
      clusterLevel,
      getPosition: ({properties}) => {
        return [properties.longitude_average, properties.latitude_average];
      },
      getWeight: ({properties}) => properties.longitude_count,

      // GeoJsonLayer props
      pointType: 'circle+icon+text',

      // Circle
      getFillColor,
      getLineColor: [255, 255, 255],
      getLineWidth: lineWidth,
      getPointRadius: d => {
        const value = d.properties.longitude_count;
        const {min, max} = d.properties.stats.longitude_count;
        const normalized = normalize(value, min, max);
        return radiusMin + radiusDelta * Math.sqrt(normalized);
      },
      lineWidthUnits: 'pixels',
      stroked: lineWidth > 0,
      pointRadiusUnits: 'pixels', // move to defaultProps

      // Text
      ...(labels !== 'None' && {getText: LABEL_ACCESSORS[labels]}),
      getTextSize: 16,
      getTextColor: d => [255, 255, 255],
      textFontWeight: 800,
      textFontSettings: {sdf: true, smoothing: 0.2},
      textOutlineColor: [0, 0, 0, 100],
      textOutlineWidth: 3,

      // Icon
      iconAtlas: 'https://unpkg.com/@mapbox/maki@8.0.0/icons/triangle.svg',
      iconMapping: {
        triangle: {
          x: 0,
          y: 0,
          width: 15,
          height: 15,
          mask: true
        }
      },
      getIcon: d => 'triangle',
      getIconColor: [255, 255, 255],
      getIconSize: 8,
      getTextPixelOffset: [20, 0],

      // Shared props
      pickable: true,
      highlightColor: [255, 255, 255, 50],
      opacity: opacity / 100,
      parameters: createParameters(blending),
      updateTriggers: {
        getFillColor: palette,
        getPointRadius: radiusRange,
        getText: labels
      }
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
      <ObjectSelect
        title="blending"
        obj={BLENDING}
        value={blending}
        onSelect={setBlending}
        top={60}
      />
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
        name={'Cluster level'}
        bottom={100}
        min={1}
        max={7}
        value={clusterLevel}
        onChange={setClusterLevel}
        formatLabel={(x: number) => formatLabel(x, 'level')}
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
  const cartoMapId = params.has('id') ? params.get('id')! : 'f45022b8-298b-44d5-8168-3ae329808914';

  fetchMap({cartoMapId}).then(({initialViewState, layers}) => {
    root.render(<App initialViewState={initialViewState} layers={layers} />);
  });
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
