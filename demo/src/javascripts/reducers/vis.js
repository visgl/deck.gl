import {handleActions} from 'redux-actions';

import {DEFAULT_VIS_STATE} from '../constants/defaults';
import {normalizeParam} from '../utils/format-utils';

export default handleActions({

  LOAD_DATA_START: (state, action) => ({...state, owner: action.owner, meta: {}, data: null}),
  LOAD_DATA_SUCCESS: (state, action) => {
    if (action.payload.owner !== state.owner) {
      return state;
    }
    return {...state, ...action.payload};
  },

  UPDATE_META: (state, action) => ({...state, meta: {...state.meta, ...action.meta}}),
  USE_PARAMS: (state, action) => {

    const params = Object.keys(action.params)
      .reduce((acc, name) => {
        acc[name] = normalizeParam(action.params[name]);
        return acc;
      }, {});

    return {...state, params};
  },
  UPDATE_PARAM: (state, action) => {
    const {name, value} = action.payload;
    const newParams = {};
    const p = state.params[name];
    if (p) {
      newParams[name] = normalizeParam({...p, value});
      return {...state,
        params: {...state.params, ...newParams}
      };
    }
    return state;
  }

}, DEFAULT_VIS_STATE);
