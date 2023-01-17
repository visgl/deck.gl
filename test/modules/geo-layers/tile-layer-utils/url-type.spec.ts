// deck.gl, MIT license

import test from 'tape-promise/tape';
import {urlType} from '@deck.gl/geo-layers/tile-layer/url-type';

test('urlType', t => {
  t.ok(urlType.validate('https://server.com/{z}/{x}/{y}.png', urlType), 'string is validated');
  t.ok(
    urlType.validate(['https://server.com/{z}/{x}/{y}.png'], urlType),
    'array of string is validated'
  );
  t.notOk(urlType.validate(urlType.value, urlType), 'unspecified value is not valid');
  t.ok(
    urlType.validate(urlType.value, {...urlType, optional: true}),
    'unspecified value is valid if optional:true'
  );
  t.notOk(urlType.validate(['https://server.com/{z}/{x}/{y}.png', null], urlType), 'is not valid');

  t.ok(urlType.equals('', ''), 'should be equal');
  t.ok(
    urlType.equals('https://server.com/{z}/{x}/{y}.png', 'https://server.com/{z}/{x}/{y}.png'),
    'should be equal'
  );
  t.ok(
    urlType.equals(['https://server.com/{z}/{x}/{y}.png'], ['https://server.com/{z}/{x}/{y}.png']),
    'should be equal'
  );
  t.notOk(
    urlType.equals('https://server.com/{z}/{x}/{y}.png', [
      'https://server.com/ep1/{z}/{x}/{y}.png',
      'https://server.com/ep2/{z}/{x}/{y}.png'
    ]),
    'should not be equal'
  );
  t.notOk(
    urlType.equals(
      ['https://server.com/{z}/{x}/{y}.png'],
      ['https://server.com/ep1/{z}/{x}/{y}.png', 'https://server.com/ep2/{z}/{x}/{y}.png']
    ),
    'should not be equal'
  );
  t.notOk(
    urlType.equals(
      [
        'https://anotherserver.com/ep1/{z}/{x}/{y}.png',
        'https://anotherserver.com/ep2/{z}/{x}/{y}.png'
      ],
      ['https://server.com/ep1/{z}/{x}/{y}.png', 'https://server.com/ep2/{z}/{x}/{y}.png']
    ),
    'should not be equal'
  );

  t.end();
});
