/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {
  vectorTableSource,
  H3TileLayer,
  RasterTileLayer,
  QuadbinTileLayer,
  query,
  VectorTileLayer
} from '@deck.gl/carto';
import datasets from './datasets';
import {Layer} from '@deck.gl/core';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const INITIAL_VIEW_STATE = {longitude: -87.65, latitude: 41.82, zoom: 10};

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const connectionName = 'bigquery';

const accessToken = 'XXX';

const globalOptions = {accessToken, apiBaseUrl, connectionName}; // apiBaseUrl not required

function Root() {
  const [dataset, setDataset] = useState(Object.keys(datasets)[0]);
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
        getTooltip={({object}) => {
          const properties = object?.properties;
          if (!properties) return null;
          return Object.entries(properties)
            .map(([k, v]) => `${k}: ${v}\n`)
            .join('');
        }}
      >
        <StaticMap mapStyle={MAP_STYLE} />
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
  const {getFillColor, source, boundaryId, columns, matchingColumn, sqlQuery, tableName} =
    datasource;
  const tilejson = source({
    ...globalOptions,
    boundaryId,
    columns,
    matchingColumn,
    tableName,
    sqlQuery
  });

  return new VectorTileLayer({
    id: 'carto',
    // @ts-ignore
    data: tilejson, // TODO how to correctly specify data type?
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
    // @ts-ignore
    data: tilejson, // TODO how to correctly specify data type?
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
