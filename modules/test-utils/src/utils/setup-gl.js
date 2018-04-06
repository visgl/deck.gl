import {setContextDefaults} from 'luma.gl';
import {createGLContext} from 'luma.gl';
import createContext from '../luma.gl/headless/headless';
import {global} from '../luma.gl/utils/globals';

setContextDefaults({
  width: 1,
  height: 1,
  debug: true
  // throwOnFailure: false,
  // throwOnError: false
});

global.glContext =
  global.glContext ||
  createGLContext() ||
  // TODO - Seems to be an issue in luma.gl
  (createContext && createContext(100, 100, {}));
// console.log('Context', global.glContext);

export default global.glContext;
