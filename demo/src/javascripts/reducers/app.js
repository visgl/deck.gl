import {DEFAULT_APP_STATE} from '../constants/defaults';

export default function appReducer(state = DEFAULT_APP_STATE, action) {
  switch(action.type) {
  case 'TOGGLE_MENU':
    return {...state, isMenuOpen: action.isOpen};
  case 'SET_HEADER_OPACITY':
    if (action.opacity !== state.headerOpacity) {
      return {...state, headerOpacity: action.opacity};
    }
    return state;
  }
  return state;
}
