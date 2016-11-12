/* eslint-disable dot-notation, max-statements, no-unused-vars */
import AttributeManager from '../../lib/attribute-manager';
import test from 'tape-catch';

function update(attribute, {data}) {
  const {value, size} = attribute;
  let i = 0;
  for (const object of data) {
    for (let n = 0; n < size; ++n) {
      value[i + n] = i + n;
    }
    i += size;
  }
}

const fixture = {
  positions: new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0])
};

test('Core#AttributeManager constructor', t => {
  const attributeManager = new AttributeManager();

  t.ok(attributeManager, 'AttributeManager construction successful');
  t.end();
});

test('Core#AttributeManager.add', t => {
  const attributeManager = new AttributeManager();

  t.throws(
    () => attributeManager.add({positions: {update}}),
    'AttributeManager.add - throws on missing attribute size'
  );

  t.throws(
    () => attributeManager.add({positions: {size: 2}}),
    'AttributeManager.add - throws on missing attribute update'
  );

  attributeManager.add({positions: {size: 2, update}});
  t.ok(attributeManager.getAttributes()['positions'],
    'AttributeManager.add - add attribute successful');
  t.end();
});

test('Core#AttributeManager.update', t => {
  const attributeManager = new AttributeManager();
  attributeManager.add({positions: {size: 2, update}});

  let attribute;

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');
  t.equals(attribute.value[1], 1, 'attribute value is correct');

  // Second update without invalidation, should not update
  attribute.value[1] = 2;

  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');
  t.equals(attribute.value[1], 2,
    'Second update, attribute value was not changed');

  // Third update, with invalidation, should update
  attributeManager.invalidateAll();
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');
  t.equals(attribute.value[1], 1,
    'Third update, attribute value was updated');

  t.end();
});

test('Core#AttributeManager.update - 0 numInstances', t => {
  const attributeManager = new AttributeManager();
  attributeManager.add({positions: {size: 2, update}});

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 0,
    data: []
  });

  const attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');

  t.end();
});
