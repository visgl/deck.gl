// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
