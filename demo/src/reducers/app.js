import {handleActions} from 'redux-actions';

import {DEFAULT_APP_STATE} from '../constants/defaults';

export default handleActions({

  TOGGLE_MENU: (state, action) => ({...state, isMenuOpen: action.isOpen}),

  SET_HEADER_OPACITY: (state, action) => {
    if (action.opacity !== state.headerOpacity) {
      return {...state, headerOpacity: action.opacity};
    }
    return state;
  }

}, DEFAULT_APP_STATE);
