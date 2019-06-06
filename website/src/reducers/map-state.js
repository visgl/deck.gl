import {handleActions} from 'redux-actions';

import {DEFAULT_MAP_STATE} from '../constants/defaults';

export default handleActions({

  UPDATE_MAP_STATE: (state, {viewState}) => {
    return {...state, viewState};
  },

  UPDATE_MAP_SIZE: (state, {width, height}) => {
    return {...state, width, height};
  }

}, DEFAULT_MAP_STATE);
