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
    quadint: 'carto-dev-data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2',
    quadkey: 'carto-dev-data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadkey'
  }
};

const accessToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRVNGNZTHAwaThjYnVMNkd0LTE0diJ9.eyJodHRwOi8vYXBwLmNhcnRvLmNvbS9lbWFpbCI6ImFsYmVydG9AY2FydG9kYi5jb20iLCJodHRwOi8vYXBwLmNhcnRvLmNvbS9hY2NvdW50X2lkIjoiYWNfN3hoZnd5bWwiLCJpc3MiOiJodHRwczovL2F1dGguY2FydG8uY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA4NDA5NTYzMzQxMzU5MDQxNjg0IiwiYXVkIjoiY2FydG8tY2xvdWQtbmF0aXZlLWFwaSIsImlhdCI6MTY1Mjc3NjQwNSwiZXhwIjoxNjUyODYyODA1LCJhenAiOiJqQ1duSEs2RTJLMmFPeTlqTHkzTzdaTXBocUdPOUJQTCIsInNjb3BlIjoicmVhZDpjdXJyZW50X3VzZXIiLCJwZXJtaXNzaW9ucyI6WyJhZG1pbjphY2NvdW50IiwicmVhZDphY2NvdW50IiwicmVhZDphcHBzIiwicmVhZDpjb25uZWN0aW9ucyIsInJlYWQ6Y3VycmVudF91c2VyIiwicmVhZDppbXBvcnRzIiwicmVhZDpsaXN0ZWRfYXBwcyIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJyZWFkOnRva2VucyIsInVwZGF0ZTpjdXJyZW50X3VzZXIiLCJ3cml0ZTphcHBzIiwid3JpdGU6Y29ubmVjdGlvbnMiLCJ3cml0ZTppbXBvcnRzIiwid3JpdGU6bGlzdGVkX2FwcHMiLCJ3cml0ZTptYXBzIiwid3JpdGU6dG9rZW5zIl19.rfxRrGkVd1A_JAAAJu-F30I04rgXzoFiKui9DCFfP92xuaIeD09BCryRAURM53oOylib7HXuJLsUCwsZrhITzM_OR5BQiVp1-lYgUKQu63Z2Ju2RRZf0vdBkIjgSJW-NYXxqTOiw0HMZ4mMly04fBW7kSDcP6LvMuj7uLEFfgqRg0I0_yQgHzB7BJbA9dp5N3zTaxyEC08KJdAZ1EnsC6R-o4Y5Jg993U4yJ6-pUF_H6b7HziFZTqB7nTm4uW25jmmPMQ4oBYSVgfUp-2zdgKgzaqdctmTO1fdtgrl7qxGxAkUiyWy5uQhleiW7ckKL-jIJniQg0ZSaHkJPpyek4gQ';

const showBasemap = true;
const showCarto = true;

function Root() {
  const [connection, setConnection] = useState('bigquery');
  const [dataset, setDataset] = useState('quadkey');
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

// Add aggregation expressions
function createCarto(connection, formatTiles, table) {
  const geoColumn = table.endsWith('_quadkey') ? 'quadkey' : 'quadint';
  return new CartoLayer({
    id: 'carto',
    connection,
    data: table,
    credentials: {accessToken, apiBaseUrl},

    // Dynamic tiling. Request TILEJSON format with TABLE
    type: MAP_TYPES.TABLE,
    format: FORMATS.TILEJSON,
    formatTiles,

    // Aggregation
    aggregationExp: 'avg(population) as value, 0.1*avg(population) as elevation',
    aggregationResLevel: 6,
    geoColumn,

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
