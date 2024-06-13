import test from 'tape-promise/tape';
import {injectAccessToken} from '@deck.gl/carto/layers/utils';

test('injectAccessToken', async t => {
  let loadOptions = {} as any;
  injectAccessToken(loadOptions, 'ACCESS-XXX');
  t.equal(loadOptions.fetch.headers.Authorization, 'Bearer ACCESS-XXX');

  loadOptions = {fetch: {headers: {Custom: 123}}};
  injectAccessToken(loadOptions, 'ACCESS-XXX');
  t.deepEqual(loadOptions.fetch.headers, {Authorization: 'Bearer ACCESS-XXX', Custom: 123});
  t.end();
});
