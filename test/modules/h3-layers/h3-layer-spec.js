// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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
/* eslint-disable func-style, no-console, max-len */
import test from 'tape-catch';
import {testLayer} from '@deck.gl/test-utils';

import {H3HexagonLayer, H3OutlineLayer, H3RingLayer} from '@deck.gl/h3-layers';

// import * as TEST_DATA from 'deck.gl/test/data';

test('H3HexagonLayer#constructor', t => {
  // const data = TEST_DATA.points;

  testLayer({
    Layer: H3HexagonLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
        // },
        // {
        //   props: {
        //     data,
        //     getPosition: getPointPosition,
        //     gpuAggregation: false
        //   }
      }
    ]
  });

  t.end();
});

test('H3OutlineLayer#constructor', t => {
  // const data = TEST_DATA.points;

  testLayer({
    Layer: H3OutlineLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      }
      // {
      //   props: {
      //     data,
      //     radiusScale: 5,
      //     getPosition: getPointPosition
      //   }
      // }
      // {
      //   updateProps: {
      //     radiusScale: 10
      //   },
      //   assert({layer, oldState}) {
      //     t.ok(layer.state, 'should update layer state');
      //     t.ok(layer.state.model.program.uniforms.radiusScale === 10, 'should update radiusScale');
      //   }
      // }
    ]
  });

  t.end();
});

test('H3RingLayer#constructor', t => {
  testLayer({
    Layer: H3RingLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      }
      // {
      //   props: {
      //     data,
      //     getSourcePosition: d => d.START,
      //     getTargetPosition: d => d.END
      //   }
      // }
    ]
  });

  t.end();
});
