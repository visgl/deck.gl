/* global setTimeout */
import test from 'tape-promise/tape';
import {device} from '@deck.gl/test-utils';
import ResourceManager from '@deck.gl/core/lib/resource/resource-manager';

test('ResourceManager#protocol', t => {
  let dataManager = new ResourceManager({device, onError: t.notOk});
  t.ok(dataManager.contains('resource://data-01'), 'checks protocol');
  t.notOk(dataManager.contains('deck://data-01'), 'checks protocol');

  dataManager = new ResourceManager({device, protocol: 'deck://', onError: t.notOk});
  t.notOk(dataManager.contains('resource://data-01'), 'checks protocol');
  t.ok(dataManager.contains('deck://data-01'), 'checks protocol');

  t.end();
});

test('ResourceManager#add,remove', t => {
  const dataManager = new ResourceManager({device, onError: t.notOk});

  t.notOk(dataManager.contains('data-01'), 'does not contain resource');

  let value = [{x: 0, y: 0}];
  dataManager.add({resourceId: 'data-01', data: value});
  t.ok(dataManager.contains('data-01'), 'resource is added');
  t.is(dataManager._resources['data-01'].getData(), value);

  value = [{x: 1, y: 1}];
  dataManager.add({resourceId: 'data-01', data: value});
  t.ok(dataManager.contains('data-01'), 'resource is added');
  t.is(dataManager._resources['data-01'].getData(), value, 'resource is updated');

  dataManager.remove('data-01');
  t.notOk(dataManager.contains('data-01'), 'resource is removed');

  t.doesNotThrow(() => dataManager.remove('data-02'), 'remove non-existent resource');

  dataManager.finalize();
  t.end();
});

// eslint-disable-next-line
test('ResourceManager#subscribe, unsubscribe', t => {
  const dataManager = new ResourceManager({device, onError: t.notOk});
  let propA1Changed = 0;
  let propA2Changed = 0;
  let propBChanged = 0;

  t.doesNotThrow(
    () => dataManager.unsubscribe({consumerId: 'Layer2'}),
    'unsubscribe non-existent consumer'
  );

  t.is(
    dataManager.subscribe({
      resourceId: 'data-01',
      onChange: () => propA1Changed++,
      consumerId: 'Layer1',
      requestId: 'propA1'
    }),
    undefined,
    'subscribing non-existent non-protocol resource'
  );
  t.is(
    dataManager.subscribe({
      resourceId: 'resource://data-01',
      onChange: () => propA1Changed++,
      consumerId: 'Layer1',
      requestId: 'propA1'
    }),
    null,
    'subscribing non-existent protocol resource'
  );
  t.ok(
    propA1Changed === 0 && propA2Changed === 0 && propBChanged === 0,
    'callback has not been called'
  );

  const data1 = [{x: 0, y: 0}];
  let data2 = ['a', 'b', 'c'];
  dataManager.add({resourceId: 'data-01', data: data1, persistent: false});
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});

  t.is(
    dataManager.subscribe({
      resourceId: 'resource://data-01',
      onChange: () => propA2Changed++,
      consumerId: 'Layer2',
      requestId: 'propA2'
    }),
    data1
  );
  t.is(
    dataManager.subscribe({
      resourceId: 'resource://data-02',
      onChange: () => propBChanged++,
      consumerId: 'Layer2',
      requestId: 'propB'
    }),
    data2
  );

  t.ok(
    propA1Changed === 1 && propA2Changed === 0 && propBChanged === 0,
    'Layer1 callback is called'
  );

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false});
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});

  t.ok(propA1Changed === 1 && propA2Changed === 0 && propBChanged === 0, 'data did not change');

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  t.ok(propA1Changed === 2 && propA2Changed === 1 && propBChanged === 0, 'data-01 changed');

  data2 = ['a', 'b'];
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});
  t.ok(propA1Changed === 2 && propA2Changed === 1 && propBChanged === 1, 'data-02 changed');

  t.is(
    dataManager.subscribe({
      resourceId: 'resource://data-01',
      onChange: () => propBChanged++,
      consumerId: 'Layer2',
      requestId: 'propB'
    }),
    data1
  );
  data2 = ['a'];
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});
  t.ok(
    propA1Changed === 2 && propA2Changed === 1 && propBChanged === 1,
    'data-02 no longer listened to'
  );

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  t.ok(propA1Changed === 3 && propA2Changed === 2 && propBChanged === 2, 'data-01 changed');

  t.is(
    dataManager.subscribe({
      resourceId: 'http://data.json',
      onChange: () => propBChanged++,
      consumerId: 'Layer2',
      requestId: 'propB'
    }),
    undefined
  );
  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  t.ok(propA1Changed === 4 && propA2Changed === 3 && propBChanged === 2, 'data-01 changed');

  dataManager.unsubscribe({consumerId: 'Layer2'});

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  t.ok(
    propA1Changed === 5 && propA2Changed === 3 && propBChanged === 2,
    'Layer2 callbacks are no longer called'
  );

  data2 = ['a'];
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});
  t.ok(
    propA1Changed === 5 && propA2Changed === 3 && propBChanged === 2,
    'Layer2 callbacks are no longer called'
  );

  dataManager.unsubscribe({consumerId: 'Layer1'});
  setTimeout(() => {
    t.notOk(dataManager.contains('data-01'), 'non-persistent resource is pruned');
    t.ok(dataManager.contains('data-02'), 'persistent resource is not pruned');

    dataManager.finalize();
    t.end();
  }, 100);
});
