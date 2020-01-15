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
/* global document, FontFace */
import test from 'tape';
import {TEST_CASES, WIDTH, HEIGHT} from './test-cases';
import {SnapshotTestRunner} from '@deck.gl/test-utils';

import './jupyter-widget';

function loadFont(name, url) {
  // pass the url to the file in CSS url() notation
  const font = new FontFace(name, `url(${url})`);
  // add it to the document's FontFaceSet
  document.fonts.add(font);
  // returns a Promise
  return font.load();
}

test('Render Test', t => {
  // tape's default timeout is 500ms
  t.timeoutAfter(TEST_CASES.length * 2000);

  const testRunner = new SnapshotTestRunner({width: WIDTH, height: HEIGHT}).add(TEST_CASES);

  // CI does not come with the same default fonts as local dev environment
  loadFont('Roboto', 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2')
    .then(() =>
      testRunner.run({
        onTestStart: testCase => t.comment(testCase.name),
        onTestPass: (testCase, result) => t.pass(`match: ${result.matchPercentage}`),
        onTestFail: (testCase, result) =>
          t.fail(result.error || `match: ${result.matchPercentage}`),

        imageDiffOptions: {
          threshold: 0.99,
          includeEmpty: false
          // uncomment to save screenshot to disk
          // , saveOnFail: true
          // uncomment `saveAs` to overwrite current golden images
          // if left commented will be saved as `[name]-fail.png.` enabling comparison
          // , saveAs: '[name].png'
        }
      })
    )
    .then(() => t.end());
});
