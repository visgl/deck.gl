/* eslint-disable camelcase */
import {CartoAPIError} from './carto-api-error';
import {DEFAULT_API_BASE_URL, DEFAULT_CLIENT, DEFAULT_MAX_LENGTH_URL} from './common';
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
import {ParseMapResult, parseMap} from './parse-map';
import {requestWithParameters} from './request-with-parameters';
import {assert} from '../utils';
import type {APIErrorContext, Basemap, Format, MapType, QueryParameters} from './types';
import {fetchBasemapProps} from './basemap';

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
/* eslint-disable complexity, max-statements, max-params */
async function _fetchMapDataset(
  dataset: Dataset,
  accessToken: string,
  apiBaseUrl: string,
  clientId?: string,
  headers?: Record<string, string>,
  maxLengthURL = DEFAULT_MAX_LENGTH_URL
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
    headers,
    maxLengthURL
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
  apiBaseUrl: string,
  maxLengthURL = DEFAULT_MAX_LENGTH_URL
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
    errorContext,
    maxLengthURL
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
  headers?: Record<string, string>,
  maxLengthURL = DEFAULT_MAX_LENGTH_URL
) {
  const promises = datasets.map(dataset =>
    _fetchMapDataset(dataset, token, apiBaseUrl, clientId, headers, maxLengthURL)
  );
  return await Promise.all(promises);
}

async function fillInTileStats(
  {datasets, keplerMapConfig, token}: {datasets: Dataset[]; keplerMapConfig: any; token: string},
  apiBaseUrl: string,
  maxLengthURL = DEFAULT_MAX_LENGTH_URL
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
    _fetchTilestats(attribute, dataset, token, apiBaseUrl, maxLengthURL)
  );
  return await Promise.all(promises);
}

export type FetchMapOptions = {
  /**
   * CARTO platform access token. Only required for private maps.
   */
  accessToken?: string;

  /**
   * Base URL of the CARTO Maps API.
   *
   * Example for account located in EU-west region: `https://gcp-eu-west1.api.carto.com`
   *
   * @default https://gcp-us-east1.api.carto.com
   */
  apiBaseUrl?: string;

  /**
   * Identifier of map created in CARTO Builder.
   */
  cartoMapId: string;
  clientId?: string;

  /**
   * Custom HTTP headers added to map instantiation and data requests.
   */
  headers?: Record<string, string>;

  /**
   * Interval in seconds at which to autoRefresh the data. If provided, `onNewData` must also be provided.
   */
  autoRefresh?: number;

  /**
   * Callback function that will be invoked whenever data in layers is changed. If provided, `autoRefresh` must also be provided.
   */
  onNewData?: (map: any) => void;

  /**
   * Maximum URL character length. Above this limit, requests use POST.
   * Used to avoid browser and CDN limits.
   * @default {@link DEFAULT_MAX_LENGTH_URL}
   */
  maxLengthURL?: number;
};

export type FetchMapResult = ParseMapResult & {
  /**
   * Basemap properties.
   */
  basemap: Basemap | null;
  stopAutoRefresh?: () => void;
};

/* eslint-disable max-statements */
export async function fetchMap({
  accessToken,
  apiBaseUrl = DEFAULT_API_BASE_URL,
  cartoMapId,
  clientId = DEFAULT_CLIENT,
  headers = {},
  autoRefresh,
  onNewData,
  maxLengthURL = DEFAULT_MAX_LENGTH_URL
}: FetchMapOptions): Promise<FetchMapResult> {
  assert(cartoMapId, 'Must define CARTO map id: fetchMap({cartoMapId: "XXXX-XXXX-XXXX"})');
  assert(apiBaseUrl, 'Must define apiBaseUrl');

  if (accessToken) {
    headers = {Authorization: `Bearer ${accessToken}`, ...headers};
  }

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
  const map = await requestWithParameters({baseUrl, headers, errorContext, maxLengthURL});

  // Periodically check if the data has changed. Note that this
  // will not update when a map is published.
  let stopAutoRefresh: (() => void) | undefined;
  if (autoRefresh) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const intervalId = setInterval(async () => {
      const changed = await fillInMapDatasets(
        map,
        clientId,
        apiBaseUrl,
        {
          ...headers,
          'If-Modified-Since': new Date().toUTCString()
        },
        maxLengthURL
      );
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

  const [basemap] = await Promise.all([
    fetchBasemapProps({config: map.keplerMapConfig.config, errorContext}),

    // Mutates map.datasets so that dataset.data contains data
    fillInMapDatasets(map, clientId, apiBaseUrl, headers, maxLengthURL)
  ]);

  // Mutates attributes in visualChannels to contain tile stats
  await fillInTileStats(map, apiBaseUrl, maxLengthURL);

  const out = {...parseMap(map), basemap, ...{stopAutoRefresh}};

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
