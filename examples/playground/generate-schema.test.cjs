const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema.generated.json'), 'utf8'));

test('numeric array props accept JSON arrays without native typed-array objects', () => {
  assert.equal(schema.definitions.NumericArray.type, 'array');
  assert.equal(schema.definitions.NumericArray.items.type, 'number');
  assert.ok(!Object.keys(schema.definitions).some(name => /Float16Array|^Loader</.test(name)));
});

test('generated layer schema retains accessors and loader options', () => {
  const scatterplot = schema.properties.layers.items.anyOf.find(
    layer => layer.properties['@@type'].const === 'ScatterplotLayer'
  );
  assert.ok(scatterplot.properties.loadOptions);
  assert.ok(scatterplot.properties.getPosition.anyOf.some(value => value.type === 'array'));
  assert.ok(scatterplot.properties.getPosition.anyOf.some(value => value.type === 'string'));
});

test('generated schema contains no dangling definition references', () => {
  function checkReferences(value) {
    if (!value || typeof value !== 'object') return;
    if (value.$ref?.startsWith('#/definitions/')) {
      const name = decodeURIComponent(value.$ref.slice('#/definitions/'.length));
      assert.ok(schema.definitions[name], `Missing definition: ${name}`);
    }
    for (const child of Object.values(value)) checkReferences(child);
  }
  checkReferences(schema);
});
