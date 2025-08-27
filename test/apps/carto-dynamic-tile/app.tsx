// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {H3TileLayer, RasterTileLayer, QuadbinTileLayer, VectorTileLayer, ClusterTileLayer} from '@deck.gl/carto';

import {query} from '@carto/api-client';
import datasets from './datasets';
import {Layer} from '@deck.gl/core';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const INITIAL_VIEW_STATE = {longitude: -87.65, latitude: 41.82, zoom: 10};

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const connectionName = 'bigquery';

const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRVNGNZTHAwaThjYnVMNkd0LTE0diJ9.eyJodHRwOi8vYXBwLmNhcnRvLmNvbS9lbWFpbCI6ImZwYWxtZXJAY2FydG9kYi5jb20iLCJodHRwOi8vYXBwLmNhcnRvLmNvbS9hY2NvdW50X2lkIjoiYWNfN3hoZnd5bWwiLCJpc3MiOiJodHRwczovL2F1dGguY2FydG8uY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA3OTY5NjU1OTI5NjExMjIxNDg2IiwiYXVkIjpbImNhcnRvLWNsb3VkLW5hdGl2ZS1hcGkiLCJodHRwczovL2NhcnRvLXByb2R1Y3Rpb24udXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc1NjIwODk4MSwiZXhwIjoxNzU2Mjk1MzgxLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIHJlYWQ6Y3VycmVudF91c2VyIHVwZGF0ZTpjdXJyZW50X3VzZXIgcmVhZDpjb25uZWN0aW9ucyB3cml0ZTpjb25uZWN0aW9ucyByZWFkOm1hcHMgd3JpdGU6bWFwcyByZWFkOmFjY291bnQiLCJhenAiOiJqQ1duSEs2RTJLMmFPeTlqTHkzTzdaTXBocUdPOUJQTCIsInBlcm1pc3Npb25zIjpbImV4ZWN1dGU6d29ya2Zsb3dzIiwicmVhZDphY2NvdW50IiwicmVhZDphY2NvdW50X3VzZXJzIiwicmVhZDphcHBzIiwicmVhZDpjb25uZWN0aW9ucyIsInJlYWQ6Y3VycmVudF91c2VyIiwicmVhZDppbXBvcnRzIiwicmVhZDpsaXN0ZWRfYXBwcyIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJyZWFkOnRva2VucyIsInJlYWQ6d29ya2Zsb3dzIiwidXBkYXRlOmN1cnJlbnRfdXNlciIsIndyaXRlOmFwcHMiLCJ3cml0ZTpjYXJ0by1kdy1ncmFudHMiLCJ3cml0ZTpjb25uZWN0aW9ucyIsIndyaXRlOmltcG9ydHMiLCJ3cml0ZTptYXBzIiwid3JpdGU6dG9rZW5zIiwid3JpdGU6d29ya2Zsb3dzIl19.KDiIG4IKm4TnRG-LezjZtDEAs1gLLq0h4osKtuTqsL2LcSTz9PICaDSh6kXmo3evvkgfFJ8KexaMTA2jA52hMAt0i9LogS4vNQKuikJ2W5uGs3BWiONjOrWrwKczjz6srA2_MonKQ9GtcmNquihTdYiVLvcIKOkPQ7CGkWr0Zq0yuzj07ndTGHq7tmMa2ltdiX5JVGkw_tE49MoYpVrc2kzvCRCQ08_LSykHnq8ROoXUYI2QV8PBII0VJcYKSJfcHTJ2uZfaWojB2Yk98P8VPAiiZs8n2cdEsgSmD_4xhvVxZjO6KVBs0jXM2_8lg80maKLvGTE5qrvXpqusPFrXTQ';

const globalOptions = {accessToken, apiBaseUrl, connectionName}; // apiBaseUrl not required

function normalize(value, min, max) {
  return (value - min) / Math.max(1, max - min);
}

function Root() {
  const [dataset, setDataset] = useState(Object.keys(datasets)[15]);
  const datasource = datasets[dataset];
  let layers: Layer[] = [];

  if (dataset.includes('boundary')) {
    layers = [useBoundaryLayer(datasource)];
  } else if (dataset.includes('cluster')) {
    layers = [useClusterLayer(datasource)];
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

function useClusterLayer(datasource) {
  const {getFillColor, getPointRadius, getWeight, source, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName, clusterLevel} =
    datasource;
  const tilejson = source({
    ...globalOptions,
    aggregationExp,
    columns,
    spatialDataColumn,
    sqlQuery,
    tableName
  });

  return new ClusterTileLayer({
    id: 'carto-cluster',
    data: tilejson,
    pickable: true,
    stroked: false,
    clusterLevel: clusterLevel || 5,
    getWeight: getWeight || (d => d.properties.population_sum || d.properties.retail || 1),
    getFillColor,
    pointRadiusUnits: 'pixels',
    getPointRadius: getPointRadius || 50
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
