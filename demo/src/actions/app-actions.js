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

export const loadData = (owner, dataArr) => {

  return (dispatch, getState) => {
    if (getState().vis.owner === owner) {
      // already loading / loaded
      return;
    }

    const isArray = Array.isArray(dataArr);

    if (!isArray) {
      dataArr = [dataArr];
    }
    const context = {
      owner,
      resultData: [],
      resultMeta: [],
      isArray
    };

    dispatch(loadDataStart(owner));

    dataArr.forEach(({url, worker}, index) => {
      if (worker) {
        const req = request(url);
        // use a web worker to parse data
        const dataParser = new StreamParser(worker, (data, meta) => {
          dispatch(loadDataSuccess(context, index, data, meta));
        });

        req.on('progress', dataParser.onProgress)
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

export const updateMap = viewport => ({type: 'UPDATE_MAP', viewport});
export const updateMeta = meta => ({type: 'UPDATE_META', meta});
export const updateParam = (name, value) => ({type: 'UPDATE_PARAM', payload: {name, value}});
export const useParams = params => ({type: 'USE_PARAMS', params});
export const toggleMenu = isOpen => ({type: 'TOGGLE_MENU', isOpen});
export const setHeaderOpacity = opacity => ({type: 'SET_HEADER_OPACITY', opacity});
