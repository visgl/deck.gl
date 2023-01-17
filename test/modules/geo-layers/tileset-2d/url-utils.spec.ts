// deck.gl, MIT license

import test from 'tape-promise/tape';
import {getURLFromTemplate} from '@deck.gl/geo-layers/tileset-2d';

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
