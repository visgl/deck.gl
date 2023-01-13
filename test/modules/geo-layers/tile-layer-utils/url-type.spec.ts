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

test('getURLFromTemplate', t => {
  const TEST_TEMPLATE = 'https://server.com/{z}/{x}/{y}.png';
  const TEST_TEMPLATE2 = 'https://server.com/{z}/{x}/{y}/{x}-{y}-{z}.png';
  const TEST_TEMPLATE_ARRAY = [
    'https://server.com/ep1/{x}/{y}.png',
    'https://server.com/ep2/{x}/{y}.png'
  ];
  t.is(
    getURLFromTemplate(TEST_TEMPLATE, {index: {x: 1, y: 2, z: 0}}),
    'https://server.com/0/1/2.png',
    'single string template'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE2, {index: {x: 1, y: 2, z: 0}}),
    'https://server.com/0/1/2/1-2-0.png',
    'single string template with multiple occurance'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 1, y: 2, z: 0}, id: '1-2-0'}),
    'https://server.com/ep2/1/2.png',
    'array of templates'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 2, y: 2, z: 0}, id: '2-2-0'}),
    'https://server.com/ep1/2/2.png',
    'array of templates'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 17, y: 11, z: 5}, id: '17-11-5'}),
    'https://server.com/ep2/17/11.png',
    'array of templates'
  );
  t.is(getURLFromTemplate(null, {index: {x: 1, y: 2, z: 0}}), null, 'invalid template');
  t.is(getURLFromTemplate([], {index: {x: 1, y: 2, z: 0}}), null, 'empty array');
  t.end();
});
