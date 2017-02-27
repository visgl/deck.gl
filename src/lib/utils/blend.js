// get current blending settings
export function getBlendMode(gl) {
  return {
    enabled: gl.getParameter(gl.BLEND),
    equationColor: gl.getParameter(gl.BLEND_EQUATION_RGB),
    equationAlpha: gl.getParameter(gl.BLEND_EQUATION_ALPHA),
    srcColor: gl.getParameter(gl.BLEND_SRC_RGB),
    dstColor: gl.getParameter(gl.BLEND_DST_RGB),
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
  gl.blendEquationSeparate(settings.equationColor, settings.equationAlpha);
  gl.blendFuncSeparate(settings.srcColor, settings.dstColor, settings.srcAlpha, settings.dstAlpha);
}
