import {ArcLayer} from '@deck.gl/layers';

export default class AnimatedArcLayer extends ArcLayer {
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
      // Shape trail into teardrop
      'fs:DECKGL_FILTER_COLOR': `\
float f = (vTimestamp - timeRange.x) / (timeRange.y - timeRange.x);
color.a *= pow(f, 5.0);
float cap = 10.0 * (f - 0.9);
float w = pow(f, 4.0) - smoothstep(0.89, 0.91, f) * pow(cap, 4.0);
color.a *= smoothstep(1.1 * w, w, abs(geometry.uv.y));
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
    params.uniforms = Object.assign({}, params.uniforms, {
      timeRange: this.props.timeRange
    });
    super.draw(params);
  }
}

AnimatedArcLayer.layerName = 'AnimatedArcLayer';
AnimatedArcLayer.defaultProps = {
  getSourceTimestamp: {type: 'accessor', value: 0},
  getTargetTimestamp: {type: 'accessor', value: 1},
  timeRange: {type: 'array', compare: true, value: [0, 1]}
};
