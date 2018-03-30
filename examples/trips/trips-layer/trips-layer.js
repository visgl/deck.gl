import {Layer, experimental} from 'deck.gl';
import {GL, Model, Geometry, registerShaderModules} from 'luma.gl';
import project32 from './project32/project32';

const {fp64LowPart, enable64bitSupport} = experimental;
registerShaderModules([project32]);

import tripsVertex from './trips-layer-vertex.glsl';
import tripsFragment from './trips-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
  trailLength: 120,
  currentTime: 0,
  strokeWidth: 1,
  fp64: false,

  getSourcePosition: x => x.sourcePosition,
  getTargetPosition: x => x.targetPosition,
  getTime: x => x.time,
  getColor: x => x.color || DEFAULT_COLOR
};

export default class TripsLayer extends Layer {
  getShaders() {
    const projectModule = enable64bitSupport(this.props) ? 'project64' : 'project32';
    return {vs: tripsVertex, fs: tripsFragment, modules: [projectModule, 'picking']};
  }
    
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        transition: true,
        accessor: 'getSourcePosition',
        update: this.calculateInstanceSourcePositions
      },
      instanceTargetPositions: {
        size: 3,
        transition: true,
        accessor: 'getTargetPosition',
        update: this.calculateInstanceTargetPositions
      },
      instanceSourceTargetPositions64xyLow: {
        size: 4,
        accessor: ['getSourcePosition', 'getTargetPosition'],
        update: this.calculateInstanceSourceTargetPositions64xyLow
      },
      instanceColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: true,
        accessor: 'getColor',
        update: this.calculateInstanceColors
      },
      instanceTime: {
        size: 1,
        transition: true,
        accessor: 'getTime',
				update: this.calculateInstanceTime,
			},
    });

    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
      this.state.attributeManager.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {trailLength, currentTime, strokeWidth} = this.props;
    this.state.model.render(
      Object.assign({}, uniforms, {
        trailLength,
        currentTime,
        strokeWidth
      })
    );
  }

  _getModel(gl) {
	const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_STRIP,
          attributes: {
            positions: new Float32Array(positions)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache,
      })
    );
  }

  calculateInstanceSourcePositions(attribute) {
    const {data, getSourcePosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const sourcePosition = getSourcePosition(object);
      value[i + 0] = sourcePosition[0];
      value[i + 1] = sourcePosition[1];
      value[i + 2] = isNaN(sourcePosition[2]) ? 0.0 : sourcePosition[2];
      i += size;
    })
  }

  calculateInstanceTargetPositions(attribute) {
    const {data, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const targetPosition = getTargetPosition(object);
      value[i + 0] = targetPosition[0];
      value[i + 1] = targetPosition[1];
      value[i + 2] = isNaN(targetPosition[2]) ? 0.0 : targetPosition[2];
      i += size;
    })
  }

  calculateInstanceSourceTargetPositions64xyLow(attribute) {
    const isFP64 = enable64bitSupport(this.props);
    attribute.isGeneric = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(4);
      return;
    }

    const {data, getSourcePosition, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const sourcePosition = getSourcePosition(object);
      const targetPosition = getTargetPosition(object);
      value[i + 0] = fp64LowPart(sourcePosition[0]);
      value[i + 1] = fp64LowPart(sourcePosition[1]);
      value[i + 2] = fp64LowPart(targetPosition[0]);
      value[i + 3] = fp64LowPart(targetPosition[1]);
      i += size;
    })
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const color = getColor(object);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = isNaN(color[3]) ? 255 : color[3];
      i += size;
    })
  }

  calculateInstanceTime(attribute) {
    const {data, getTime} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const time = getTime(object);
      value[i] = time;
      i += size;
    })
  }
}

TripsLayer.layerName = 'TripsLayer';
TripsLayer.defaultProps = defaultProps;
