/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
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
const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
// const apiBaseUrl = 'https://gcp-us-east1-06.dev.api.carto.com';
// Localhost
// const apiBaseUrl = 'http://localhost:8002'

const config = {
  bigquery: {
    h3: 'carto-dev-data.public.derived_spatialfeatures_che_h3res8_v1_yearly_v2',
    h3int: 'carto-dev-data.public.derived_spatialfeatures_che_h3int_res8_v1_yearly_v2',
    quadbin: 'carto-dev-data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadbin'
  },
  snowflake: {
    h3: 'carto_dev_data.public.derived_spatialfeatures_che_h3res8_v1_yearly_v2',
    h3int: 'carto_dev_data.public.derived_spatialfeatures_che_h3int_res8_v1_yearly_v2',
    quadbin: 'carto_dev_data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadbin'
  },
  redshift: {
    h3: 'carto_dev_data.public.derived_spatialfeatures_che_h3res8_v1_yearly_v2',
    h3int: 'carto_dev_data.public.derived_spatialfeatures_che_h3int_res8_v1_yearly_v2',
    quadbin: 'carto_dev_data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadbin'
  },
  postgres: {
    h3: 'carto_dev_data.public.derived_spatialfeatures_esp_h3res8_v1_yearly_v2',
    h3int: 'carto_dev_data.public.derived_spatialfeatures_esp_h3int_res8_v1_yearly_v2',
    quadbin: 'carto_dev_data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadbin'
  },
  databricks: {
    h3: 'cluster.carto_dev_data.derived_spatialfeatures_che_h3res8_v1_yearly_v2',
    h3int: 'cluster.carto_dev_data.derived_spatialfeatures_che_h3int_res8_v1_yearly_v2'
  }
};

const accessToken = 'XXX';

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
    credentials: {accessToken, apiBaseUrl},

    // Dynamic tiling. Request TILEJSON format with TABLE
    type: MAP_TYPES.TABLE,
    format: FORMATS.TILEJSON,

    // tile data format
    formatTiles,

    // Aggregation
    aggregationExp: 'avg(population) as value, 0.1*avg(population) as elevation, "test" as str',
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

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
