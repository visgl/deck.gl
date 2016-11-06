import {request, text} from 'd3-request';
import {StreamParser} from '../utils/worker-utils';

export function loadContent(filename) {
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
  }
}

function loadContentStart(name) {
  return loadContentSuccess(name, '');
}

function loadContentSuccess(name, content) {
  const payload = {};
  payload[name] = content;
  return {type: 'LOAD_CONTENT', payload};
}

export function updateMap(viewport) {
  return {type: 'UPDATE_MAP', viewport};
}

export function loadData(owner, dataArr) {

  return (dispatch, getState) => {
    if (getState().vis.owner === owner) {
      // already loading / loaded
      return;
    }

    let resultData = [];
    let resultMeta = {};
    const isArray = Array.isArray(dataArr);

    if (!isArray) {
      dataArr = [dataArr];
    }

    dispatch(loadDataStart(owner));

    dataArr.forEach(({url, worker}, index) => {
      var req = request(url);
      var dataParser = new StreamParser(worker, (data, meta) => {
        if (isArray) {
          resultData[index] = data;
        } else {
          resultData = data;
        }
        resultMeta = {...resultMeta, ...meta};
        dispatch(loadDataSuccess(owner, resultData, resultMeta));
      });

      req.on('progress', dataParser.onProgress)
        .on('load', dataParser.onLoad)
        .get();
    })

  };
}

function loadDataStart(owner) {
  return {type: 'LOAD_DATA_START', owner};
}

function loadDataSuccess(owner, data, meta) {
  return {
    type: 'LOAD_DATA_SUCCESS',
    payload: {owner, data, meta}
  };
}

export function updateMeta(meta) {
  return {type: 'UPDATE_META', meta};
}

export function updateParam(name, value) {
  return {type: 'UPDATE_PARAM', payload: {name, value}};
}

export function useParams(params) {
  return {type: 'USE_PARAMS', params};
}

export function toggleMenu(isOpen) {
  return {type: 'TOGGLE_MENU', isOpen};
}

export function setHeaderOpacity(opacity) {
  return {type: 'SET_HEADER_OPACITY', opacity};
}
