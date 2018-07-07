import {handleActions} from 'redux-actions';

import {DEFAULT_MAP_STATE} from '../constants/defaults';

export default handleActions({

  UPDATE_MAP_STATE: (state, {viewState}) => {
    const maxZoom = Number.isFinite(viewState.maxZoom) ? state.maxZoom : viewState.maxZoom;
    const minZoom = Number.isFinite(viewState.minZoom) ? state.minZoom : viewState.minZoom;

    if (viewState.zoom > maxZoom || viewState.zoom < minZoom) {
      return state;
    }
    return {...state, viewState};
  },

  UPDATE_MAP_SIZE: (state, {width, height}) => {
    return {...state, width, height};
  }

}, DEFAULT_MAP_STATE);
