#!/usr/bin/env node
// Script to bootstrap repo for development

// Enables ES2015 import/export in Node.js
require('reify');

const moduleAlias = require('module-alias');
const config = require('ocular-dev-tools/config/ocular.config')({
  aliasMode: 'src',
  root: resolve(__dirname, '..')
});
moduleAlias.addAliases(config.aliases);

genTypesForLayers(require('../modules/layers/src'));
genTypesForLayers(require('../modules/experimental-layers/src'));

function genTypesForLayers(layers) {
  for (const layerName in layers) {
    const Layer = layers[layerName];
    if (Layer && typeof Layer !== 'boolean' && Layer.layerName) {
      genTypesForLayer(Layer);
    }
  }
}

function genTypesForLayer(Layer) {
  // Creating a layer initializes the prop types
  const layer = new Layer({});

  console.log(`types ${Layer.layerName} {`);
  for (const propName of Object.keys(Layer._propTypes)) {
    const propType = Layer._propTypes[propName];
    if (typeof propType === 'object') {
      console.log(`  ${propName}: ${propType.type}`);
    } else {
      console.log(`  ${propName}: any;`);
    }
  }
  console.log(`}\n`);
}
