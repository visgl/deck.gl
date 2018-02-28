/* eslint-disable quotes, no-console */
/* global console */
import 'luma.gl';
import {global, isBrowser} from '../utils/globals';

const ERR_NO_HEADLESS_GL = `\
Failed to dynamically load headless gl. \
gl not installed or not accessible from this directory.`;

const luma = global.luma;
if (!isBrowser) {
  try {
    luma.globals.headlessGL = module.require('gl');
    luma.globals.headlessTypes = module.require('gl/wrap');
  } catch (error) {
    console.error(ERR_NO_HEADLESS_GL);
    console.error(`Node error: ${error.message}`);
  }
  const {headlessGL, headlessTypes} = luma.globals;
  if (headlessGL && !(headlessTypes && headlessTypes.WebGLRenderingContext)) {
    console.error('Could not access headless WebGL type definitions');
  }
}

export const isWebglAvailable = isBrowser || luma.globals.headlessGL;

if (isWebglAvailable) {
  // console.log('WebGL initialized');
}

// Create context
export default luma.globals.headlessGL;
