/* global document */
import 
import {createGLContext, Texture2D, Transform, Buffer} from 'luma.gl';

import vertex from './delaunay-interpolation-vertex.glsl';

export default class DelaunayInterpolation {
  constructor(opts) {
    this.props = opts;
    this.context = opts.gl;
    if (!opts.gl) {
      const canvas = document.getElementById('texture-canvas') || document.createElement('canvas');
      canvas.id = 'texture-canvas';
      canvas.style.display = 'none';
      document.body.appendChild(canvas);
      this.context = createGLContext({canvas: 'texture-canvas', debug: false, webgl2: true});
    }
  }

  getTextureWidth() {
    return this.props.textureWidth || 256;
  }

  generateTextures() {
    const gl = this.context;
    const {bbox, measures, triangulation} = this.props;
    const {txt, bounds, textures, width, height} = this._generateTextures(
      gl,
      bbox,
      triangulation,
      measures
    );

    return {
      textureObject: txt,
      dataBounds: bounds,
      textureArray: textures,
      textureSize: {width, height}
    };
  }

  getDelaunayTransform(gl, triangulation, textureOptions) {
    const positions = [];
    triangulation.forEach(triangle =>
      positions.push(
        -triangle[0].long,
        triangle[0].lat,
        triangle[0].elv,
        -triangle[1].long,
        triangle[1].lat,
        triangle[1].elv,
        -triangle[2].long,
        triangle[2].lat,
        triangle[2].elv
      )
    );
    const _targetTexture = this.createTexture(gl, textureOptions);

    return new Transform(gl, {
      id: 'delaunay',
      vs: vertex,
      drawMode: gl.TRIANGLES,
      sourceBuffers: {
        positions: new Buffer(gl, new Float32Array(positions))
      },
      _targetTexture,
      _targetTextureVarying: 'vColor',
      elementCount: positions.length / 3
    });
  }

  createTexture(gl, options) {
    const data = Object.assign(
      {
        data: {
          internalFormat: gl.RGBA32F,
          format: gl.RGBA,
          value: false,
          type: gl.FLOAT,
          border: 0
        }
      },
      options.data
    );

    const texture = new Texture2D(gl, {
      format: data.internalFormat,
      dataFormat: data.format,
      type: data.type,
      border: data.border,
      width: data.width,
      height: data.height,
      parameters: {
        [gl.TEXTURE_MAG_FILTER]: gl.NEAREST,
        [gl.TEXTURE_MIN_FILTER]: gl.NEAREST,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
      },
      pixelStore: {
        [gl.UNPACK_FLIP_Y_WEBGL]: true,
        [gl.UNPACK_ALIGNMENT]: 1
      }
    });

    return texture;
  }

  _generateTextures(device: Device, bbox, triangulation, measures) {
    const lngDiff = Math.abs(bbox.maxLng - bbox.minLng);
    const latDiff = Math.abs(bbox.maxLat - bbox.minLat);
    const width = this.getTextureWidth();
    const height = Math.ceil((latDiff * width) / lngDiff);
    const bounds = [];
    const correctAngles = (angle1, angle2, angle3) => {
      // return [angle1, angle2, angle3];
      const abs = Math.abs.bind(Math);
      const modulo = 8;
      let flip = false;
      if (abs(angle1 - angle2) > abs(angle1 - (angle2 + modulo))) {
        flip = true;
      }
      if (abs(angle1 - angle3) > abs(angle1 - (angle3 + modulo))) {
        if (flip) {
          // need to flip angle1
          angle1 -= modulo;
        } else {
          // need to flip angle3
          angle3 += modulo;
        }
      } else if (flip) {
        // need to flip angle2
        angle2 += modulo;
      }
      return [angle1, angle2, angle3];
    };

    const textureOptions = {
      data: {
        internalFormat: gl.RGBA32F,
        format: gl.RGBA,
        value: false,
        type: gl.FLOAT,
        width,
        height,
        border: 0
      }
    };

    const delaunayTransform = this.getDelaunayTransform(gl, triangulation, textureOptions);

    const textures = measures.map((measure, hour) => {
      const sample = [];
      function processTriplet(triplet) {
        if (!bounds[0]) {
          bounds[0] = {min: measure[triplet[0].index][0], max: measure[triplet[0].index][0]};
          bounds[1] = {min: measure[triplet[0].index][1], max: measure[triplet[0].index][1]};
          bounds[2] = {min: measure[triplet[0].index][2], max: measure[triplet[0].index][2]};
        } else {
          [0, 1, 2].forEach(index => {
            // eslint-disable-next-line
            triplet.forEach(t => {
              if (measure[t.index][index] !== 0) {
                bounds[index].min =
                  bounds[index].min > measure[t.index][index]
                    ? measure[t.index][index]
                    : bounds[index].min;
                bounds[index].max =
                  bounds[index].max < measure[t.index][index]
                    ? measure[t.index][index]
                    : bounds[index].max;
              }
            });
          });
        }

        const [angle1, angle2, angle3] = correctAngles(
          measure[triplet[0].index][0],
          measure[triplet[1].index][0],
          measure[triplet[2].index][0]
        );

        sample.push(
          angle1,
          measure[triplet[0].index][1],
          measure[triplet[0].index][2],

          angle2,
          measure[triplet[1].index][1],
          measure[triplet[1].index][2],

          angle3,
          measure[triplet[2].index][1],
          measure[triplet[2].index][2]
        );
      }

      triangulation.forEach(processTriplet);

      delaunayTransform.update({
        sourceBuffers: {
          data: new Buffer(gl, new Float32Array(sample))
        }
      });
      delaunayTransform.run({
        uniforms: {
          bbox: [bbox.minLng, bbox.maxLng, bbox.minLat, bbox.maxLat],
          size: [width, height]
        }
      });
      const pixels = delaunayTransform.getData();
      return pixels;
    });

    return {bounds, textures, width, height};
  }
}
