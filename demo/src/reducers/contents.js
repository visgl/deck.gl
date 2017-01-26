import {handleActions} from 'redux-actions';

export default handleActions({

  LOAD_CONTENT: (state, action) => ({...state, ...action.payload})

}, {});
