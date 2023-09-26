/* global document */
/* eslint-disable no-console */
import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {
  CartoTilejsonResult,
  CartoVectorLayer,
  QuadbinTileLayer,
} from '@deck.gl/carto';
import datasets from './datasets';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const INITIAL_VIEW_STATE = {longitude: -87.65, latitude: 41.82, zoom: 10};

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const connectionName = 'bigquery';

const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRVNGNZTHAwaThjYnVMNkd0LTE0diJ9.eyJodHRwOi8vYXBwLmNhcnRvLmNvbS9lbWFpbCI6ImZwYWxtZXJAY2FydG9kYi5jb20iLCJodHRwOi8vYXBwLmNhcnRvLmNvbS9hY2NvdW50X2lkIjoiYWNfN3hoZnd5bWwiLCJpc3MiOiJodHRwczovL2F1dGguY2FydG8uY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA3OTY5NjU1OTI5NjExMjIxNDg2IiwiYXVkIjoiY2FydG8tY2xvdWQtbmF0aXZlLWFwaSIsImlhdCI6MTY5NTYzNDA5MSwiZXhwIjoxNjk1NzIwNDkxLCJhenAiOiJBdHh2SERldVhsUjhYUGZGMm5qMlV2MkkyOXB2bUN4dSIsInBlcm1pc3Npb25zIjpbImV4ZWN1dGU6d29ya2Zsb3dzIiwicmVhZDphY2NvdW50IiwicmVhZDphcHBzIiwicmVhZDpjb25uZWN0aW9ucyIsInJlYWQ6Y3VycmVudF91c2VyIiwicmVhZDppbXBvcnRzIiwicmVhZDpsaXN0ZWRfYXBwcyIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJyZWFkOnRva2VucyIsInJlYWQ6d29ya2Zsb3dzIiwidXBkYXRlOmN1cnJlbnRfdXNlciIsIndyaXRlOmFwcHMiLCJ3cml0ZTpjYXJ0by1kdy1ncmFudHMiLCJ3cml0ZTpjb25uZWN0aW9ucyIsIndyaXRlOmltcG9ydHMiLCJ3cml0ZTptYXBzIiwid3JpdGU6dG9rZW5zIiwid3JpdGU6d29ya2Zsb3dzIl19.Pe3-CiKxbzvZSVEpOOau-4C0KvgwRY9z3JrQN9nBkXNe5nw4RRNjZKwximMJfGn6agkicwpul8IfkTibEJl3gtoEOMQN2azWGMuxFd0cLEPgg6w2bCDWHi6QBjNC_VCW0jRw_ldE4W3J0rwfCLdoUuqdF28a6E3JA2_2GtT5fMupbriCFhLLDOgPt4gm3KoQI7YOe7PI6c5nEWbYeg4Eb776P5ggMdgcgjerBLo5Jnzzt8FAqmBCKZriJC4RZhy5cXyvevtJoAX-NmTcz2YpBLiWeRSx_vkHkB86YQQ2NHY91mWW4Y_n6cpT0-FEmhXHb1qhQTVPqnnlDPxaktPjsQ';

const globalOptions = {accessToken, apiBaseUrl, connectionName}; // apiBaseUrl not required

function Root() {
  const [dataset, setDataset] = useState(Object.keys(datasets)[0]);
  const datasource = datasets[dataset];
  let layers;

  if (dataset.includes('quadbin')) {
    layers = [createQuadbinLayer(datasource)];

  } else if (dataset.includes('vector')) {
    layers = [createVectorLayer(datasource)];
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

function createQuadbinLayer(datasource) {
  const {getFillColor, Source, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName} = datasource;
  // useMemo to avoid a map instantiation on every re-render
  const tilejson = useMemo<Promise<CartoTilejsonResult>>(() => {
    return Source({...globalOptions, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName});
  }, [Source, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName]);

  return new QuadbinTileLayer({
    id: 'carto',
    data: tilejson,
    pickable: true,
    stroked: false,
    getFillColor
  });
}

function createVectorLayer(datasource) {
  const {getFillColor, Source, columns, spatialDataColumn, sqlQuery, tableName} = datasource;
  // useMemo to avoid a map instantiation on every re-render
  const tilejson = useMemo<Promise<CartoTilejsonResult>>(() => {
    return Source({...globalOptions, columns, spatialDataColumn, sqlQuery, tableName});
  }, [Source, null, columns, spatialDataColumn, sqlQuery, tableName]);

  return new CartoVectorLayer({
    id: 'carto',
    // @ts-ignore
    data: tilejson, // TODO how to correctly specify data type?
    pickable: true,
    pointRadiusMinPixels: 5,
    getFillColor
  });
}

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
