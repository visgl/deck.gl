import test from 'tape-catch';
import {getPropTypes, isFunctionProp} from '@deck.gl/json/helpers/deck-prop-types';

import {ScatterplotLayer} from '@deck.gl/layers';

test('json#getPropTypes', t => {
  const propTypes = getPropTypes(ScatterplotLayer);
  t.ok(propTypes, 'Got prop types from deck.gl ScatterplotLayer');
  t.ok(isFunctionProp(propTypes, 'getFillColor'), 'ScatterplotLayer.getFillColor is a function');
  t.notOk(isFunctionProp(propTypes, 'sizeScale'), 'ScatterplotLayer.sizeScale is not function');
  t.end();
});
