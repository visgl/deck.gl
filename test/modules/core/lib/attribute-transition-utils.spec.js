import test from 'tape-catch';
import Attribute from '@deck.gl/core/lib/attribute';
import {getShaders} from '@deck.gl/core/lib/attribute-transition-utils';
import {gl} from '@deck.gl/test-utils';

// function cleanShader(source) {
//   return source
//     .split(';')
//     .map(line => line.trim().replace(/\s+/g, ' '))
//     .join('\n');
// }

test('AttributeTransitionManager#getShaders', t => {
  let result = getShaders({
    attribute: new Attribute(gl, {
      id: 'instancePositions',
      size: 3,
      accessor: 'getPosition'
    })
  });
  t.deepEquals(result.defines, {ATTRIBUTE_TYPE: 'vec3'}, 'returns correct defines');

  result = getShaders({
    attribute: new Attribute(gl, {
      id: 'instanceSizes',
      size: 1,
      accessor: 'getSize'
    })
  });
  t.deepEquals(result.defines, {ATTRIBUTE_TYPE: 'float'}, 'returns correct defines');

  t.end();
});
