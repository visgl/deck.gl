/* global document */
/* eslint-disable no-console */
import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {
  CartoVectorQuerySource,
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
  },
  'vector-query': {
    sqlQuery:
      'select * from `cartodb-on-gcp-backend-team`.alasarr.madrid_buildings where grossFloorAreaM2 > 2000',
    getFillColor: colorBins({
      attr: 'grossFloorAreaM2',
      domain: [0, 200, 400, 1000, 2000, 5000],
      colors: 'OrYel'
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

const accessToken = 'XXX';

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
  const {getFillColor, sqlQuery, tableName} = datasource;
  // useMemo to avoid a map instantiation on every re-render
  const tilejson = useMemo<Promise<CartoTilejsonResult> | null>(() => {
    if (tableName) {
      return CartoVectorTableSource({...globalOptions, tableName});
    }
    if (sqlQuery) {
      return CartoVectorQuerySource({...globalOptions, sqlQuery});
    }

    return null;
  }, [sqlQuery, tableName]);

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
