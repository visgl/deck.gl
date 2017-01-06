import replace from 'rollup-plugin-replace';
import ignore from 'rollup-plugin-ignore';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import serve from 'rollup-plugin-serve';

// TODO - These fail because rollup doesn't understand babel transpiled "export *"
const DECKGL_EXPORTS = [
  'ArcLayer',
  'ChoroplethLayer',
  'LineLayer',
  'ScatterplotLayer',
  'ScreenGridLayer',
  'ArcLayer64',
  'ChoroplethLayer64',
  'LineLayer64',
  'ScatterplotLayer64',
  'ExtrudedChoroplethLayer64',
  'EnhancedChoroplethLayer'
];

export default {
  entry: 'app.js',
  format: 'iife',
  moduleName: 'deckgl-rollup-example',
  plugins: [
    builtins(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': JSON.stringify({})
    }),
    ignore(['canvas', 'aws-sign2', 'webgl-debug']),
    nodeResolve({
      preferBuiltins: false
    }),
    json(),
    buble({
      exclude: 'node_modules/**',
      objectAssign: 'Object.assign',
      transforms: {dangerousForOf: true}
    }),
    commonJs({
      namedExports: {
        react: ['Children', 'Component', 'PropTypes', 'createElement'],
        'react-dom': ['render'],
        'deck.gl/experimental': ['ReflectionEffect'],
        'deck.gl': DECKGL_EXPORTS
      }
    }),
    globals(),
    serve({
      open: true,
      contentBase: './'
    })
  ]
};
