"use strict";var createGLContext,setContextDefaults;module.link('@luma.gl/core',{createGLContext(v){createGLContext=v},setContextDefaults(v){setContextDefaults=v}},0);

/* global window, global*/
const _global = typeof global !== 'undefined' ? global : window;

setContextDefaults({
  width: 1,
  height: 1,
  debug: true
  // throwOnFailure: false,
  // throwOnError: false
});

_global.glContext = _global.glContext || createGLContext();
//   // TODO - Seems to be an issue in luma.gl
//   (createContext && createContext(100, 100, {}));
// // console.log('Context', _global.glContext);

module.exportDefault(_global.glContext);
