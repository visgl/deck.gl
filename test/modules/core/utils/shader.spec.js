import test from 'tape-catch';
import {project, phongLighting} from '@deck.gl/core';
import {mergeShaders} from '@deck.gl/core/utils/shader';

const TEST_SHADERS = {vs: 'vs', fs: 'fs'};

const TEST_CASES = [
  {
    title: 'empty',
    input: null,
    output: {vs: 'vs', fs: 'fs'}
  },
  {
    title: 'missing target fields',
    input: {
      defines: {DRAW: 1},
      modules: [project],
      inject: {'fs#main-start': 'discard;'}
    },
    output: {
      vs: 'vs',
      fs: 'fs',
      defines: {DRAW: 1},
      modules: [project],
      inject: {'fs#main-start': 'discard;'}
    }
  },
  {
    title: 'deep merge source and target fields',
    input: {
      vs: 'vs-v2',
      defines: {DRAW: 0, EXTRUDE: 1},
      modules: [phongLighting],
      inject: {'fs#main-end': 'filter_pickingColor(gl_FragColor);'}
    },
    output: {
      vs: 'vs-v2',
      fs: 'fs',
      defines: {DRAW: 0, EXTRUDE: 1},
      modules: [project, phongLighting],
      inject: {'fs#main-start': 'discard;', 'fs#main-end': 'filter_pickingColor(gl_FragColor);'}
    }
  }
];

test('mergeShaders', t => {
  let shaders = TEST_SHADERS;

  for (const testCase of TEST_CASES) {
    shaders = mergeShaders(shaders, testCase.input);
    t.deepEqual(shaders, testCase.output, `${testCase.title} returned correct result`);
  }

  t.end();
});
