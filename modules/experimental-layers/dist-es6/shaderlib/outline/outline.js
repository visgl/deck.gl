/* eslint-disable camelcase */
const INITIAL_STATE = {
  outlineEnabled: false,
  outlineRenderShadowmap: false,
  outlineShadowmap: null
};

function getUniforms({
  outlineEnabled,
  outlineRenderShadowmap,
  outlineShadowmap
} = INITIAL_STATE) {
  const uniforms = {};

  if (outlineEnabled !== undefined) {
    uniforms.outline_uEnabled = outlineEnabled; // ? 1.0 : 0.0;
  }

  if (outlineRenderShadowmap !== undefined) {
    uniforms.outline_uRenderOutlines = outlineRenderShadowmap; // ? 1.0 : 0.0;
  }

  if (outlineShadowmap !== undefined) {
    uniforms.outline_uShadowmap = outlineShadowmap;
  }

  return uniforms;
}

const vs = `\
varying float outline_vzLevel;
varying vec4 outline_vPosition;

// Set the z level for the outline shadowmap rendering
void outline_setZLevel(float zLevel) {
  outline_vzLevel = zLevel;
}

// Store an adjusted position for texture2DProj
void outline_setUV(vec4 position) {
  // mat4(
  //   0.5, 0.0, 0.0, 0.0,
  //   0.0, 0.5, 0.0, 0.0,
  //   0.0, 0.0, 0.5, 0.0,
  //   0.5, 0.5, 0.5, 1.0
  // ) * position;
  outline_vPosition = vec4(position.xyz * 0.5 + position.w * 0.5, position.w);
}
`;
const fs = `\
uniform bool outline_uEnabled;
uniform bool outline_uRenderOutlines;
uniform sampler2D outline_uShadowmap;

varying float outline_vzLevel;
// varying vec2 outline_vUV;
varying vec4 outline_vPosition;

const float OUTLINE_Z_LEVEL_ERROR = 0.01;

// Return a darker color in shadowmap
vec4 outline_filterShadowColor(vec4 color) {
  return vec4(outline_vzLevel / 255., outline_vzLevel / 255., outline_vzLevel / 255., 1.);
}

// Return a darker color if in shadowmap
vec4 outline_filterDarkenColor(vec4 color) {
  if (outline_uEnabled) {
    float maxZLevel;
    if (outline_vPosition.q > 0.0) {
      maxZLevel = texture2DProj(outline_uShadowmap, outline_vPosition).r * 255.;
    } else {
      discard;
    }
    if (maxZLevel < outline_vzLevel + OUTLINE_Z_LEVEL_ERROR) {
      vec4(color.rgb * 0.5, color.a);
    } else {
      discard;
    }
  }
  return color;
}

// if enabled and rendering outlines - Render depth to shadowmap
// if enabled and rendering colors - Return a darker color if in shadowmap
// if disabled, just return color
vec4 outline_filterColor(vec4 color) {
  if (outline_uEnabled) {
    return outline_uRenderOutlines ?
      outline_filterShadowColor(color) :
      outline_filterDarkenColor(color);
  }
  return color;
}
`;
export default {
  name: 'outline',
  vs,
  fs,
  getUniforms
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFkZXJsaWIvb3V0bGluZS9vdXRsaW5lLmpzIl0sIm5hbWVzIjpbIklOSVRJQUxfU1RBVEUiLCJvdXRsaW5lRW5hYmxlZCIsIm91dGxpbmVSZW5kZXJTaGFkb3dtYXAiLCJvdXRsaW5lU2hhZG93bWFwIiwiZ2V0VW5pZm9ybXMiLCJ1bmlmb3JtcyIsInVuZGVmaW5lZCIsIm91dGxpbmVfdUVuYWJsZWQiLCJvdXRsaW5lX3VSZW5kZXJPdXRsaW5lcyIsIm91dGxpbmVfdVNoYWRvd21hcCIsInZzIiwiZnMiLCJuYW1lIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE1BQU1BLGdCQUFnQjtBQUNwQkMsa0JBQWdCLEtBREk7QUFFcEJDLDBCQUF3QixLQUZKO0FBR3BCQyxvQkFBa0I7QUFIRSxDQUF0Qjs7QUFNQSxTQUFTQyxXQUFULENBQXFCO0FBQUNILGdCQUFEO0FBQWlCQyx3QkFBakI7QUFBeUNDO0FBQXpDLElBQTZESCxhQUFsRixFQUFpRztBQUMvRixRQUFNSyxXQUFXLEVBQWpCOztBQUNBLE1BQUlKLG1CQUFtQkssU0FBdkIsRUFBa0M7QUFDaENELGFBQVNFLGdCQUFULEdBQTRCTixjQUE1QixDQURnQyxDQUNZO0FBQzdDOztBQUNELE1BQUlDLDJCQUEyQkksU0FBL0IsRUFBMEM7QUFDeENELGFBQVNHLHVCQUFULEdBQW1DTixzQkFBbkMsQ0FEd0MsQ0FDbUI7QUFDNUQ7O0FBQ0QsTUFBSUMscUJBQXFCRyxTQUF6QixFQUFvQztBQUNsQ0QsYUFBU0ksa0JBQVQsR0FBOEJOLGdCQUE5QjtBQUNEOztBQUNELFNBQU9FLFFBQVA7QUFDRDs7QUFFRCxNQUFNSyxLQUFNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQVo7QUFxQkEsTUFBTUMsS0FBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQVo7QUErQ0EsZUFBZTtBQUNiQyxRQUFNLFNBRE87QUFFYkYsSUFGYTtBQUdiQyxJQUhhO0FBSWJQO0FBSmEsQ0FBZiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuY29uc3QgSU5JVElBTF9TVEFURSA9IHtcbiAgb3V0bGluZUVuYWJsZWQ6IGZhbHNlLFxuICBvdXRsaW5lUmVuZGVyU2hhZG93bWFwOiBmYWxzZSxcbiAgb3V0bGluZVNoYWRvd21hcDogbnVsbFxufTtcblxuZnVuY3Rpb24gZ2V0VW5pZm9ybXMoe291dGxpbmVFbmFibGVkLCBvdXRsaW5lUmVuZGVyU2hhZG93bWFwLCBvdXRsaW5lU2hhZG93bWFwfSA9IElOSVRJQUxfU1RBVEUpIHtcbiAgY29uc3QgdW5pZm9ybXMgPSB7fTtcbiAgaWYgKG91dGxpbmVFbmFibGVkICE9PSB1bmRlZmluZWQpIHtcbiAgICB1bmlmb3Jtcy5vdXRsaW5lX3VFbmFibGVkID0gb3V0bGluZUVuYWJsZWQ7IC8vID8gMS4wIDogMC4wO1xuICB9XG4gIGlmIChvdXRsaW5lUmVuZGVyU2hhZG93bWFwICE9PSB1bmRlZmluZWQpIHtcbiAgICB1bmlmb3Jtcy5vdXRsaW5lX3VSZW5kZXJPdXRsaW5lcyA9IG91dGxpbmVSZW5kZXJTaGFkb3dtYXA7IC8vID8gMS4wIDogMC4wO1xuICB9XG4gIGlmIChvdXRsaW5lU2hhZG93bWFwICE9PSB1bmRlZmluZWQpIHtcbiAgICB1bmlmb3Jtcy5vdXRsaW5lX3VTaGFkb3dtYXAgPSBvdXRsaW5lU2hhZG93bWFwO1xuICB9XG4gIHJldHVybiB1bmlmb3Jtcztcbn1cblxuY29uc3QgdnMgPSBgXFxcbnZhcnlpbmcgZmxvYXQgb3V0bGluZV92ekxldmVsO1xudmFyeWluZyB2ZWM0IG91dGxpbmVfdlBvc2l0aW9uO1xuXG4vLyBTZXQgdGhlIHogbGV2ZWwgZm9yIHRoZSBvdXRsaW5lIHNoYWRvd21hcCByZW5kZXJpbmdcbnZvaWQgb3V0bGluZV9zZXRaTGV2ZWwoZmxvYXQgekxldmVsKSB7XG4gIG91dGxpbmVfdnpMZXZlbCA9IHpMZXZlbDtcbn1cblxuLy8gU3RvcmUgYW4gYWRqdXN0ZWQgcG9zaXRpb24gZm9yIHRleHR1cmUyRFByb2pcbnZvaWQgb3V0bGluZV9zZXRVVih2ZWM0IHBvc2l0aW9uKSB7XG4gIC8vIG1hdDQoXG4gIC8vICAgMC41LCAwLjAsIDAuMCwgMC4wLFxuICAvLyAgIDAuMCwgMC41LCAwLjAsIDAuMCxcbiAgLy8gICAwLjAsIDAuMCwgMC41LCAwLjAsXG4gIC8vICAgMC41LCAwLjUsIDAuNSwgMS4wXG4gIC8vICkgKiBwb3NpdGlvbjtcbiAgb3V0bGluZV92UG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLnh5eiAqIDAuNSArIHBvc2l0aW9uLncgKiAwLjUsIHBvc2l0aW9uLncpO1xufVxuYDtcblxuY29uc3QgZnMgPSBgXFxcbnVuaWZvcm0gYm9vbCBvdXRsaW5lX3VFbmFibGVkO1xudW5pZm9ybSBib29sIG91dGxpbmVfdVJlbmRlck91dGxpbmVzO1xudW5pZm9ybSBzYW1wbGVyMkQgb3V0bGluZV91U2hhZG93bWFwO1xuXG52YXJ5aW5nIGZsb2F0IG91dGxpbmVfdnpMZXZlbDtcbi8vIHZhcnlpbmcgdmVjMiBvdXRsaW5lX3ZVVjtcbnZhcnlpbmcgdmVjNCBvdXRsaW5lX3ZQb3NpdGlvbjtcblxuY29uc3QgZmxvYXQgT1VUTElORV9aX0xFVkVMX0VSUk9SID0gMC4wMTtcblxuLy8gUmV0dXJuIGEgZGFya2VyIGNvbG9yIGluIHNoYWRvd21hcFxudmVjNCBvdXRsaW5lX2ZpbHRlclNoYWRvd0NvbG9yKHZlYzQgY29sb3IpIHtcbiAgcmV0dXJuIHZlYzQob3V0bGluZV92ekxldmVsIC8gMjU1Liwgb3V0bGluZV92ekxldmVsIC8gMjU1Liwgb3V0bGluZV92ekxldmVsIC8gMjU1LiwgMS4pO1xufVxuXG4vLyBSZXR1cm4gYSBkYXJrZXIgY29sb3IgaWYgaW4gc2hhZG93bWFwXG52ZWM0IG91dGxpbmVfZmlsdGVyRGFya2VuQ29sb3IodmVjNCBjb2xvcikge1xuICBpZiAob3V0bGluZV91RW5hYmxlZCkge1xuICAgIGZsb2F0IG1heFpMZXZlbDtcbiAgICBpZiAob3V0bGluZV92UG9zaXRpb24ucSA+IDAuMCkge1xuICAgICAgbWF4WkxldmVsID0gdGV4dHVyZTJEUHJvaihvdXRsaW5lX3VTaGFkb3dtYXAsIG91dGxpbmVfdlBvc2l0aW9uKS5yICogMjU1LjtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlzY2FyZDtcbiAgICB9XG4gICAgaWYgKG1heFpMZXZlbCA8IG91dGxpbmVfdnpMZXZlbCArIE9VVExJTkVfWl9MRVZFTF9FUlJPUikge1xuICAgICAgdmVjNChjb2xvci5yZ2IgKiAwLjUsIGNvbG9yLmEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXNjYXJkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY29sb3I7XG59XG5cbi8vIGlmIGVuYWJsZWQgYW5kIHJlbmRlcmluZyBvdXRsaW5lcyAtIFJlbmRlciBkZXB0aCB0byBzaGFkb3dtYXBcbi8vIGlmIGVuYWJsZWQgYW5kIHJlbmRlcmluZyBjb2xvcnMgLSBSZXR1cm4gYSBkYXJrZXIgY29sb3IgaWYgaW4gc2hhZG93bWFwXG4vLyBpZiBkaXNhYmxlZCwganVzdCByZXR1cm4gY29sb3JcbnZlYzQgb3V0bGluZV9maWx0ZXJDb2xvcih2ZWM0IGNvbG9yKSB7XG4gIGlmIChvdXRsaW5lX3VFbmFibGVkKSB7XG4gICAgcmV0dXJuIG91dGxpbmVfdVJlbmRlck91dGxpbmVzID9cbiAgICAgIG91dGxpbmVfZmlsdGVyU2hhZG93Q29sb3IoY29sb3IpIDpcbiAgICAgIG91dGxpbmVfZmlsdGVyRGFya2VuQ29sb3IoY29sb3IpO1xuICB9XG4gIHJldHVybiBjb2xvcjtcbn1cbmA7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ291dGxpbmUnLFxuICB2cyxcbiAgZnMsXG4gIGdldFVuaWZvcm1zXG59O1xuIl19