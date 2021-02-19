import test from 'tape-catch';
import {makeSpy} from '@probe.gl/test-utils';

import {log} from '@deck.gl/core';
import {createGoogleMapsDeckOverlay} from '@deck.gl/jupyter-widget/playground/utils/google-maps-utils';

test('jupyter-widget: Google Maps base', t => {
  makeSpy(log, 'warn');
  const overlay = createGoogleMapsDeckOverlay({props: {}});
  t.ok(log.warn.called, 'should produce a warning message if no Google Maps API key is provided');
  t.ok(!overlay, 'Absent Google Maps API key creates null overlay');
  log.warn.restore();
  t.end();
});
