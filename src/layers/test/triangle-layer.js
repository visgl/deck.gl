/* eslint-disable max-statements, no-var */
/* eslint-disable array-bracket-spacing, no-multi-spaces */

import Layer from '../layer';
import {Program, PerspectiveCamera, Model, Geometry, Mat4} from 'luma.gl';

const VERTEX_SHADER = `
attribute vec3 positions;
attribute vec4 colors;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(positions, 1.0);
  vColor = colors;
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}
`;

export default class TestLayer extends Layer {

  /*
   * @classdesc
   * TestLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius
   */
  constructor({
    rTri = 0.0,
    rSquare = 0.0,
    ...props
  }) {
    super({
      rTri,
      rSquare,
      ...props
    });
  }

  initializeState() {
    const {gl} = this.state;

    this.setState({
      model: this.getModel(gl)
    });
  }

  didMount() {
    this.updateUniforms();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);
    this.updateUniforms();
  }

  getModel(gl) {
    var triangleGeometry = new Geometry({
      positions: new Float32Array([
        0,   1, 0,
        -1, -1, 0,
        1,  -1, 0
      ]),
      colors: {
        value: new Float32Array([
          1, 0, 0, 1,
          0, 1, 0, 1,
          0, 0, 1, 1
        ]),
        size: 4
      }
    });

    var program = new Program(gl, {
      vs: VERTEX_SHADER,
      fs: FRAGMENT_SHADER
    });

    var triangle = new Model({
      geometry: triangleGeometry,
      program
    });

    return triangle;
  }

  updateUniforms() {
    var camera = new PerspectiveCamera({
      aspect: this.props.width / this.props.height
    });

    const {model} = this.state;

    // get new view matrix out of element and camera matrices
    var view = new Mat4();
    view.mulMat42(camera.view, model.matrix);

    this.setUniforms({
      uMVMatrix: view,
      uPMatrix: camera.projection
    });
  }
}

/*
export function app() {

  function animate() {
    rTri += 0.01;
    rSquare += 0.1;
  }

  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw triangle
    triangle
      .setPosition(new Vec3(-1.5, 0, -7))
      .setRotation(new Vec3(0, rTri, 0))
      .updateMatrix();
    setupModel(triangle);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Draw Square
    square
      .setPosition(new Vec3(1.5, 0, -7))
      .setRotation(new Vec3(rSquare, 0, 0))
      .updateMatrix();
    setupModel(square);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function tick() {
    drawScene();
    animate();
    Fx.requestAnimationFrame(tick);
  }

  tick();
};
*/
