// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Enables ES2015 import/export in Node.js

// TODO: move to test-utils lib

const console = require('console');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

function printResult(diffRatio, threshold) {
  return diffRatio <= threshold
    ? console.log('\x1b[32m%s\x1b[0m', 'Rendering test Passed!')
    : console.log('\x1b[31m%s\x1b[0m', 'Rendering test failed!');
}

function compareImage(newImageName, goldenImageName, threshold) {
  const newImageData = fs.readFileSync(newImageName);
  const goldenImageData = fs.readFileSync(goldenImageName);
  const newImage = PNG.sync.read(newImageData);
  const goldenImage = PNG.sync.read(goldenImageData);
  const diffImage = new PNG({width: goldenImage.width, height: goldenImage.height});
  const pixelDiffSize = pixelmatch(
    goldenImage.data,
    newImage.data,
    diffImage.data,
    goldenImage.width,
    goldenImage.height,
    {threshold: 0.105, includeAA: true}
  );

  const pixelDiffRatio = pixelDiffSize / (goldenImage.width * goldenImage.height);
  console.log(`Testing ${newImageName}`);
  console.log(`Mismatched pixel number: ${pixelDiffSize}`);
  console.log(`Mismatched pixel ratio: ${pixelDiffRatio}`);

  const diffImageData = PNG.sync.write(diffImage, {colorType: 6});
  const diffImageName = `${newImageName.split('.')[0]}_diff.png`;
  fs.writeFileSync(diffImageName, diffImageData);

  fs.unlinkSync(newImageName);
  fs.unlinkSync(diffImageName);
  printResult(pixelDiffRatio, threshold);
  return pixelDiffRatio <= threshold;
}

module.exports = compareImage;
