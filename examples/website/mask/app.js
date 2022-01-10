/* global fetch */
import React, {useState, useMemo} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';
import {scaleLinear} from 'd3-scale';

const rectangle = [
  [-135, 50],
  [-135, 20],
  [-50, 20],
  [-50, 50],
  [-135, 50]
];

const maskExtension = new MaskExtension();

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line
const US_STATES = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

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
export default function App({data, brushRadius = 100000, strokeWidth = 1, mapStyle = MAP_STYLE}) {
  const {arcs, targets, sources} = useMemo(() => getLayerData(data), [data]);
  const [selectedCounty, selectCounty] = useState(null);
  console.log(selectedCounty);
  const maskEnabled = selectedCounty;
  const maskPolygon = selectedCounty ? selectedCounty.geometry.coordinates : [];

  const layers = arcs &&
    targets && [
      // Boundary around USA (masked by selected state)
      new SolidPolygonLayer({
        id: 'masked-layer',
        data: [{polygon: rectangle}],
        getFillColor: [...TARGET_COLOR, 200],
        extensions: [maskExtension],
        maskPolygon
      }),
      // US states (used to select & define masks)
      new GeoJsonLayer({
        id: 'us-states',
        data: US_STATES,
        opacity: 0.3,
        stroked: true,
        filled: true,
        getFillColor: [201, 210, 203, 80],
        lineWidthMinPixels: 2,
        onClick: ({object}) => selectCounty(object),
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
        radiusScale: maskEnabled ? 100000 : 0,
        getFillColor: [255, 255, 255, 150],
        getLineColor: [0, 0, 0, 100],
        parameters: {depthTest: false},
        extensions: [maskExtension],
        maskPolygon,
        maskByInstance: false
      }),
      new ScatterplotLayer({
        id: 'sources',
        data: sources,
        radiusScale: maskEnabled ? 3000 : 0,
        getFillColor: d => (d.gain > 0 ? TARGET_COLOR : SOURCE_COLOR),
        extensions: [maskExtension],
        maskPolygon
      }),
      new ScatterplotLayer({
        id: 'targets',
        data: targets,
        pickable: true,
        radiusScale: 3000,
        getFillColor: d => (d.net > 0 ? TARGET_COLOR : SOURCE_COLOR),
        extensions: [maskExtension],
        maskPolygon
      }),
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getWidth: strokeWidth,
        opacity: maskEnabled ? 0.7 : 0.01,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: SOURCE_COLOR,
        getTargetColor: TARGET_COLOR,
        extensions: [maskExtension],
        maskPolygon,
        maskByInstance: true
      })
    ];

  return (
    <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  render(<App />, container);

  fetch(DATA_URL)
    .then(response => response.json())
    .then(({features}) => {
      render(<App data={features} />, container);
    });
}
