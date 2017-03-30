import {handleActions} from 'redux-actions';

import {DEFAULT_VIEWPORT_STATE} from '../constants/defaults';
import ViewportAnimation from '../utils/map-utils';

ViewportAnimation.init();

export default handleActions({

  UPDATE_MAP: (state, action) => {
    const {viewport} = action;

    const maxZoom = Number.isFinite(viewport.maxZoom) ? state.maxZoom : viewport.maxZoom;
    const minZoom = Number.isFinite(viewport.minZoom) ? state.minZoom : viewport.minZoom;

    if (viewport.zoom > maxZoom || viewport.zoom < minZoom) {
      return state;
    }
    return {...state, ...viewport};
  }

}, DEFAULT_VIEWPORT_STATE);
