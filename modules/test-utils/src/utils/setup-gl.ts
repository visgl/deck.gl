import {createTestContext, webglDevice, NullDevice} from '@luma.gl/test-utils';

/** Test device */
export const device = webglDevice || new NullDevice({});

/** Test context */
export const gl = createTestContext({
  width: 1,
  height: 1,
  debug: true
  // throwOnFailure: false,
  // throwOnError: false
});

//   // TODO - Seems to be an issue in luma.gl
//   (createContext && createContext(100, 100, {}));
// // console.log('Context', globalThis.glContext);

globalThis.glContext = globalThis.glContext || gl;
