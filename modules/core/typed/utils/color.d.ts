import {NumericArray} from '../types/types';
/** Parse array or string color */
declare function parseColor(
  color: NumericArray,
  target?: NumericArray,
  index?: number
): NumericArray;
declare function applyOpacity(color: NumericArray, opacity?: number): NumericArray;
declare const _default: {
  parseColor: typeof parseColor;
  applyOpacity: typeof applyOpacity;
};
export default _default;
// # sourceMappingURL=color.d.ts.map
