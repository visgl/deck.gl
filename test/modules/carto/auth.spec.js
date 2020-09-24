import test from 'tape-catch';
import {getDefaultCredentials, setDefaultCredentials} from '@deck.gl/carto';

test('auth#getDefaultCredentials', t => {
  const credentials = getDefaultCredentials();

  t.notOk(credentials === null, 'default credentials available');
  t.end();
});

test('auth#getDefaultCredentials', t => {
  // partial (keeping other params)
  setDefaultCredentials({username: 'a-new-username'});
  let credentials = getDefaultCredentials();
  t.ok(credentials.username === 'a-new-username', 'user update');
  t.ok(credentials.apiKey === 'default_public', 'keep default apiKey');
  t.ok(
    credentials.serverUrlTemplate === 'https://{user}.carto.com',
    'keep default serverUrlTemplate'
  );

  // full
  setDefaultCredentials({
    username: 'a-new-username',
    apiKey: 'a-new-key',
    serverUrlTemplate: 'https://a-custom-{user}.carto.com'
  });

  credentials = getDefaultCredentials();

  t.ok(credentials.username === 'a-new-username', '');
  t.ok(credentials.apiKey === 'a-new-key');
  t.ok(credentials.serverUrlTemplate === 'https://a-custom-{user}.carto.com');
  t.end();
});
