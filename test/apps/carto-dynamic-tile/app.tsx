/* global document */
/* eslint-disable no-console */
import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {
  CartoVectorTableSource,
  CartoTilejsonResult,
  _CartoTileLayer as CartoTileLayer,
  colorBins
} from '@deck.gl/carto';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const INITIAL_VIEW_STATE = {longitude: -3.7082998, latitude: 40.4205556, zoom: 15};

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const connectionName = 'bigquery';

const config = {
  'vector-table': {
    tableName: 'cartodb-on-gcp-backend-team.alasarr.madrid_buildings',
    getFillColor: colorBins({
      attr: 'grossFloorAreaM2',
      domain: [0, 200, 400, 1000, 2000, 5000],
      colors: 'Magenta'
    })
  }
};

const COLUMNS = {
  do_area: false,
  do_date: false,
  do_label: true,
  do_perimeter: true,
  do_num_vertices: false
};

const accessToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRVNGNZTHAwaThjYnVMNkd0LTE0diJ9.eyJodHRwOi8vYXBwLmNhcnRvLmNvbS9lbWFpbCI6ImZwYWxtZXJAY2FydG9kYi5jb20iLCJodHRwOi8vYXBwLmNhcnRvLmNvbS9hY2NvdW50X2lkIjoiYWNfN3hoZnd5bWwiLCJpc3MiOiJodHRwczovL2F1dGguY2FydG8uY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA3OTY5NjU1OTI5NjExMjIxNDg2IiwiYXVkIjoiY2FydG8tY2xvdWQtbmF0aXZlLWFwaSIsImlhdCI6MTY5NTMwNzgxNywiZXhwIjoxNjk1Mzk0MjE3LCJhenAiOiJBdHh2SERldVhsUjhYUGZGMm5qMlV2MkkyOXB2bUN4dSIsInBlcm1pc3Npb25zIjpbImV4ZWN1dGU6d29ya2Zsb3dzIiwicmVhZDphY2NvdW50IiwicmVhZDphcHBzIiwicmVhZDpjb25uZWN0aW9ucyIsInJlYWQ6Y3VycmVudF91c2VyIiwicmVhZDppbXBvcnRzIiwicmVhZDpsaXN0ZWRfYXBwcyIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJyZWFkOnRva2VucyIsInJlYWQ6d29ya2Zsb3dzIiwidXBkYXRlOmN1cnJlbnRfdXNlciIsIndyaXRlOmFwcHMiLCJ3cml0ZTpjYXJ0by1kdy1ncmFudHMiLCJ3cml0ZTpjb25uZWN0aW9ucyIsIndyaXRlOmltcG9ydHMiLCJ3cml0ZTptYXBzIiwid3JpdGU6dG9rZW5zIiwid3JpdGU6d29ya2Zsb3dzIl19.RDg_neVMRY7IbWVnrtduYo6vIr5z27IbYNgNdFQSc4JeVJtPPrTXeBT1gWbjztpf2O9kPHm5iruK8Pp1sFRD39beWY49mnluo1IreL7xmjCH0RS_AN9Vo5liyj5wv-R80J9EQZCPu6N_M53otNZlSLFju7-ENpFpiiHwVUVuIFpGT0ZLjS3vVYTSrGXwgOMLfnTuTLgtASqSKcy9x8WntWGQ1T-7FnIAOT-iwgsD5nMcie-uiwopov7WJ5b9Txu2dge-WJOIdVqmegE6_sk6lPzokC8Zh-ccv-IlqE1FhH6fVLkUixywwGvZcWkOEH3gjC6GhGIW4VhRcDs-nfe0Zw';

const globalOptions = {accessToken, apiBaseUrl, connectionName}; // apiBaseUrl not required

function Root() {
  const [columns, setColumns] = useState(COLUMNS);
  const [dataset, setDataset] = useState('vector-table');
  const datasource = config[dataset];
  const cols = trueKeys(columns);

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[createCarto(datasource, cols)]}
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
        obj={Object.keys(config)}
        value={dataset}
        onSelect={setDataset}
      />
      <MultiSelect
        enabled={datasource.tableName}
        obj={COLUMNS}
        onChange={e => {
          setColumns({...e});
        }}
      />
    </>
  );
}

function createCarto(datasource, columns) {
  const {getFillColor, tableName} = datasource;
  // useMemo to avoid a map instantiation on every re-render
  const tilejson = useMemo<Promise<CartoTilejsonResult> | null>(() => {
    if (tableName) {
      return CartoVectorTableSource({...globalOptions, tableName});
    }

    return null;
  }, [tableName]);

  return new CartoTileLayer({
    id: 'carto',
    data: tilejson as any, // TODO type

    // Styling
    pickable: true,
    lineWidthMinPixels: 1,
    getFillColor
  });
}

function ObjectSelect({title, obj, value, onSelect}) {
  const keys = Object.values(obj).sort() as string[];
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

const boxStyle = {
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '4px 8px',
  margin: 3,
  width: 150
} as React.CSSProperties;
function MultiSelect({enabled, obj, onChange}) {
  return (
    <div style={{...boxStyle, ...(enabled ? {} : {pointerEvents: 'none', opacity: 0.2})}}>
      {Object.entries(obj).map(([key, value]) => (
        <Checkbox
          key={key}
          label={key}
          value={value}
          onChange={e => {
            obj[key] = e.target.checked;
            onChange(obj);
          }}
        />
      ))}
    </div>
  );
}

function Checkbox({label, value, onChange}) {
  return (
    <label>
      {label}:
      <input type="checkbox" checked={value} onChange={onChange} />
      <br />
    </label>
  );
}

function trueKeys(obj) {
  return Object.entries(obj)
    .filter(([k, v]) => v)
    .map(([k, v]) => k);
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
