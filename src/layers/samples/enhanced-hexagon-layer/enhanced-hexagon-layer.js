import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {Geometry, Program, Model} from 'luma.gl';

import assert from 'assert';

import VERTEX_SHADER from './enhanced-hexagon-layer-vertex';
import FRAGMENT_SHADER from './enhanced-hexagon-layer-fragment';

function positionsAreEqual(v1, v2) {
  // Hex positions are expected to change entirely, not to maintain some
  // positions and change others. Right now we only check a single vertex,
  // This would only return a false positive for adjacent hexagons,
  // which is close enough for our purposes.
  return v1 === v2 || (
    v1 && v2 && v1[0][0] === v2[0][0] && v1[0][1] === v2[0][1]
  );
}

export default class EnhancedHexagonLayer extends Layer {
  /**
   * @classdesc
   * EnhancedHexagonLayer is a variation of the deck.gl HexagonLayer
   * that supports some extra features like invisibleColor, lighting etc
   * and allows faster iteration
   *
   * TODO - investigate if it makes sense to derive this layer
   * from HexagonLayer (would need to override base layer's Model).
   *
   * @class
   * @param {object} props
   * @param {number} props.dotRadius - hexagon radius multiplier
   * @param {number} props.elevation - hexagon height
   */
  constructor({
    radius = 1,
    angle = 0,
    hexagonVertices,
    hexagonCenter = null,
    invisibleColor = {r: 0, g: 0, b: 0},
    getCentroid = x => x.centroid,
    getColor = x => x.color,
    getAlpha = x => 255,
    getElevation = x => x.elevation,
    getVertices = x => x.positions,
    dotRadius = 10,
    elevation = 0,
    ...props
  } = {}) {
    assert(hexagonVertices, 'hexagonVertices must be supplied');
    super({
      radius,
      angle,
      hexagonVertices,
      hexagonCenter,
      dotRadius,
      elevation,
      invisibleColor,
      getCentroid,
      getColor,
      getAlpha,
      getElevation,
      getVertices,
      ...props
    });
  }

  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.add({
      instancePositions: {size: 3, instanced: 1,
        0: 'lon', 1: 'lat', 2: 'unused'},
      instanceColors: {size: 4, instanced: 1,
        0: 'red', 1: 'green', 2: 'blue', 3: 'alpha'}
    }, {
      instancePositions: {update: this.calculateInstancePositions},
      instanceColors: {update: this.calculateInstanceColors}
    });

    this.updateUniforms();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {model, dataChanged, attributeManager} = this.state;

    if (dataChanged) {
      attributeManager.invalidateAll();
    }

    // Update the positions in the model if they've changes
    if (
      model &&
      !positionsAreEqual(oldProps.hexagonVertices, newProps.hexagonVertices)
    ) {
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
    this.setUniforms({
      elevation,
      invisibleColor: [invisibleColor.r, invisibleColor.g, invisibleColor.b]
    });
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

  getModel(gl) {
    return new Model({
      id: this.props.id,
      program: new Program(gl, assembleShaders(gl, {
        vs: VERTEX_SHADER,
        fs: FRAGMENT_SHADER
      })),
      geometry: new Geometry({
        drawMode: 'TRIANGLE_FAN',
        positions: this.getPositions()
      }),
      isInstanced: true
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
      positions[i * 3] = (verts[i][1] - center[1]);
      positions[i * 3 + 1] = (verts[i][0] - center[0]);
      positions[i * 3 + 2] = 0;
    }
    return positions;
  }
}
