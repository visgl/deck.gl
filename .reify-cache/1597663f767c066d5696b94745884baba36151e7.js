"use strict";module.export({default:()=>getPixelRatio});var assert;module.link('../utils/assert',{default(v){assert=v}},0);/* global window */


function getPixelRatio(useDevicePixels) {
  assert(typeof useDevicePixels === 'boolean', 'Invalid useDevicePixels');
  return useDevicePixels && typeof window !== 'undefined' ? window.devicePixelRatio : 1;
}
