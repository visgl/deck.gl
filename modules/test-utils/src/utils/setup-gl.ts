import {createTestDevice, webglDevice, NullDevice} from '@luma.gl/test-utils';

/** Test device */
export const device = webglDevice || new NullDevice({});

/** Test context */
const testDevice = createTestDevice();

export const gl = testDevice?.gl!;

//   // TODO - Seems to be an issue in luma.gl
//   (createContext && createContext(100, 100, {}));
// // console.log('Context', globalThis.glContext);

globalThis.glContext = globalThis.glContext || gl;
