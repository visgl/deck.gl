/* eslint-disable no-undef */
import {jsdom} from 'jsdom';
import global from 'global';

// using jsDom to emulate a subset of a web browser to be useful for testing and
// scraping real-world web applications
// this is needed to enable using sinon in the node env
// to test spies, stubs and mocks on function calls

global.document = jsdom('');
global.window = global.document.defaultView;
Object.keys(global.document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = global.document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

/* eslint-enable no-undef */
