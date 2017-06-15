import test from 'tape-catch';

import {window} from 'deck.gl/lib/utils/globals';
import {setOverride, getOverrides, logPayload} from 'deck.gl/debug/seer-integration';

test('Seer overrides', t => {

  const props = {
    id: 'arc-layer',
    opacity: {data: {value: 0.4}},
    one: 1
  };

  setOverride('arc-layer', ['opacity', 'data', 'value'], 0.5);
  getOverrides(props);
  t.equal(props.opacity.data.value, 0.4, 'The value should not have been overriden');

  window.__SEER_INITIALIZED__ = true;

  setOverride('arc-layer', ['opacity', 'data', 'value'], 0.5);
  getOverrides(props);
  t.equal(props.opacity.data.value, 0.5, 'The value should now have been changed');

  t.end();

});

test('Seer log', t => {

  const layer = {
    props: {
      opacity: 0.2,
      strokeWidth: 1,
      data: [{sourcePosition: [-122, 37]}]
    },
    state: {
      attributeManager: {
        getAttributes: () => ({
          instancePickingColors: {
            size: 3,
            update: () => {},
            value: new Uint32Array([1, 2, 3])
          }
        })
      }
    }
  };

  const data = logPayload(layer);

  t.equal(data.length, 2, 'There should be two updates');

  const [props, attributes] = data;
  t.deepEqual(props.data, layer.props, 'The props should have been passed');
  t.false(attributes.data.instancePickingColors.update, 'The function should have been trimmed');

  const {value} = attributes.data.instancePickingColors;
  const type = Object.prototype.toString.call(value).slice(8, -1);

  t.equal(type, 'Array', 'The typed array should have been converted');

  t.end();

});
