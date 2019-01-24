import {Layer} from 'deck.gl';
import {GL, Model, Geometry} from 'luma.gl';
import assert from 'assert';

import enhancedHexagonFragment from './enhanced-hexagon-layer-fs.glsl';
import enhancedHexagonVertex from './enhanced-hexagon-layer-vs.glsl';

function positionsAreEqual(v1, v2) {
  // Hex positions are expected to change entirely, not to maintain some
  // positions and change others. Right now we only check a single vertex,
  // because H3 guarantees order, but even if that wasn't true, this would only
  // return a false positive for adjacent hexagons, which is close enough for
  // our purposes.
  return v1 === v2 || (v1 && v2 && v1[0][0] === v2[0][0] && v1[0][1] === v2[0][1]);
}

const defaultProps = {
  id: 'enhanced-hexagon-layer',
  radius: 1,
  angle: 0,
  hexagonVertices: null,
  hexagonCenter: null,
  invisibleColor: {r: 0, g: 0, b: 0},
  dotRadius: 10, // hexagon radius multiplier
  elevation: 0, // hexagon height
  getCentroid: {type: 'accessor', value: x => x.centroid},
  getColor: {type: 'accessor', value: x => x.color},
  getAlpha: {type: 'accessor', value: x => 255},
  getElevation: {type: 'accessor', value: x => x.elevation},
  getVertices: {type: 'accessor', value: x => x.positions}
};

/* EnhancedHexagonLayer is a variation of the deck.gl HexagonLayer
 * that supports some extra features like invisibleColor, lighting etc
 * and allows faster iteration
 *
 * TODO - investigate if it makes sense to derive this layer
 * from HexagonLayer (would need to override base layer's Model).
 */
export default class EnhancedHexagonLayer extends Layer {
  initializeState() {
    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceColors: {size: 4, update: this.calculateInstanceColors}
    });

    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});
  }

  updateState({props, oldProps, changeFlags: {dataChanged}} = {}) {
    const {model, attributeManager} = this.state;

    if (dataChanged) {
      attributeManager.invalidateAll();
    }

    // Update the positions in the model if they've changes
    assert(props.hexagonVertices, 'hexagonVertices must be supplied');
    const verticesChanged = !positionsAreEqual(oldProps.hexagonVertices, props.hexagonVertices);
    if (model && verticesChanged) {
      this.updatePrimitiveHexagon();
    }

    this.updateUniforms();
  }

  updatePrimitiveHexagon() {
    const {model} = this.state;
    const geometry = model.getGeometry();
    geometry.setAttributes({positions: this.getPositions()});
    model.setGeometry(geometry);
  }

  updateUniforms() {
    const {elevation, invisibleColor} = this.props;
    const {model} = this.state;
    model.setUniforms({
      elevation,
      invisibleColor: [invisibleColor.r, invisibleColor.g, invisibleColor.b]
    });
  }

  getShaders() {
    // use customized shaders
    return {
      fs: enhancedHexagonFragment,
      vs: enhancedHexagonVertex,
      modules: ['picking']
    };
  }

  getModel(gl) {
    return new Model(gl, {
      ...this.getShaders(),
      id: 'enhanced-hexagon-layer',
      geometry: new Geometry({
        id: this.id,
        drawMode: GL.TRIANGLE_FAN,
        attributes: {
          positions: this.getPositions()
        }
      }),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    });
  }

  // Modify geometry to match hexagonVertices
  getPositions() {
    const {hexagonVertices: verts, hexagonCenter} = this.props;
    const NUM_SEGMENTS = 6;
    // Calculate the center if not provided
    const center = hexagonCenter || [
      (verts[0][0] + verts[3][0]) / 2,
      (verts[0][1] + verts[3][1]) / 2
    ];

    const positions = new Float32Array(3 * NUM_SEGMENTS);
    // Move the positions to the orgin and scale to a unit radius
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions[i * 3] = verts[i][1] - center[1];
      positions[i * 3 + 1] = verts[i][0] - center[0];
      positions[i * 3 + 2] = 0;
    }
    return positions;
  }

  calculateInstancePositions(attribute) {
    const {data, getCentroid, getElevation} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const [lat, lon] = getCentroid(object);
      const elevation = getElevation(object);
      value[i + 0] = lon;
      value[i + 1] = lat;
      value[i + 2] = elevation || this.props.elevation;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor, getAlpha} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getColor(object);
      value[i + 0] = color.r;
      value[i + 1] = color.g;
      value[i + 2] = color.b;
      value[i + 3] = getAlpha(object);
      i += size;
    }
  }
}

EnhancedHexagonLayer.defaultProps = defaultProps;
EnhancedHexagonLayer.layerName = 'EnhancedHexagonLayer';
