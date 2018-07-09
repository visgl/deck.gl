import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import appReducer from './app';
import visReducer from './vis';
import contentsReducer from './contents';
import mapStateReducer from './map-state';

export default createStore(
  combineReducers({
    app: appReducer,
    vis: visReducer,
    contents: contentsReducer,
    map: mapStateReducer
  }),
  applyMiddleware(thunk)
);
