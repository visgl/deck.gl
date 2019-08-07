import {handleActions} from 'redux-actions';

import {DEFAULT_APP_STATE} from '../constants/defaults';

export default handleActions({

  TOGGLE_MENU: (state, action) => ({...state, isMenuOpen: action.isOpen})

}, DEFAULT_APP_STATE);
