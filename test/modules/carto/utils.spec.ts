import test from 'tape-promise/tape';
import {createBinaryProxy} from '@deck.gl/carto/utils';

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
