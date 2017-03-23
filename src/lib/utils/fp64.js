// TODO - move to shaderlib utilities
import {log} from '.';
import {COORDINATE_SYSTEM} from '..';

export function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  return [hiPart, loPart];
}

export function enable64bitSupport(props) {
  if (props.fp64) {
    if (props.projectionMode === COORDINATE_SYSTEM.LNGLAT) {
      return true;
    }
    log.once(0, `64-bit mode only works with projectionMode set to
      COORDINATE_SYSTEM.LNGLAT. Rendering in 32-bit mode instead`);
  }

  return false;
}
