import test from 'tape-catch';
import {shouldComposeModelMatrix} from '@deck.gl/mesh-layers/utils/matrix';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

test('shouldComposeModelMatrix', t => {
  t.ok(
    shouldComposeModelMatrix({isGeospatial: false}, COORDINATE_SYSTEM.DEFAULT),
    'Should composeModelMatrix for cartesian.'
  );
  t.notOk(
    shouldComposeModelMatrix({isGeospatial: true}, COORDINATE_SYSTEM.DEFAULT),
    'Should not composeModelMatrix for lnglat.'
  );
  t.ok(
    shouldComposeModelMatrix({}, COORDINATE_SYSTEM.IDENTITY),
    'Should composeModelMatrix for identity.'
  );
  t.ok(
    shouldComposeModelMatrix({}, COORDINATE_SYSTEM.METER_OFFSETS),
    'Should composeModelMatrix for meter_offsets.'
  );
  t.notOk(
    shouldComposeModelMatrix({}, COORDINATE_SYSTEM.LNGLAT_OFFSETS),
    'Should not composeModelMatrix for lnglat_offsets.'
  );

  t.end();
});
