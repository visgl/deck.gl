import test from 'tape-catch';
import Attribute from '@deck.gl/core/lib/attribute';
import {getShaders} from '@deck.gl/core/lib/attribute-transition-utils';
import {gl} from '@deck.gl/test-utils';

function cleanShader(source) {
  return source
    .split(';')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .join('\n');
}

test('AttributeTransitionManager#getShaders', t => {
  const transitions = {
    instancePositions: {
      attribute: new Attribute(gl, {
        id: 'instancePositions',
        size: 3,
        accessor: 'getPosition'
      })
    },
    instanceSizes: {
      attribute: new Attribute(gl, {
        id: 'instanceSizes',
        size: 1,
        accessor: 'getSize'
      })
    }
  };

  const result = getShaders(transitions);

  t.is(
    cleanShader(result.vs),
    cleanShader(`
    #define SHADER_NAME feedback-vertex-shader
    attribute vec3 instancePositionsFrom;
    attribute vec3 instancePositionsTo;
    attribute float instanceSizesFrom;
    attribute float instanceSizesTo;
    uniform float instancePositionsTime;
    uniform float instanceSizesTime;
    varying vec3 instancePositions;
    varying float instanceSizes;

    void main(void) {
      instancePositions = mix(instancePositionsFrom, instancePositionsTo, instancePositionsTime);
    instanceSizes = mix(instanceSizesFrom, instanceSizesTo, instanceSizesTime);
      gl_Position = vec4(0.0);
    }
  `),
    'returns correct vertex shader'
  );

  t.is(
    cleanShader(result.fs),
    cleanShader(`
    #define SHADER_NAME feedback-fragment-shader
    precision highp float;

    varying vec3 instancePositions;
    varying float instanceSizes;

    void main(void) {
      gl_FragColor = vec4(0.0);
    }
  `),
    'returns correct fragment shader'
  );

  t.deepEquals(result.varyings, ['instancePositions', 'instanceSizes'], 'returns correct varyings');

  t.end();
});
