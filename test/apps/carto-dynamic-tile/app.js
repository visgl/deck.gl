/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {CartoLayer, FORMATS, MAP_TYPES} from '@deck.gl/carto';
import {GeoJsonLayer} from '@deck.gl/layers';

const ZOOMS = {3: 3, 4: 4, 5: 5, 6: 6};
const FORMATTILES = {binary: 'binary', json: 'json'};
const INITIAL_VIEW_STATE = {longitude: 8, latitude: 47, zoom: 6};
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

// Skip CDN
// const apiBaseUrl = 'https://direct-gcp-us-east1.api.carto.com';
// PROD US GCP
// const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const apiBaseUrl = 'https://gcp-us-east1-06.dev.api.carto.com';
// Localhost
// const apiBaseUrl = 'http://localhost:8002'

const config = {
  bigquery: {
    h3: 'carto-dev-data.public.derived_spatialfeatures_che_h3res8_v1_yearly_v2',
    h3int: 'carto-dev-data.public.derived_spatialfeatures_che_h3int_res8_v1_yearly_v2',
    quadbin: 'carto-dev-data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadbin'
  }
};

const accessToken = {
  'carto-dev-data.public.derived_spatialfeatures_che_h3res8_v1_yearly_v2':
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfNWg2bXlsaHEiLCJqdGkiOiIxNjY4YTFmNSJ9.Hr5HDfA0vPyjqXqnTb9_Bk7fgTjoishYTkAzRDv0Hvg',
  'carto-dev-data.public.derived_spatialfeatures_che_h3int_res8_v1_yearly_v2':
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfNWg2bXlsaHEiLCJqdGkiOiI5MjIyNDg1NiJ9.ABoadsJi44OnmzqC_126lkaaxQXLc272PRILLSFaAZc',
  'carto-dev-data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadbin':
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfNWg2bXlsaHEiLCJqdGkiOiIxNjFhNjIwYyJ9.DbmzesHPX3TbM3J9yZYBJnJXH0Pd5DofOa76nDWDzII'
};
const showBasemap = true;
const showCarto = true;

function Root() {
  const [connection, setConnection] = useState('bigquery');
  const [dataset, setDataset] = useState('h3');
  const [zoom, setZoom] = useState(5);
  const [formatTiles, setFormatTiles] = useState('binary');
  const table = config[connection][dataset];
  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[
          showBasemap && createBasemap(),
          showCarto && createCarto(connection, zoom, table, formatTiles)
        ]}
      />
      <ObjectSelect title="zooms" obj={ZOOMS} value={zoom} onSelect={setZoom} />
      <ObjectSelect
        title="formatTiles"
        obj={FORMATTILES}
        value={formatTiles}
        onSelect={setFormatTiles}
      />
      <ObjectSelect
        title="connection"
        obj={Object.keys(config)}
        value={connection}
        onSelect={c => {
          setConnection(c);
          if (!config[c][dataset]) {
            setDataset(Object.keys(config[c])[0]);
          }
        }}
      />
      <ObjectSelect
        title="dataset"
        obj={Object.keys(config[connection])}
        value={dataset}
        onSelect={setDataset}
      />
    </>
  );
}

function createBasemap() {
  return new GeoJsonLayer({
    id: 'base-map',
    data: COUNTRIES,
    // Styles
    stroked: true,
    filled: true,
    lineWidthMinPixels: 2,
    opacity: 0.4,
    getLineColor: [60, 60, 60],
    getFillColor: [200, 200, 200]
  });
}

// Add aggregation expressions
function createCarto(connection, zoom, table, formatTiles) {
  const isH3 = table.includes('h3');
  const isQuadbin = table.includes('quadbin');
  const geoColumn = isH3
    ? 'h3'
    : isQuadbin
    ? 'quadbin'
    : table.endsWith('_quadkey')
    ? 'quadkey'
    : 'quadint';
  return new CartoLayer({
    id: 'carto',
    connection,
    data: table,
    credentials: {accessToken: accessToken[table], apiBaseUrl},

    // Dynamic tiling. Request TILEJSON format with TABLE
    type: MAP_TYPES.TABLE,
    format: FORMATS.TILEJSON,

    // tile data format
    formatTiles,

    // Aggregation
    aggregationExp: 'avg(population) as value, 0.1*avg(population) as elevation',
    aggregationResLevel: zoom,
    geoColumn,
    getQuadkey: d => d.id,

    // Visibilty (will be converted to H3 levels in the case of H3 tiles)
    minZoom: 5,
    maxZoom: 9,

    // autohighlight
    pickable: true,
    autoHighlight: true,
    highlightColor: [33, 77, 255, 255],

    // Styling
    getFillColor: d => [
      Math.pow((d.properties.value || d.properties.VALUE) / 200, 0.1) * 255,
      255 - (d.properties.value || d.properties.VALUE),
      79
    ],
    getElevation: d =>
      'elevation' in d.properties
        ? d.properties.elevation
        : d.properties.value || d.properties.VALUE,
    extruded: true,
    opacity: 0.3,
    elevationScale: 100
  });
}

function ObjectSelect({title, obj, value, onSelect}) {
  const keys = Object.values(obj).sort();
  return (
    <>
      <select
        onChange={e => onSelect(e.target.value)}
        style={{position: 'relative', padding: 4, margin: 2, width: 200}}
        value={value}
      >
        <option hidden>{title}</option>
        {keys.map(f => (
          <option key={f} value={f}>
            {`${title}: ${f}`}
          </option>
        ))}
      </select>
      <br></br>
    </>
  );
}

render(<Root />, document.body.appendChild(document.createElement('div')));
