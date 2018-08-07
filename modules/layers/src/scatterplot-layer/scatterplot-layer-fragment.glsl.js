// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default `\
#define SHADER_NAME scatterplot-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

varying vec4 vColor;
varying vec4 bColor;

varying vec2 unitPosition;
varying float innerUnitRadius;

uniform float stroke;
uniform float outline;
uniform float strokeWidth;

//Calculation of transition color
vec4 blendRGBColor(vec4 c1, vec4 c2, float p) {
  float R = c1[0]*255.0,
    G = c1[1]*255.0,
    B = c1[2]*255.0,
    A = c1[3]*255.0;
  return vec4((c2[0] * 255.0 - R) * p + R, (c2[1] * 255.0 - G) * p + G, (c2[2] * 255.0 - B) * p + B, A)/255.;
}

void main(void) { 

  //Smooth index
  float shaderOffset = 0.04; 

  float distToCenter = length(unitPosition);

  //Border width(stroke)
  float borderWidth = (1.0 - innerUnitRadius);

  //Use border
  if(stroke == 1.0) {
    
    //Draw the fill color
    if (distToCenter < innerUnitRadius) {

      //There is a transitional color between the fill color and the border color.
      //This can make the lines more smooth

      if(distToCenter >= innerUnitRadius - shaderOffset) { 
        float alpha = smoothstep(innerUnitRadius - shaderOffset, innerUnitRadius, distToCenter); 
        gl_FragColor = blendRGBColor(vColor, bColor, alpha); 
      } else { 
        gl_FragColor = vColor;
      }  

    } else { 

      //Draw border color
      //There is a transitional color between the border color and the outside color.
      //Transition colors reduce the transparency of border color to varying degrees.

      float alpha = 1.0, 
            delta = shaderOffset; 
      alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, distToCenter);

      gl_FragColor = vec4(bColor.rgb, bColor.a * alpha);

    }  
  } else {

    //Do not use a border
    if (distToCenter > 1.0 || distToCenter < innerUnitRadius) {
      discard;
    }
    
    gl_FragColor = vColor;

  }

  // use highlight color if this fragment belongs to the selected object.  
  // use picking color if rendering to picking FBO.  
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;