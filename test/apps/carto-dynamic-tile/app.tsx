/* global document */
/* eslint-disable no-console */
import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {
  CartoTilejsonResult,
  CartoVectorLayer,
  CartoVectorTableSource,
  H3TileLayer,
  QuadbinTileLayer,
} from '@deck.gl/carto';
import datasets from './datasets';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const INITIAL_VIEW_STATE = {longitude: -87.65, latitude: 41.82, zoom: 10};

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const connectionName = 'bigquery';

const accessToken = 'XXX';

const globalOptions = {accessToken, apiBaseUrl, connectionName}; // apiBaseUrl not required

function Root() {
  const [dataset, setDataset] = useState(Object.keys(datasets)[0]);
  const datasource = datasets[dataset];
  let layers;

  if (dataset.includes('h3')) {
    layers = [createH3Layer(datasource)];
  } else if (dataset.includes('quadbin')) {
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

function createH3Layer(datasource) {
  const {getFillColor, Source, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName} = datasource;
  // useMemo to avoid a map instantiation on every re-render
  const tilejson = useMemo<Promise<CartoTilejsonResult>>(() => {
    return Source({...globalOptions, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName});
  }, [Source, aggregationExp, columns, spatialDataColumn, sqlQuery, tableName]);

  return new H3TileLayer({
    id: 'carto',
    data: tilejson,
    pickable: true,
    stroked: false,
    getFillColor
  });
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

async function fetchLayerData() {
  const data = await CartoVectorTableSource({...globalOptions, tableName: 'carto-demo-data.demo_tables.chicago_crime_sample', format: 'geojson'});
  console.log(data.tiles); // <- Typescript error
  console.log(data.features); // <- type: GeoJSON
}
fetchLayerData();

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
