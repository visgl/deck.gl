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
/* eslint-disable func-style, no-console, max-len */
import test from 'tape-catch';
import {testLayer} from 'deck.gl-test-utils';

import {
  ScatterplotLayer,
  IconLayer,
  ArcLayer,
  LineLayer,
  ScreenGridLayer,
  PointCloudLayer,
  PathLayer
} from 'deck.gl';

import * as FIXTURES from 'deck.gl/test/data';

const getPointPosition = d => d.COORDINATES;

test('ScreenGridLayer#constructor', t => {
  const data = FIXTURES.points;

  testLayer({
    Layer: ScreenGridLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        props: {
          data,
          getPosition: getPointPosition
        }
      },
      {
        updateProps: {
          cellSizePixels: 10
        },
        assert({layer, oldState}) {
          t.ok(layer.state !== oldState, 'should update layer state');
          t.ok(layer.state.cellScale !== oldState.cellScale, 'should update cellScale');
          t.ok(
            layer.state.cellScale === layer.state.model.uniforms.cellScale,
            'should update uniform cellScale'
          );
        }
      }
    ]
  });

  t.end();
});

test('ScatterplotLayer#constructor', t => {
  const data = FIXTURES.points;

  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        props: {
          data,
          radiusScale: 5,
          getPosition: getPointPosition
        }
      },
      {
        updateProps: {
          radiusScale: 10
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.radiusScale === 10, 'should update radiusScale');
        }
      },
      {
        updateProps: {
          fp64: true
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(
            layer.getAttributeManager().attributes.instancePositions64xyLow,
            'should add instancePositions64xyLow'
          );
        }
      }
    ]
  });

  t.end();
});

test('ArcLayer#constructor', t => {
  const data = FIXTURES.routes;

  testLayer({
    Layer: ArcLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        props: {
          data,
          getSourcePosition: d => d.START,
          getTargetPosition: d => d.END
        }
      },
      {
        updateProps: {
          strokeWidth: 10
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.strokeWidth === 10, 'should update strokeWidth');
        }
      }
    ]
  });

  t.end();
});

test('PointCloudLayer#constructor', t => {
  const data = FIXTURES.getPointCloud();

  testLayer({
    Layer: PointCloudLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        props: {
          data
        }
      },
      {
        updateProps: {
          radiusPixels: 10
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.radiusPixels === 10, 'should update strokeWidth');
        }
      }
    ]
  });

  t.end();
});

test('LineLayer#constructor', t => {
  const data = FIXTURES.routes;

  testLayer({
    Layer: LineLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        props: {
          data,
          getSourcePosition: d => d.START,
          getTargetPosition: d => d.END
        }
      },
      {
        updateProps: {
          strokeWidth: 10
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.strokeWidth === 10, 'should update strokeWidth');
        }
      },
      {
        updateProps: {
          fp64: true
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(
            layer.getAttributeManager().attributes.instanceSourceTargetPositions64xyLow,
            'should add instancePositions64xyLow'
          );
        }
      }
    ]
  });

  t.end();
});

test('IconLayer#constructor', t => {
  const data = FIXTURES.points;

  testLayer({
    Layer: IconLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        props: {
          data,
          sizeScale: 24,
          getPosition: getPointPosition
        }
      },
      {
        updateProps: {
          sizeScale: 10
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
        }
      },
      {
        updateProps: {
          fp64: true
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(
            layer.getAttributeManager().attributes.instancePositions64xyLow,
            'should add instancePositions64xyLow'
          );
        }
      }
    ]
  });

  t.end();
});

test('PathLayer#constructor', t => {
  const data = FIXTURES.zigzag;

  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        props: {
          data
        }
      },
      {
        updateProps: {
          widthMinPixels: 10
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.widthMinPixels === 10, 'should update strokeWidth');
        }
        // }, {
        //   updateProps: {
        //     fp64: true
        //   },
        //   assert({layer, oldState}) {
        //     t.ok(layer.state, 'should update layer state');
        //     t.ok(layer.getAttributeManager().attributes.instanceStartEndPositions64xyLow,
        //       'should add instancePositions64xyLow');
        //   }
      }
    ]
  });

  t.end();
});
