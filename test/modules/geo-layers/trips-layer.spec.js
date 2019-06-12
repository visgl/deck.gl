import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {TripsLayer} from '@deck.gl/geo-layers';
import {trips} from 'deck.gl-test/data';

test('TripsLayer', t => {
  const testCases = generateLayerTests({
    Layer: TripsLayer,
    sampleProps: {
      data: trips,
      getPath: d => d.map(p => p.begin_shape),
      getTimestamps: d => d.map(p => p.begin_time)
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer}) => {
      if (layer.props.getTimestamps) {
        t.notOk(
          layer.getAttributeManager().getAttributes().instanceTimestamps.constant,
          'instanceTimestamps populated'
        );
        t.ok(layer.state.model.program.uniforms.isPath3D, 'uniform isPath3D set');
      } else {
        t.ok(
          layer.getAttributeManager().getAttributes().instanceTimestamps.constant,
          'instanceTimestamps ignored'
        );
        t.notOk(layer.state.model.program.uniforms.isPath3D, 'uniform isPath3D not set');
      }
    }
  });

  testLayer({Layer: TripsLayer, testCases, onError: t.notOk});

  t.end();
});
