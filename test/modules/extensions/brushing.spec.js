import test from 'tape-catch';
import {BrushingExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test('BrushingExtension', t => {
  const testCases = [
    {
      props: {
        data: [
          {position: [-122.453, 37.782], timestamp: 120, entry: 13567, exit: 4802},
          {position: [-122.454, 37.781], timestamp: 140, entry: 14475, exit: 5493}
        ],
        getPosition: d => d.position,
        getBrushingTarget: d => d.position,

        extensions: [new BrushingExtension()]
      },
      onAfterUpdate: ({layer}) => {
        const {uniforms} = layer.state.model.program;
        t.ok(uniforms.brushing_radius, 'has correct uniforms');
        t.is(uniforms.brushing_enabled, false, 'has correct uniforms');
        t.is(uniforms.brushing_target, 0, 'has correct uniforms');
        t.is(uniforms.brushing_mousePos[0], 0, 'has correct uniforms');
      }
    },
    {
      updateProps: {
        brushingEnabled: true,
        brushingTarget: 'custom',
        brushingRadius: 5e6
      },
      onBeforeUpdate: ({layer}) => {
        // Simulate user interaction
        layer.context.mousePosition = {x: 1, y: 1};
      },
      onAfterUpdate: ({layer}) => {
        const {uniforms} = layer.state.model.program;
        t.is(uniforms.brushing_radius, 5e6, 'has correct uniforms');
        t.is(uniforms.brushing_enabled, true, 'has correct uniforms');
        t.is(uniforms.brushing_target, 2, 'has correct uniforms');
        t.not(uniforms.brushing_mousePos[0], 0, 'has correct uniforms');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
