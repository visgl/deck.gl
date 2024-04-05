import {ArcLayer, ArcLayerProps} from '@deck.gl/layers';
import {Accessor, DefaultProps} from '@deck.gl/core';

export type AnimatedArcLayerProps<DataT = any> = _AnimatedArcLayerProps<DataT> & ArcLayerProps<DataT>;

type _AnimatedArcLayerProps<DataT = any> = {
  getSourceTimestamp?: Accessor<DataT, number>;
  getTargetTimestamp?: Accessor<DataT, number>;
  timeRange?: [number, number];
};

const defaultProps: DefaultProps<_AnimatedArcLayerProps> = {
  getSourceTimestamp: {type: 'accessor', value: 0},
  getTargetTimestamp: {type: 'accessor', value: 1},
  timeRange: {type: 'array', compare: true, value: [0, 1]}
};

export default class AnimatedArcLayer<DataT = any, ExtraProps = {}> extends ArcLayer<DataT, ExtraProps & Required<_AnimatedArcLayerProps>> {
  layerName = 'AnimatedArcLayer';
  defaultProps = defaultProps;

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `\
uniform vec2 timeRange;
in float instanceSourceTimestamp;
in float instanceTargetTimestamp;
out float vTimestamp;
`,
      'vs:#main-end': `\
vTimestamp = mix(instanceSourceTimestamp, instanceTargetTimestamp, segmentRatio);
`,
      'fs:#decl': `\
uniform vec2 timeRange;
in float vTimestamp;
`,
      'fs:#main-start': `\
if (vTimestamp < timeRange.x || vTimestamp > timeRange.y) {
  discard;
}
`,
      'fs:DECKGL_FILTER_COLOR': `\
color.a *= (vTimestamp - timeRange.x) / (timeRange.y - timeRange.x);
`
    };
    return shaders;
  }

  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      instanceSourceTimestamp: {
        size: 1,
        accessor: 'getSourceTimestamp'
      },
      instanceTargetTimestamp: {
        size: 1,
        accessor: 'getTargetTimestamp'
      }
    });
  }

  draw(params) {
    params.uniforms = {
      ...params.uniforms,
      timeRange: this.props.timeRange
    };
    super.draw(params);
  }
}
