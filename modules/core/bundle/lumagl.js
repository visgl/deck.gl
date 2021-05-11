// Cherry-pick luma core exports that are relevant to deck
export {
  // Core classes
  Model,
  Transform,
  ProgramManager,
  Timeline,
  // Context utilities
  instrumentGLContext,
  isWebGL2,
  FEATURES,
  hasFeatures,
  getParameters,
  setParameters,
  withParameters,
  cssToDeviceRatio,
  // Copy and blit
  // These are needed by submodules and rely on using the same copy
  // of Texture2D & Framebuffer
  readPixelsToBuffer,
  copyToTexture,
  cloneTextureFrom,
  // WebGL1 classes
  Buffer,
  Program,
  Framebuffer,
  Renderbuffer,
  Texture2D,
  TextureCube,
  // WebGL2 classes
  Texture3D,
  TransformFeedback,
  // Geometries
  Geometry,
  ConeGeometry,
  CubeGeometry,
  CylinderGeometry,
  IcoSphereGeometry,
  PlaneGeometry,
  SphereGeometry,
  TruncatedConeGeometry
} from '@luma.gl/core';

// Constants
import GL from '@luma.gl/constants';

export const TEXTURE_MAG_FILTER = GL.TEXTURE_MAG_FILTER;
export const TEXTURE_MIN_FILTER = GL.TEXTURE_MIN_FILTER;
export const LINEAR = GL.LINEAR;
export const NEAREST = GL.NEAREST;
export const NEAREST_MIPMAP_NEARST = GL.NEAREST_MIPMAP_NEAREST;
export const LINEAR_MIPMAP_NEAREST = GL.LINEAR_MIPMAP_NEAREST;
export const NEAREST_MIPMAP_LINEAR = GL.NEAREST_MIPMAP_LINEAR;
export const LINEAR_MIPMAP_LINEAR = GL.LINEAR_MIPMAP_LINEAR;

export const TEXTURE_WRAP_S = GL.TEXTURE_WRAP_S;
export const TEXTURE_WRAP_T = GL.TEXTURE_WRAP_T;
export const REPEAT = GL.REPEAT;
export const CLAMP_TO_EDGE = GL.CLAMP_TO_EDGE;
export const MIRRORED_REPEAT = GL.MIRRORED_REPEAT;
