/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {CartoLayer, FORMATS, MAP_TYPES} from '@deck.gl/carto';
import {GeoJsonLayer} from '@deck.gl/layers';

const ZOOMS = {3: 3, 4: 4, 5: 5, 6: 6};
const INITIAL_VIEW_STATE = {longitude: -108, latitude: 47, zoom: 2};
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

// Skip CDN
// const apiBaseUrl = 'https://direct-gcp-us-east1.api.carto.com';
// PROD US GCP
const apiBaseUrl = 'https://gcp-us-east1-20.dev.api.carto.com';
// Localhost
// const apiBaseUrl = 'http://localhost:8002'

const config = {
  'deb-bigquery': {
    quadbin:
      'carto-dev-data.public.derived_spatialfeatures_usa_quadgrid15_v1_yearly_v2_quadbin_final'
  },
  bigquery: {
    che15: 'carto-dev-data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2',
    che18: 'carto-dev-data.public.derived_spatialfeatures_che_quadgrid18_v1_yearly_v2',
    esp15: 'carto-dev-data.public.derived_spatialfeatures_esp_quadgrid15_v1_yearly_v2',
    esp18: 'carto-dev-data.public.derived_spatialfeatures_esp_quadgrid18_v1_yearly_v2',
    ukr15: 'carto-dev-data.public.derived_spatialfeatures_ukr_quadgrid15_v1_yearly_v2',
    ukr18: 'carto-dev-data.public.derived_spatialfeatures_ukr_quadgrid18_v1_yearly_v2',
    usa15: 'carto-dev-data.public.derived_spatialfeatures_usa_quadgrid15_v1_yearly_v2',
    che15_quadkey:
      'carto-dev-data.public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2_quadkey',
    che18_quadkey:
      'carto-dev-data.public.derived_spatialfeatures_che_quadgrid18_v1_yearly_v2_quadkey',
    esp15_quadkey:
      'carto-dev-data.public.derived_spatialfeatures_esp_quadgrid15_v1_yearly_v2_quadkey',
    esp18_quadkey:
      'carto-dev-data.public.derived_spatialfeatures_esp_quadgrid18_v1_yearly_v2_quadkey',
    ukr15_quadkey:
      'carto-dev-data.public.derived_spatialfeatures_ukr_quadgrid15_v1_yearly_v2_quadkey',
    ukr18_quadkey:
      'carto-dev-data.public.derived_spatialfeatures_ukr_quadgrid18_v1_yearly_v2_quadkey',
    usa15_quadkey:
      'carto-dev-data.public.derived_spatialfeatures_usa_quadgrid15_v1_yearly_v2_quadkey'
  },
  redshift: {
    che15: 'public.derived_spatialfeatures_che_quadgrid15_v1_yearly_v2',
    che15_h3: 'public.derived_spatialfeatures_che_h3res10_v1_yearly_v2_interpolated'
  }
};

const accessToken = 'XXXX';

const showBasemap = true;
const showCarto = true;

function Root() {
  const [connection, setConnection] = useState('deb-bigquery');
  const [dataset, setDataset] = useState('quadbin');
  const [zoom, setZoom] = useState(5);
  const table = config[connection][dataset];
  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[showBasemap && createBasemap(), showCarto && createCarto(connection, zoom, table)]}
      />
      <ObjectSelect title="zooms" obj={ZOOMS} value={zoom} onSelect={setZoom} />
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
function createCarto(connection, zoom, table) {
  console.log(connection, zoom, table);
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

    // Aggregation
    aggregationExp: 'avg(population) as value, 0.1*avg(population) as elevation',
    aggregationResLevel: zoom,
    geoColumn,
    getQuadkey: d => d.id,

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
