import {createTestContext, webgl1TestDevice} from '@luma.gl/test-utils';

globalThis.glContext =
  globalThis.glContext ||
  createTestContext({
    width: 1,
    height: 1,
    debug: true
    // throwOnFailure: false,
    // throwOnError: false
  });
//   // TODO - Seems to be an issue in luma.gl
//   (createContext && createContext(100, 100, {}));
// // console.log('Context', globalThis.glContext);

export default globalThis.glContext;

export const device = webgl1TestDevice;
