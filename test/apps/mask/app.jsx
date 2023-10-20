/* global fetch */
import React, {useState, useMemo, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {MVTLayer} from '@deck.gl/geo-layers';
import {MaskExtension} from '@deck.gl/extensions';
import {scaleLinear} from 'd3-scale';

const rectangle = [
  [-175, 80],
  [-175, 20],
  [-50, 20],
  [-50, 80],
  [-175, 80]
];

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line
const US_STATES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

// migrate out
const SOURCE_COLOR = [166, 3, 3];
// migrate in
const TARGET_COLOR = [35, 181, 184];

const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

function getTooltip({object}) {
  if (!object || object.geometry?.type === 'Polygon') return null;
  return object.name;
}

/* eslint-disable  max-nested-callbacks */
function getLayerData(data) {
  if (!data || !data.length) {
    return {};
  }
  const arcs = [];
  const targets = [];
  const sources = [];
  const pairs = {};

  data.forEach((county, i) => {
    const {flows, centroid: targetCentroid} = county.properties;
    const value = {gain: 0, loss: 0};

    Object.keys(flows).forEach(toId => {
      value[flows[toId] > 0 ? 'gain' : 'loss'] += flows[toId];

      // if number too small, ignore it
      if (Math.abs(flows[toId]) < 50) {
        return;
      }
      const pairKey = [i, Number(toId)].sort((a, b) => a - b).join('-');
      const sourceCentroid = data[toId].properties.centroid;
      const gain = Math.sign(flows[toId]);

      // add point at arc source
      sources.push({
        position: sourceCentroid,
        target: targetCentroid,
        name: data[toId].properties.name,
        radius: 3,
        gain: -gain
      });

      // eliminate duplicates arcs
      if (pairs[pairKey]) {
        return;
      }

      pairs[pairKey] = true;

      arcs.push({
        target: gain > 0 ? targetCentroid : sourceCentroid,
        source: gain > 0 ? sourceCentroid : targetCentroid,
        value: flows[toId]
      });
    });

    // add point at arc target
    targets.push({
      ...value,
      position: [targetCentroid[0], targetCentroid[1], 10],
      net: value.gain + value.loss,
      name: county.properties.name
    });
  });

  // sort targets by radius large -> small
  targets.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  const sizeScale = scaleLinear()
    .domain([0, Math.abs(targets[0].net)])
    .range([36, 400]);

  targets.forEach(pt => {
    pt.radius = Math.sqrt(sizeScale(Math.abs(pt.net)));
  });

  return {arcs, targets, sources};
}

/* eslint-disable react/no-deprecated */
export default function App({data, strokeWidth = 1, mapStyle = MAP_STYLE}) {
  const {arcs, targets, sources} = useMemo(() => getLayerData(data), [data]);
  const [maskEnabled, setMaskEnabled] = useState(true);
  const [maskInverted, setMaskInverted] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [selectedCounty, selectCounty] = useState(null);
  const [selectedCounty2, selectCounty2] = useState(null);

  const selectedCounty2Polygons = useMemo(() => {
    if (!selectedCounty2) return [];
    if (selectedCounty2.geometry.type === 'MultiPolygon') {
      return selectedCounty2.geometry.coordinates;
    }
    return [selectedCounty2.geometry.coordinates];
  }, [selectedCounty2]);

  const onClickState = useCallback((info, evt) => {
    if (evt.srcEvent.shiftKey) {
      selectCounty2(info.object);
    } else {
      selectCounty(info.object);
    }
  }, []);

  const onDataLoad = useCallback(geojson => {
    const california = geojson.features.find(f => f.properties.name === 'California');
    selectCounty(california);
    selectCounty2(california);
  }, []);

  const layers = arcs &&
    targets && [
      new GeoJsonLayer({
        id: 'mask',
        operation: 'mask',
        data: selectedCounty || []
      }),
      new SolidPolygonLayer({
        id: 'mask2',
        operation: 'mask',
        data: selectedCounty2Polygons,
        getPolygon: d => d
      }),
      // Boundary around USA (masked by selected state)
      new SolidPolygonLayer({
        id: 'masked-layer',
        data: [{polygon: rectangle}],
        getFillColor: [...TARGET_COLOR, 200],
        maskId: maskEnabled && 'mask',
        extensions: [new MaskExtension()]
      }),
      new MVTLayer({
        id: 'mvt-layer',
        data: 'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt',
        maskId: maskEnabled && 'mask',
        extensions: [new MaskExtension()],
        maxZoom: 14,
        getFillColor: [255, 255, 255],
        getLineColor: [192, 192, 192],
        getLineWidth: 1,
        getPointRadius: 2,
        lineWidthUnits: 'pixels',
        pointRadiusUnits: 'pixels'
      }),
      // US states (used to select & define masks)
      new GeoJsonLayer({
        id: 'us-states',
        data: US_STATES,
        onDataLoad,
        opacity: 0.3,
        stroked: true,
        filled: true,
        getFillColor: [201, 210, 203, 80],
        lineWidthMinPixels: 2,
        onClick: onClickState,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 150]
      }),
      // Rings around target (clipped by mask)
      new ScatterplotLayer({
        id: 'targets-ring',
        data: targets,
        lineWidthMinPixels: 2,
        filled: true,
        stroked: true,
        radiusScale: 100000,
        getFillColor: [255, 255, 255, 150],
        getLineColor: [0, 0, 0, 100],
        parameters: {depthTest: false},
        extensions: [new MaskExtension()],
        maskId: maskEnabled && 'mask2',
        maskByInstance: false,
        maskInverted
      }),
      new ScatterplotLayer({
        id: 'sources',
        data: sources,
        radiusScale: 3000,
        getFillColor: d => (d.gain > 0 ? TARGET_COLOR : SOURCE_COLOR),
        extensions: [new MaskExtension()],
        maskId: maskEnabled && 'mask2',
        maskInverted
      }),
      new ScatterplotLayer({
        id: 'targets',
        data: targets,
        pickable: true,
        onClick: ({object}) => {
          console.log(object);
        },
        autoHighlight: true,
        highlightColor: [255, 255, 255, 150],
        radiusScale: 15000,
        getFillColor: d => (d.net > 0 ? TARGET_COLOR : SOURCE_COLOR),
        extensions: [new MaskExtension()],
        maskId: maskEnabled && 'mask2',
        maskInverted
      }),
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getWidth: strokeWidth,
        opacity: 0.7,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: SOURCE_COLOR,
        getTargetColor: TARGET_COLOR,
        extensions: [new MaskExtension()],
        maskId: maskEnabled && 'mask',
        maskByInstance: true
      })
    ];

  return (
    <>
      <DeckGL
        layers={showLayers ? layers : []}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>
      <div style={{position: 'absolute', background: 'white', padding: 10, userSelect: 'none'}}>
        <label>
          <input
            type="checkbox"
            checked={maskEnabled}
            onChange={() => setMaskEnabled(!maskEnabled)}
          />
          Use mask
        </label>
        <label>
          <input
            type="checkbox"
            checked={maskInverted}
            onChange={() => setMaskInverted(!maskInverted)}
          />
          Invert mask
        </label>
        <label>
          <input type="checkbox" checked={showLayers} onChange={() => setShowLayers(!showLayers)} />
          Show layers
        </label>
      </div>
    </>
  );
}

fetch(DATA_URL)
  .then(response => response.json())
  .then(({features}) => {
    createRoot(document.getElementById('app')).render(<App data={features} />);
  });
