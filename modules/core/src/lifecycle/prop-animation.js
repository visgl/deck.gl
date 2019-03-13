import Animation from '../transitions/animation';
import {lerp} from 'math.gl';

function getType(value) {
  if (value === undefined || value === null) {
    return 'null';
  }
  if (ArrayBuffer.isView(value) || Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

export default class LayerPropAnimation extends Animation {
  _getInterpolator(startValue, endValue) {
    const startType = getType(startValue);
    const endType = getType(endValue);

    if (endType === 'null') {
      return () => startValue;
    }
    if (startType === 'null' || startType !== endType) {
      return () => endValue;
    }

    switch (startType) {
      case 'number':
        return lerp;

      case 'array':
        if (startValue.length === endValue.length && startValue.length <= 16 && Number.isFinite(startValue[0])) {
          // Array of numbers
          return lerp;
        }

      default:
    }
    return () => endValue;
  }
}
