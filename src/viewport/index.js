// Note: The base viewport class will be moved to a separate module
// viewport-mercator-project
export * from './viewport';
export {default as BaseViewport} from './viewport';

// The WebGL Viewport is a subclass of the BaseViewport that generates
// WebGL Matrices and Uniforms for deck.gl
export * from './webgl-viewport';
export {default as Viewport} from './webgl-viewport';
export {default as default} from './webgl-viewport';
