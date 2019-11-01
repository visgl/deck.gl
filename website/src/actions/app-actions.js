import {request, json, text} from 'd3-request';

import {StreamParser} from '../utils/worker-utils';

const loadContentSuccess = (name, content) => {
  const payload = {};
  payload[name] = content;
  return {type: 'LOAD_CONTENT', payload};
};

const loadContentStart = name => loadContentSuccess(name, '');

export const loadContent = filename => {
  return (dispatch, getState) => {
    const {contents} = getState();
    if (filename in contents) {
      // already loaded
      return;
    }

    dispatch(loadContentStart(filename));
    text(filename, (error, response) => {
      dispatch(loadContentSuccess(filename, error ? error.target.response : response));
    });
  };
};

const loadDataStart = owner => ({type: 'LOAD_DATA_START', owner});

const loadDataSuccess = (context, index, data, meta) => {
  if (context.isArray) {
    context.resultData = context.resultData.slice(0);
    context.resultData[index] = data;
  } else {
    context.resultData = data;
  }
  context.resultMeta = {...context.resultMeta, ...meta};

  return {
    type: 'LOAD_DATA_SUCCESS',
    payload: {
      owner: context.owner,
      data: context.resultData,
      meta: context.resultMeta
    }
  };
};

/*
 * loads data for a demo
 * @param {String} owner - identifier of the demo
 * @param {Object | Array} source - an object or array of objects specifying
 *  the data that needs to be loaded
 *    {String} source.url - (required) url of the data file
 *    {String} source.worker - (optional) url of a web worker
 *      if specified, then the loaded file content will be passed to the worker
 *      if not specified, then the loaded file will be parsed as JSON or text
 *      based on its extension
 */
export const loadData = (owner, source) => {
  return (dispatch, getState) => {
    if (getState().vis.owner === owner) {
      // already loading / loaded
      return;
    }

    const isArray = Array.isArray(source);

    if (!isArray) {
      source = [source];
    }
    const context = {
      owner,
      resultData: [],
      resultMeta: [],
      isArray
    };

    dispatch(loadDataStart(owner));

    source.forEach(({url, worker}, index) => {
      if (worker) {
        const req = request(url);
        // use a web worker to parse data
        const dataParser = new StreamParser(worker, (data, meta) => {
          dispatch(loadDataSuccess(context, index, data, meta));
        });

        req
          .on('progress', dataParser.onProgress)
          .on('load', dataParser.onLoad)
          .get();
      } else if (/\.(json|geojson)$/.test(url)) {
        // load as json
        json(url, (error, response) => {
          if (!error) {
            dispatch(loadDataSuccess(context, index, response, {}));
          }
        });
      } else {
        // load as plain text
        text(url, (error, response) => {
          if (!error) {
            dispatch(loadDataSuccess(context, index, response, {}));
          }
        });
      }
    });
  };
};

export const updateMapSize = ({width, height}) => ({type: 'UPDATE_MAP_SIZE', width, height});
export const updateMapState = viewState => ({type: 'UPDATE_MAP_STATE', viewState});

export const updateMeta = meta => ({type: 'UPDATE_META', meta});

export const useParams = params => ({type: 'USE_PARAMS', params});
export const updateParam = (name, value) => ({type: 'UPDATE_PARAM', payload: {name, value}});
export const resetParams = params => ({type: 'RESET_PARAMS'});

export const toggleMenu = isOpen => ({type: 'TOGGLE_MENU', isOpen});
