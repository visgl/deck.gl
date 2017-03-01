// get current blending settings
export function getBlendMode(gl) {
  return {
    enabled: gl.getParameter(gl.BLEND),
    equationRGB: gl.getParameter(gl.BLEND_EQUATION_RGB),
    equationAlpha: gl.getParameter(gl.BLEND_EQUATION_ALPHA),
    srcRGB: gl.getParameter(gl.BLEND_SRC_RGB),
    dstRGB: gl.getParameter(gl.BLEND_DST_RGB),
    srcAlpha: gl.getParameter(gl.BLEND_SRC_ALPHA),
    dstAlpha: gl.getParameter(gl.BLEND_DST_ALPHA)
  };
}

// apply blending settings
export function setBlendMode(gl, settings) {
  if (settings.enabled) {
    gl.enable(gl.BLEND);
  } else {
    gl.disable(gl.BLEND);
  }
  gl.blendEquationSeparate(settings.equationRGB, settings.equationAlpha);
  gl.blendFuncSeparate(settings.srcRGB, settings.dstRGB, settings.srcAlpha, settings.dstAlpha);
}
