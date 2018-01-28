import {GL, Model, Geometry} from 'luma.gl';

const ATTRIBUTE_MAPPING = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

function getShaders(transitions) {
  // Build shaders
  const varyings = [];
  const attributeDeclarations = [];
  const uniformsDeclarations = [];
  const varyingDeclarations = [];
  const calculations = [];

  for (const attributeName in transitions) {
    const transition = transitions[attributeName];
    const attributeType = ATTRIBUTE_MAPPING[transition.attribute.size];

    if (attributeType) {
      transition.bufferIndex = varyings.length;
      varyings.push(attributeName);

      attributeDeclarations.push(`attribute ${attributeType} ${attributeName}From;`);
      attributeDeclarations.push(`attribute ${attributeType} ${attributeName}To;`);
      uniformsDeclarations.push(`uniform float ${attributeName}Time;`);
      varyingDeclarations.push(`varying ${attributeType} ${attributeName};`);
      calculations.push(`${attributeName} = mix(${attributeName}From, ${attributeName}To,
        ${attributeName}Time);`);
    }
  }

  const vs = `
#define SHADER_NAME feedback-vertex-shader
${attributeDeclarations.join('\n')}
${uniformsDeclarations.join('\n')}
${varyingDeclarations.join('\n')}

void main(void) {
  ${calculations.join('\n')}
  gl_Position = vec4(0.0);
}
`;

  const fs = `\
#define SHADER_NAME feedback-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

${varyingDeclarations.join('\n')}

void main(void) {
  gl_FragColor = vec4(0.0);
}
`;
  return {vs, fs, varyings};
}

export default class AttributeTransitionModel extends Model {
  constructor(gl, {id, transitions}) {
    super(
      gl,
      Object.assign(
        {
          id,
          geometry: new Geometry({
            id,
            drawMode: GL.POINTS
          }),
          vertexCount: 0,
          isIndexed: true
        },
        getShaders(transitions)
      )
    );

    this.setTransitions(transitions);
  }

  // Update attributes and vertex count
  setTransitions(transitions) {
    for (const attributeName in transitions) {
      const {fromState, toState, attribute} = transitions[attributeName];

      this.setAttributes({
        [`${attributeName}From`]: fromState,
        [`${attributeName}To`]: toState
      });

      this.setVertexCount(attribute.value.length / attribute.size);
    }
  }
}
