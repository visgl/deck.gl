import {DEFAULT_VIS_STATE} from '../constants/defaults';
import {normalizeParam} from '../utils/format-utils';

export default function vispReducer(state = DEFAULT_VIS_STATE, action) {
  switch (action.type) {

  case 'LOAD_DATA_START':
    return {...state,
      owner: action.owner,
      meta: {},
      data: null
    };

  case 'LOAD_DATA_SUCCESS':
    if (action.payload.owner !== state.owner) {
      return state;
    }
    return {...state, ...action.payload};

  case 'UPDATE_META':
    return {...state, meta: {...state.meta, ...action.meta}};

  case 'USE_PARAMS': {
    const params = {};
    for (var name in action.params) {
      params[name] = normalizeParam(action.params[name]);
    }

    return {...state, params};
  }

  case 'UPDATE_PARAM': {
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
  }

  return state;
}
