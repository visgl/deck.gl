import {createTestContext} from '@luma.gl/test-utils';

/* global window, global*/
const _global = typeof global !== 'undefined' ? global : window;

_global.glContext =
  _global.glContext ||
  createTestContext({
    width: 1,
    height: 1,
    debug: true
    // throwOnFailure: false,
    // throwOnError: false
  });
//   // TODO - Seems to be an issue in luma.gl
//   (createContext && createContext(100, 100, {}));
// // console.log('Context', _global.glContext);

export default _global.glContext;
