import {setRequestURLLimit, getRequestURLLimit} from '@deck.gl/carto';
import test from 'tape-catch';

test('request URL limit', async t => {
  const defaultLimit = getRequestURLLimit();
  setRequestURLLimit(9999);

  t.true(Number.isInteger(defaultLimit), 'integer default url limit');
  t.true(defaultLimit > 0, 'positive default url limit');
  t.equal(getRequestURLLimit(), 9999, 'custom url limit');
  t.end();
});
