import {handleActions} from 'redux-actions';

import {DEFAULT_VIEWPORT_STATE} from '../constants/defaults';
import ViewportAnimation from '../utils/map-utils';

ViewportAnimation.init();

export default handleActions({

  UPDATE_MAP: (state, action) => {
    const {viewport} = action;
    const maxZoom = viewport.maxZoom || state.maxZoom || 20;
    if (viewport.zoom > maxZoom) {
      return state;
    }
    return {...state, ...viewport};
  }

}, DEFAULT_VIEWPORT_STATE);
