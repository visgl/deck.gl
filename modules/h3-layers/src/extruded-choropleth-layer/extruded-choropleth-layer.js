import {Layer} from 'deck.gl';
import {GL, Model, Geometry} from 'luma.gl';

import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';
import normalize from 'geojson-normalize';
import extrudePolyline from 'extrude-polyline';

import FS from './extruded-choropleth-layer-fs.glsl';
import VS from './extruded-choropleth-layer-vs.glsl';

/**
 * @param {object} props
 * @param {bool} props.drawContour - ? drawContour : drawArea
 * @param {function} props.onChoroplethHovered - provide properties of the
 * selected choropleth, together with the mouse event when mouse hovered
 * @param {function} props.onChoroplethClicked - provide properties of the
 * selected choropleth, together with the mouse event when mouse clicked
 */
const defaultProps = {
  id: 'extruded-choropleth-layer',
  drawContour: true,
  opacity: 1,
  strokeColor: [0, 0, 0],
  fillColor: [128, 128, 128],
  strokeWidth: 3,
  elevation: 0,
  getColor: {type: 'accessor', value: x => x.color}
};

export default class ExtrudedChoroplethLayer extends Layer {
  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    attributeManager.add({
      // Primitive attributes
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      colors: {size: 3, update: this.calculateColors},
      // Instanced attributes
      pickingColors: {size: 3, update: this.calculatePickingColors, noAlloc: true}
    });

    const IndexType = gl.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array;

    this.setState({
      numInstances: 0,
      model: this.getModel(gl),
      IndexType
    });
  }

  updateState({props, oldProps, changeFlags: {dataChanged}}) {
    const {attributeManager, model} = this.state;
    if (dataChanged || oldProps.strokeWidth !== props.strokeWidth) {
      this.extractChoropleths();
      attributeManager.invalidateAll();
    }

    if (oldProps.opacity !== props.opacity) {
      model.setUniforms({opacity: props.opacity});
    }
  }

  getShaders() {
    // use customized shaders
    return {
      fs: FS,
      vs: VS,
      modules: ['picking']
    };
  }

  getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES
        }),
        vertexCount: 0,
        isIndexed: true,
        shaderCache: this.context.shaderCache
      })
    );
  }

  calculatePositions(attribute) {
    const {elevation} = this.props;
    const positions = this.props.drawContour
      ? flattenDeep(this.state.meshes.map(mesh => mesh.positions.map(pos => [...pos, elevation])))
      : flattenDeep(this.state.groupedVertices);

    attribute.value = new Float32Array(positions);
  }

  calculateIndices(attribute) {
    // adjust index offset for multiple choropleths
    const {meshes, groupedVertices, IndexType, model} = this.state;
    const {drawContour} = this.props;
    const offsets = drawContour
      ? meshes.reduce((acc, mesh) => [...acc, acc[acc.length - 1] + mesh.positions.length], [0])
      : groupedVertices.reduce((acc, vertices) => [...acc, acc[acc.length - 1] + vertices.length], [
          0
        ]);

    const indices = drawContour
      ? meshes.map((mesh, choroplethIndex) =>
          mesh.cells.map(cell => cell.map(index => index + offsets[choroplethIndex]))
        )
      : groupedVertices.map((vertices, choroplethIndex) =>
          earcut(flattenDeep(vertices), null, 3).map(index => index + offsets[choroplethIndex])
        );

    attribute.value = new IndexType(flattenDeep(indices));
    attribute.target = GL.ELEMENT_ARRAY_BUFFER;

    model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculateColors(attribute) {
    const {strokeColor, fillColor, getColor} = this.props;
    let vColor;
    const colors = this.props.drawContour
      ? this.state.meshes.map((mesh, i) => {
          vColor = getColor ? getColor(this.state.choropleths[i]) : strokeColor;
          return mesh.positions.map(p => vColor);
        })
      : this.state.groupedVertices.map((vertices, i) => {
          vColor = getColor ? getColor(this.state.choropleths[i]) : fillColor;
          return vertices.map(vertex => vColor);
        });

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const colors = this.props.drawContour
      ? this.state.meshes.map((mesh, i) => mesh.positions.map(pos => [-1, -1, -1]))
      : this.state.groupedVertices.map((vertices, choroplethIndex) =>
          vertices.map(vertex => [
            (choroplethIndex + 1) % 256,
            Math.floor((choroplethIndex + 1) / 256) % 256,
            Math.floor((choroplethIndex + 1) / 256 / 256) % 256
          ])
        );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  extractChoropleths() {
    const {data} = this.props;
    const normalizedGeojson = normalize(data);

    this.state.choropleths = normalizedGeojson.features.map(choropleth => {
      let coordinates = choropleth.geometry.coordinates[0] || [];
      // flatten nested polygons
      if (coordinates.length === 1 && coordinates[0].length > 2) {
        coordinates = coordinates[0];
      }
      return {
        properties: choropleth.properties,
        coordinates
      };
    });

    if (this.props.drawContour) {
      const stroke = extrudePolyline({
        thickness: 0.0001 * this.props.strokeWidth,
        cap: 'butt',
        join: 'bevel',
        miterLimit: 0.005
      });

      this.state.meshes = this.state.choropleths.map(choropleth =>
        stroke.build(choropleth.coordinates.map(coordinate => [coordinate[0], coordinate[1]]))
      );
    } else {
      this.state.groupedVertices = this.state.choropleths.map(choropleth =>
        choropleth.coordinates.map(coordinate => [coordinate[0], coordinate[1], 100])
      );
    }
  }

  onHover(info) {
    const {index} = info;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onHover(Object.assign({}, info, {feature}));
  }

  onClick(info) {
    const {index} = info;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onClick(Object.assign({}, info, {feature}));
  }
}

ExtrudedChoroplethLayer.defaultProps = defaultProps;
ExtrudedChoroplethLayer.layerName = 'ExtrudedChoroplethLayer';
