/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {CartoLayer, FORMATS, TILE_FORMATS, MAP_TYPES} from '@deck.gl/carto';
import {GeoJsonLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {longitude: -73.95643, latitude: 40.8039, zoom: 12};
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

// Skip CDN
const apiBaseUrl = 'https://direct-gcp-us-east1.api.carto.com';
// PROD US GCP
// const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
// Localhost
// const apiBaseUrl = 'http://localhost:8002'

const config = {
  bigquery: {
    points_1M: 'cartodb-gcp-backend-data-team.dynamic_tiling.points_1M',
    points_5M: 'cartodb-gcp-backend-data-team.dynamic_tiling.points_5M',
    censustract: 'carto-do-public-data.carto.geography_usa_censustract_2019',
    blockgroup: 'carto-do-public-data.carto.geography_usa_blockgroup_2019',
    zipcodes: 'carto-do-public-data.carto.geography_usa_zcta5_2019',
    h3: 'carto-do-public-data.carto.geography_usa_h3res8_v1',
    block: 'carto-do-public-data.carto.geography_usa_block_2019'
  },
  snowflake: {
    points_1M: 'carto_backend_data_team.dynamic_tiling.points_1M',
    points_5M: 'carto_backend_data_team.dynamic_tiling.points_5M',
    censustract: 'carto_backend_data_team.dynamic_tiling.usa_censustract_2019',
    blockgroup: 'carto_backend_data_team.dynamic_tiling.usa_blockgroup_2019',
    zipcodes: 'carto_backend_data_team.dynamic_tiling.usa_zcta5_2019',
    h3: 'carto_backend_data_team.dynamic_tiling.usa_h3res8_v1',
    block: 'carto_backend_data_team.dynamic_tiling.usa_block_2019'
  },
  redshift: {
    points_1M: 'carto_backend_data_team.dynamic_tiling.points_1m',
    points_5M: 'carto_backend_data_team.dynamic_tiling.points_5m',
    censustract: 'carto_backend_data_team.dynamic_tiling.usa_censustract_2019',
    blockgroup: 'carto_backend_data_team.dynamic_tiling.usa_blockgroup_2019',
    zipcodes: 'carto_backend_data_team.dynamic_tiling.usa_zcta5_2019',
    h3: 'carto_backend_data_team.dynamic_tiling.usa_h3res8_v1',
    block: 'carto_backend_data_team.dynamic_tiling.usa_block_2019'
  },
  postgres: {
    points_1M: 'demo.demo_tables.points_1m',
    points_5M: 'demo.demo_tables.points_5m',
    points_10M: 'demo.demo_tables.points_10m',
    censustract: 'demo.demo_tables.usa_censustract_2019',
    blockgroup: 'demo.demo_tables.usa_blockgroup_2019',
    zipcodes: 'demo.demo_tables.usa_zcta5_2019',
    county: 'demo.demo_tables.usa_county_2019',
    block: 'demo.demo_tables.usa_block_2019'
  }
};

const accessToken = 'XXXX';

const showBasemap = true;
const showCarto = true;

function Root() {
  const [connection, setConnection] = useState('bigquery');
  const [dataset, setDataset] = useState('points_1M');
  const [formatTiles, setFormatTiles] = useState(TILE_FORMATS.BINARY);
  const table = config[connection][dataset];
  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[
          showBasemap && createBasemap(),
          showCarto && createCarto(connection, formatTiles, table)
        ]}
      />
      <ObjectSelect
        title="formatTiles"
        obj={TILE_FORMATS}
        value={formatTiles}
        onSelect={setFormatTiles}
      />
      <ObjectSelect
        title="connection"
        obj={Object.keys(config)}
        value={connection}
        onSelect={setConnection}
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

function createCarto(connection, formatTiles, table) {
  return new CartoLayer({
    id: 'carto',
    connection,
    data: table,
    credentials: {accessToken, apiBaseUrl},

    // Dynamic tiling. Request TILEJSON format with TABLE
    type: MAP_TYPES.TABLE,
    format: FORMATS.TILEJSON,
    formatTiles,

    // Styling
    getFillColor: [233, 71, 251],
    getElevation: 1000,
    // extruded: true,
    stroked: true,
    filled: true,
    pointType: 'circle',
    pointRadiusUnits: 'pixels',
    lineWidthMinPixels: 0.5,
    getPointRadius: 1.5,
    getLineColor: [0, 0, 200]
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
