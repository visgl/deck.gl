/* Generate script that can be used in browser without browserify */

/* global window */
import 'babel-polyfill';
import * as DeckGL from './index';

(function exposeAsGlobal() {
  if (typeof window !== 'undefined') {
    window.DeckGL = DeckGL;
  }
}());
