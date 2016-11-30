```
import React, {Component} from 'react';
import DeckGL from 'deck.gl/react';
import {ExtrudedChoroplethLayer64} from 'deck.gl';
import TripsLayer from './trips-layer';
import TWEEN from 'tween.js';

export default class HeroDemo extends Component {

  constructor(props) {
    super(props);

    const thisDemo = this;

    this.state = {
      time: 0
    };
    this.tween = new TWEEN.Tween({time: 0})
      .to({time: 3600}, 120000)
      .onUpdate(function() { thisDemo.setState(this) })
      .repeat(Infinity);
  }

  componentDidMount() {
    const thisDemo = this;
    this.tween.start();
  }

  componentWillUnmount() {
    this.tween.stop();
  }

  render() {
    const {viewport, tripsData, buildingData} = this.props;

    if (!data) {
      return null;
    }
    const layers = [
      tripsData && new TripsLayer({
        id: 'trips',
        data: tripsData,
        getPath: d => d.segments,
        getColor: d => d.vendor === 0 ? [253,128,93] : [23,184,190],
        opacity: 0.3,
        strokeWidth: 2,
        trailLength: 180,
        currentTime: this.state.time
      }),
      buildingData && new ExtrudedChoroplethLayer64({
        id: 'building',
        data: buildingData,
        color: [74, 80, 87],
        opacity: 0.5
      })
    ].filter(Boolean);

    return (
      <DeckGL {...viewport} layers={ layers } />
    );
  }
}

```

trips-layer.js:

```
import {Layer, assembleShaders} from 'deck.gl';
import {Model, Program, Geometry, glGetDebugInfo} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

export default class TripsLayer extends Layer {
  /**
   * @classdesc
   * LineLayer
   *
   * @class
   * @param {object} opts
   */
  constructor(opts) {
    super(opts);
  }

  updateState({props, oldProps, changeFlags: {dataChanged, somethingChanged}}) {
    const {attributeManager} = this.state;
    if (dataChanged) {
      this.countVertices(props.data);
    }
    if (somethingChanged) {
      this.updateUniforms();
    }
  }

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    const model = this.getModel(gl);

    attributeManager.addDynamic({
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      colors: {size: 3, update: this.calculateColors}
    });

    gl.getExtension('OES_element_index_uint');
    this.setState({model});
    gl.lineWidth(this.props.strokeWidth);

    this.countVertices();
    this.updateUniforms();
  }

  getModel(gl) {
    return new Model({
      program: new Program(gl, assembleShaders(gl, {
        vs: readFileSync(join(__dirname, './trips-layer-vertex.glsl')),
        fs: readFileSync(join(__dirname, './trips-layer-fragment.glsl'))
      })),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: 'LINES'
      }),
      vertexCount: 0,
      isIndexed: true,
      onBeforeRender: () => {
        gl.enable(gl.BLEND);
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(2.0, 1.0);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);
      },
      onAfterRender: () => {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.POLYGON_OFFSET_FILL);
      }
    });
  }

  countVertices(data) {
    if (!data) {
      return;
    }

    const {getPath} = this.props;
    let vertexCount = 0;
    const pathLengths = data.reduce((acc, d) => {
      const l = getPath(d).length;
      vertexCount += l;
      return [...acc, l];
    }, []);
    this.setState({pathLengths, vertexCount});
  }

  updateUniforms() {
    const {opacity, trailLength, currentTime} = this.props;
    this.setUniforms({
      opacity,
      trailLength,
      currentTime
    });
  }

  calculateIndices(attribute) {
    const {pathLengths, vertexCount} = this.state;

    const indicesCount = (vertexCount - pathLengths.length) * 2;
    const indices = new Uint32Array(indicesCount);

    let offset = 0;
    let index = 0;
    for (let i = 0; i < pathLengths.length; i++) {
      const l = pathLengths[i];
      indices[index++] = offset;
      for (let j = 1; j < l - 1; j++) {
        indices[index++] = j + offset;
        indices[index++] = j + offset;
      }
      indices[index++] = offset + l - 1;
      offset += l;
    }
    attribute.value = indices;
    this.state.model.setVertexCount(indicesCount);
  }

  calculatePositions(attribute) {
    const {data, getPath} = this.props;
    const {vertexCount} = this.state;
    const positions = new Float32Array(vertexCount * 3);

    let index = 0;
    for (let i = 0; i < data.length; i++) {
      const path = getPath(data[i]);
      for (let j = 0; j < path.length; j++) {
        const pt = path[j];
        positions[index++] = pt[0];
        positions[index++] = pt[1];
        positions[index++] = pt[2];
      }
    }
    attribute.value = positions;
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {pathLengths, vertexCount} = this.state;
    const colors = new Float32Array(vertexCount * 3);

    let index = 0;
    for (let i = 0; i < data.length; i++) {
      const color = getColor(data[i]);
      const l = pathLengths[i];
      for (let j = 0; j < l; j++) {
        colors[index++] = color[0];
        colors[index++] = color[1];
        colors[index++] = color[2];
      }
    }
    attribute.value = colors;
  }

}

```

trips-layer-vertex.glsl:

```
#define SHADER_NAME trips-layer-vertex-shader

attribute vec3 positions;
attribute vec3 colors;

uniform float opacity;
uniform float currentTime;
uniform float trailLength;

varying float vTime;
varying vec4 vColor;

void main(void) {
  vec2 p = preproject(positions.xy);
  gl_Position = project(vec4(p, 1., 1.));

  vColor = vec4(colors / 255.0, opacity);
  vTime = 1.0 - (currentTime - positions.z) / trailLength;
}
```

trips-layer-fragment.glsl:

```
#define SHADER_NAME trips-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

varying float vTime;
varying vec4 vColor;

void main(void) {
  if (vTime > 1.0 || vTime < 0.0) {
    discard;
  }
  gl_FragColor = vec4(vColor.rgb, vColor.a * vTime);
}
```
