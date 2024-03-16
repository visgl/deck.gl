/* eslint-disable camelcase */
/**
 * Maps API Client for Carto 3
 */
import {CartoAPIError} from './carto-api-error';
import {DEFAULT_API_BASE_URL, DEFAULT_CLIENT} from './common';
import {buildPublicMapUrl, buildStatsUrl} from './endpoints';
import {
  GeojsonResult,
  JsonResult,
  TilejsonResult,
  h3QuerySource,
  h3TableSource,
  quadbinQuerySource,
  quadbinTableSource,
  vectorQuerySource,
  vectorTableSource,
  vectorTilesetSource
} from '../sources/index';
import {parseMap} from './parse-map';
import {requestWithParameters} from './request-with-parameters';
import {assert} from '../utils';
import type {APIErrorContext, Format, MapType, QueryParameters} from './types';

type Dataset = {
  id: string;
  type: MapType;
  source: string;
  cache?: number;
  connectionName: string;
  geoColumn: string;
  data: TilejsonResult | GeojsonResult | JsonResult;
  columns: string[];
  format: Format;
  aggregationExp: string;
  aggregationResLevel: number;
  queryParameters: QueryParameters;
};

/* global clearInterval, setInterval, URL */
/* eslint-disable complexity, max-statements */
async function _fetchMapDataset(
  dataset: Dataset,
  accessToken: string,
  apiBaseUrl: string,
  clientId?: string,
  headers?: Record<string, string>
) {
  const {
    aggregationExp,
    aggregationResLevel,
    connectionName,
    columns,
    format,
    geoColumn,
    source,
    type,
    queryParameters
  } = dataset;

  const cache: {value?: number} = {};
  const globalOptions: any = {
    accessToken,
    apiBaseUrl,
    cache,
    clientId,
    connectionName,
    format,
    headers
  };

  if (type === 'tileset') {
    // TODO do we want a generic tilesetSource?
    // @ts-ignore
    dataset.data = await vectorTilesetSource({...globalOptions, tableName: source});
  } else {
    const [spatialDataType, spatialDataColumn] = geoColumn ? geoColumn.split(':') : ['geom'];
    if (spatialDataType === 'geom') {
      const options = {...globalOptions, spatialDataColumn};
      if (type === 'table') {
        dataset.data = await vectorTableSource({...options, columns, tableName: source});
      } else if (type === 'query') {
        dataset.data = await vectorQuerySource({
          ...options,
          columns,
          sqlQuery: source,
          queryParameters
        });
      }
    } else if (spatialDataType === 'h3') {
      const options = {...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn};
      if (type === 'table') {
        dataset.data = await h3TableSource({...options, tableName: source});
      } else if (type === 'query') {
        dataset.data = await h3QuerySource({...options, sqlQuery: source, queryParameters});
      }
    } else if (spatialDataType === 'quadbin') {
      const options = {...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn};
      if (type === 'table') {
        dataset.data = await quadbinTableSource({...options, tableName: source});
      } else if (type === 'query') {
        dataset.data = await quadbinQuerySource({...options, sqlQuery: source, queryParameters});
      }
    }
  }
  let cacheChanged = true;
  if (cache.value) {
    cacheChanged = dataset.cache !== cache.value;
    dataset.cache = cache.value;
  }

  return cacheChanged;
}

async function _fetchTilestats(
  attribute: string,
  dataset: Dataset,
  accessToken: string,
  apiBaseUrl: string
) {
  const {connectionName, data, id, source, type, queryParameters} = dataset;
  const errorContext: APIErrorContext = {
    requestType: 'Tile stats',
    connection: connectionName,
    type,
    source
  };
  if (!('tilestats' in data)) {
    throw new CartoAPIError(new Error(`Invalid dataset for tilestats: ${id}`), errorContext);
  }

  const baseUrl = buildStatsUrl({attribute, apiBaseUrl, ...dataset});
  const client = new URLSearchParams(data.tiles[0]).get('client');
  const headers = {Authorization: `Bearer ${accessToken}`};
  const parameters: Record<string, string> = {};
  if (client) {
    parameters.client = client;
  }
  if (type === 'query') {
    parameters.q = source;
    if (queryParameters) {
      parameters.queryParameters = JSON.stringify(queryParameters);
    }
  }
  const stats = await requestWithParameters({
    baseUrl,
    headers,
    parameters,
    errorContext
  });

  // Replace tilestats for attribute with value from API
  const {attributes} = data.tilestats.layers[0];
  const index = attributes.findIndex(d => d.attribute === attribute);
  attributes[index] = stats;
  return true;
}

async function fillInMapDatasets(
  {datasets, token}: {datasets: Dataset[]; token: string},
  clientId: string,
  apiBaseUrl: string,
  headers?: Record<string, string>
) {
  const promises = datasets.map(dataset =>
    _fetchMapDataset(dataset, token, apiBaseUrl, clientId, headers)
  );
  return await Promise.all(promises);
}

async function fillInTileStats(
  {datasets, keplerMapConfig, token}: {datasets: Dataset[]; keplerMapConfig: any; token: string},
  apiBaseUrl: string
) {
  const attributes: {attribute: string; dataset: any}[] = [];
  const {layers} = keplerMapConfig.config.visState;
  for (const layer of layers) {
    for (const channel of Object.keys(layer.visualChannels)) {
      const attribute = layer.visualChannels[channel]?.name;
      if (attribute) {
        const dataset = datasets.find(d => d.id === layer.config.dataId);
        if (dataset && dataset.type !== 'tileset' && (dataset.data as TilejsonResult).tilestats) {
          // Only fetch stats for QUERY & TABLE map types
          attributes.push({attribute, dataset});
        }
      }
    }
  }
  // Remove duplicates to avoid repeated requests
  const filteredAttributes: {attribute: string; dataset: any}[] = [];
  for (const a of attributes) {
    if (
      !filteredAttributes.find(
        ({attribute, dataset}) => attribute === a.attribute && dataset === a.dataset
      )
    ) {
      filteredAttributes.push(a);
    }
  }

  const promises = filteredAttributes.map(({attribute, dataset}) =>
    _fetchTilestats(attribute, dataset, token, apiBaseUrl)
  );
  return await Promise.all(promises);
}

export type FetchMapOptions = {
  apiBaseUrl?: string;
  cartoMapId: string;
  clientId?: string;
  headers?: Record<string, string>;
  autoRefresh?: number;
  onNewData?: (map: any) => void;
};

/* eslint-disable max-statements */
export async function fetchMap({
  apiBaseUrl = DEFAULT_API_BASE_URL,
  cartoMapId,
  clientId = DEFAULT_CLIENT,
  headers = {},
  autoRefresh,
  onNewData
}: FetchMapOptions) {
  assert(cartoMapId, 'Must define CARTO map id: fetchMap({cartoMapId: "XXXX-XXXX-XXXX"})');
  assert(apiBaseUrl, 'Must define apiBaseUrl');

  if (autoRefresh || onNewData) {
    assert(onNewData, 'Must define `onNewData` when using autoRefresh');
    assert(typeof onNewData === 'function', '`onNewData` must be a function');
    assert(
      typeof autoRefresh === 'number' && autoRefresh > 0,
      '`autoRefresh` must be a positive number'
    );
  }

  const baseUrl = buildPublicMapUrl({apiBaseUrl, cartoMapId});
  const errorContext: APIErrorContext = {requestType: 'Public map', mapId: cartoMapId};
  const map = await requestWithParameters({baseUrl, headers, errorContext});

  // Periodically check if the data has changed. Note that this
  // will not update when a map is published.
  let stopAutoRefresh: (() => void) | undefined;
  if (autoRefresh) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const intervalId = setInterval(async () => {
      const changed = await fillInMapDatasets(map, clientId, apiBaseUrl, {
        ...headers,
        'If-Modified-Since': new Date().toUTCString()
      });
      if (onNewData && changed.some(v => v === true)) {
        onNewData(parseMap(map));
      }
    }, autoRefresh * 1000);
    stopAutoRefresh = () => {
      clearInterval(intervalId);
    };
  }

  const geojsonLayers = map.keplerMapConfig.config.visState.layers.filter(
    ({type}) => type === 'geojson' || type === 'point'
  );
  const geojsonDatasetIds = geojsonLayers.map(({config}) => config.dataId);
  map.datasets.forEach(dataset => {
    if (geojsonDatasetIds.includes(dataset.id)) {
      const {config} = geojsonLayers.find(({config}) => config.dataId === dataset.id);
      dataset.format = 'geojson';
      // Support for very old maps. geoColumn was not stored in the past
      if (!dataset.geoColumn && config.columns.geojson) {
        dataset.geoColumn = config.columns.geojson;
      }
    }
  });

  // Mutates map.datasets so that dataset.data contains data
  await fillInMapDatasets(map, clientId, apiBaseUrl, headers);

  // Mutates attributes in visualChannels to contain tile stats
  await fillInTileStats(map, apiBaseUrl);
  const out = {...parseMap(map), ...{stopAutoRefresh}};

  const textLayers = out.layers.filter(layer => {
    const pointType = layer.props.pointType || '';
    return pointType.includes('text');
  });

  /* global FontFace, window, document */
  if (textLayers.length && window.FontFace && !document.fonts.check('12px Inter')) {
    // Fetch font needed for labels
    const font = new FontFace(
      'Inter',
      'url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2)'
    );
    await font.load().then(f => document.fonts.add(f));
  }

  return out;
}
