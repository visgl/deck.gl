/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {
  H3TileLayer,
  RasterTileLayer,
  QuadbinTileLayer,
  query,
  VectorTileLayer
} from '@deck.gl/carto';
import datasets from './datasets';
import {Layer} from '@deck.gl/core';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const INITIAL_VIEW_STATE = {
  latitude: 50.0755,
    longitude: 14.4378,
      zoom: 12,
        bearing: 0,
          pitch: 0
  };

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const connectionName = 'carto_dw';

const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRVNGNZTHAwaThjYnVMNkd0LTE0diJ9.eyJodHRwOi8vYXBwLmNhcnRvLmNvbS9lbWFpbCI6ImZwYWxtZXJAY2FydG9kYi5jb20iLCJodHRwOi8vYXBwLmNhcnRvLmNvbS9hY2NvdW50X2lkIjoiYWNfN3hoZnd5bWwiLCJpc3MiOiJodHRwczovL2F1dGguY2FydG8uY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA3OTY5NjU1OTI5NjExMjIxNDg2IiwiYXVkIjoiY2FydG8tY2xvdWQtbmF0aXZlLWFwaSIsImlhdCI6MTcyMTgxODQ2MSwiZXhwIjoxNzIxOTA0ODYxLCJhenAiOiIwZHhiOEhSM0FUWEN4SmlQT0pWSHNMb0hvQXRiUlg2dSIsInBlcm1pc3Npb25zIjpbImV4ZWN1dGU6d29ya2Zsb3dzIiwicmVhZDphY2NvdW50IiwicmVhZDphcHBzIiwicmVhZDpjb25uZWN0aW9ucyIsInJlYWQ6Y3VycmVudF91c2VyIiwicmVhZDppbXBvcnRzIiwicmVhZDpsaXN0ZWRfYXBwcyIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJyZWFkOnRva2VucyIsInJlYWQ6d29ya2Zsb3dzIiwidXBkYXRlOmN1cnJlbnRfdXNlciIsIndyaXRlOmFwcHMiLCJ3cml0ZTpjYXJ0by1kdy1ncmFudHMiLCJ3cml0ZTpjb25uZWN0aW9ucyIsIndyaXRlOmltcG9ydHMiLCJ3cml0ZTptYXBzIiwid3JpdGU6dG9rZW5zIiwid3JpdGU6d29ya2Zsb3dzIl19.dY9SuyLMKbEQ42IqVTIFmQx5zFM4eXZ83xTyHz7J-7KQW0KnNtDXItusRU4Z5Kju-ctC4FF14ZlBy5XBvDu7h0JChebdUxbR33WRgLRQND-aBikTObRCxgnTPgua3E_Z-5Btn4qLdSpm7JkX9w3tp07OvIKou-5Q6kekOWLs6AtT1JnWZ9_cbOWNdpsNWBY6WbqbFzOhijxATDwJEqCV4TtW-Sp9GWpW0lddX-TMaTSY72jZeVFNi1wnGt-_z-vgd3eFVramfpcw1-MYyzaCjOFyNiLm0TIokaKLKCUJOFRd_n7-9xWqcQ2ROdNbv7OsyU63fSqj3jtc0K9awkL66A';

const globalOptions = {accessToken, apiBaseUrl, connectionName}; // apiBaseUrl not required

function Root() {
  const [dataset, setDataset] = useState(Object.keys(datasets)[8]);
  const datasource = datasets[dataset];
  let layers: Layer[] = [];

  if (dataset.includes('boundary')) {
    layers = [useBoundaryLayer(datasource)];
  } else if (dataset.includes('h3')) {
    layers = [useH3Layer(datasource)];
  } else if (dataset.includes('raster')) {
    layers = [useRasterLayer(datasource)];
  } else if (dataset.includes('quadbin')) {
    layers = [useQuadbinLayer(datasource)];
  } else if (dataset.includes('vector')) {
    layers = [useVectorLayer(datasource)];
  } else {
    console.error('Unknown type of dataset', dataset);
  }

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={(info) => {
          const properties = info.object?.properties;
          if (!properties) return null;
          return Object.entries(properties)
            .map(([k, v]) => `${k}: ${v}\n`)
            .join('');
        }}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>
      <ObjectSelect
        title="dataset"
        obj={Object.keys(datasets)}
        value={dataset}
        onSelect={setDataset}
      />
    </>
  );
}

function useBoundaryLayer(datasource) {
  const {getFillColor, source, tilesetTableName, columns, propertiesSqlQuery, propertiesTableName} =
    datasource;
  const tilejson = source({
    ...globalOptions,
    tilesetTableName,
    columns,
    propertiesTableName,
    propertiesSqlQuery
  });

  return new VectorTileLayer({
    id: 'carto',
    data: tilejson,
    pickable: true,
    pointRadiusMinPixels: 5,
    getFillColor
  });
}

function useH3Layer(datasource) {
  const {getFillColor, source, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName} =
    datasource;
  const tilejson = source({
    ...globalOptions,
    aggregationExp,
    columns,
    spatialDataColumn,
    sqlQuery,
    tableName
  });

  return new H3TileLayer({
    id: 'carto',
    data: tilejson,
    pickable: true,
    stroked: false,
    getFillColor
  });
}

function useRasterLayer(datasource) {
  const {getFillColor, source, tableName} = datasource;
  const tilejson = source({...globalOptions, tableName});

  return new RasterTileLayer({
    id: 'carto',
    data: tilejson, // TODO how to correctly specify data type?
    pickable: true,
    autoHighlight: true,
    getFillColor
  });
}

function useQuadbinLayer(datasource) {
  const {getFillColor, source, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName} =
    datasource;
  const tilejson = source({
    ...globalOptions,
    aggregationExp,
    columns,
    spatialDataColumn,
    sqlQuery,
    tableName
  });

  return new QuadbinTileLayer({
    id: 'carto',
    data: tilejson,
    pickable: true,
    stroked: false,
    getFillColor
  });
}

function useVectorLayer(datasource) {
  const {getFillColor, source, columns, spatialDataColumn, sqlQuery, tableName} = datasource;
  const tilejson = source({...globalOptions, columns, spatialDataColumn, sqlQuery, tableName});

  return new VectorTileLayer({
    id: 'carto',
    data: tilejson,
    pickable: true,
    pointRadiusMinPixels: 5,
    getFillColor
  });
}

async function fetchLayerData() {
  const data = await query({
    ...globalOptions,
    sqlQuery: 'select * from carto-demo-data.demo_tables.chicago_crime_sample'
  });
  console.log(data.rows[0]);
}
fetchLayerData();

function ObjectSelect({title, obj, value, onSelect}) {
  const keys = Object.values(obj).sort() as string[];
  return (
    <>
      <select
        onChange={e => onSelect(e.target.value)}
        style={{position: 'relative', padding: 4, margin: 2, width: 250}}
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
