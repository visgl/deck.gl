"use strict";module.export({getFloatTexture:()=>getFloatTexture,getFramebuffer:()=>getFramebuffer,getFloatArray:()=>getFloatArray,updateBuffer:()=>updateBuffer});var GL;module.link('@luma.gl/constants',{default(v){GL=v}},0);var Buffer,Framebuffer,Texture2D;module.link('@luma.gl/core',{Buffer(v){Buffer=v},Framebuffer(v){Framebuffer=v},Texture2D(v){Texture2D=v}},1);// Helper methods used by GPUGridAggregator.



function getFloatTexture(gl, opts) {
  const {width = 1, height = 1} = opts;
  const texture = new Texture2D(gl, {
    data: null,
    format: GL.RGBA32F,
    type: GL.FLOAT,
    border: 0,
    mipmaps: false,
    parameters: {
      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST
    },
    dataFormat: GL.RGBA,
    width,
    height
  });
  return texture;
}

function getFramebuffer(gl, opts) {
  const {id, width = 1, height = 1} = opts;
  const texture = opts.texture || getFloatTexture(gl, opts);
  const fb = new Framebuffer(gl, {
    id,
    width,
    height,
    attachments: {
      [GL.COLOR_ATTACHMENT0]: texture
    }
  });

  return fb;
}

function getFloatArray(array, size, fillValue = 0) {
  if (!array || array.length < size) {
    return new Float32Array(size).fill(fillValue);
  }
  return array;
}

function updateBuffer({gl, bufferName, data, result}) {
  if (result[bufferName]) {
    result[bufferName].subData({data});
  } else {
    result[bufferName] = new Buffer(gl, data);
  }
}
