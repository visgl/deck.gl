import test from 'tape-promise/tape';
import {createBinaryProxy, getWorkerUrl, scaleIdentity} from '@deck.gl/carto/utils';

test('createBinaryProxy', async t => {
  const binary = {
    numericProps: {temperature: {value: new Float32Array([18, 19, 20, 21]), size: 1}},
    properties: [{name: 'name0'}, {name: 'name1'}, {name: 'name2'}, {name: 'name3'}]
  };
  const proxy = createBinaryProxy(binary, 2);
  t.ok('name' in proxy, 'Proxy contains name key');
  t.ok('temperature' in proxy, 'Proxy contains temperature key');
  t.ok(!('missing' in proxy), 'Proxy missing key');
  t.equal(proxy.temperature, 20, 'Proxy has correct temperature value');
  t.equal(proxy.name, 'name2', 'Proxy has correct name value');
  t.end();
});

test('getWorkerUrl', async t => {
  t.equal(
    getWorkerUrl('cartoTest', '1.2.3'),
    'https://unpkg.com/@deck.gl/carto@1.2.3/dist/cartoTest-worker.js'
  );
  t.end();
});

test('scaleIdentity', async t => {
  const scale = scaleIdentity();

  // scale
  t.equal(scale(null), undefined, 'scale(null)');
  t.equal(scale(undefined), undefined, 'scale(undefined)');
  t.equal(scale(123), 123, 'scale(123)');
  t.equal(scale(Infinity), Infinity, 'scale(Infinity)');
  t.true(isNaN(scale(NaN)), 'scale(NaN)');

  // invert
  t.equal(scale.invert, scale, 'scale.invert === scale');

  // domain and range
  t.equal(scale.domain(1), 1, 'domain');
  t.equal(scale.range(1), 1, 'range');

  // unknown
  scale.unknown(-1);
  t.equal(scale(null), -1, 'scale(null) (unknown = -1)');
  t.equal(scale(123), 123, 'scale(123) (unknown = -1)');

  // copy
  const scaleCopy = scale.copy();
  scaleCopy.unknown(-2);
  t.equal(scaleCopy(123), 123, 'scaleCopy(123)');
  t.equal(scaleCopy(null), -2, 'copies set "unknown"');
  t.equal(scale(null), -1, 'copies do not affect "unknown" for original');

  t.end();
});
