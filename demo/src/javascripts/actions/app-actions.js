import {request, text} from 'd3-request';

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

const loadDataSuccess = (owner, data, meta) => ({
  type: 'LOAD_DATA_SUCCESS',
  payload: {owner, data, meta}
});

export const loadData = (owner, dataArr) => {

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
      const req = request(url);
      const dataParser = new StreamParser(worker, (data, meta) => {
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
    });

  };
};

export const updateMap = viewport => ({type: 'UPDATE_MAP', viewport});
export const updateMeta = meta => ({type: 'UPDATE_META', meta});
export const updateParam = (name, value) => ({type: 'UPDATE_PARAM', payload: {name, value}});
export const useParams = params => ({type: 'USE_PARAMS', params});
export const toggleMenu = isOpen => ({type: 'TOGGLE_MENU', isOpen});
export const setHeaderOpacity = opacity => ({type: 'SET_HEADER_OPACITY', opacity});
