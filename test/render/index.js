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
import test from 'tape';
import TEST_CASES from './test-cases';
import {WIDTH, HEIGHT} from './constants';
import {SnapshotTestRunner} from '@deck.gl/test-utils';

import './jupyter-widget';

test('Render Test', t => {
  // tape's default timeout is 500ms
  t.timeoutAfter(TEST_CASES.length * 2000 + 10000);

  new SnapshotTestRunner({width: WIDTH, height: HEIGHT})
    .add(TEST_CASES)
    .run({
      onTestStart: testCase => t.comment(testCase.name),
      onTestPass: (testCase, result) => t.pass(`match: ${result.matchPercentage}`),
      onTestFail: (testCase, result) => t.fail(result.error || `match: ${result.matchPercentage}`),

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
    .then(() => t.end());
});
