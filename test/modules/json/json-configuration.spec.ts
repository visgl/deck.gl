// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {JSONConfiguration} from '@deck.gl/json';
import {JSON_CONFIGURATION} from './json-configuration-for-deck';

test('JSONConfiguration#import', t => {
  t.ok(JSONConfiguration, 'JSONConfiguration imported');
  t.end();
});

test('JSONConfiguration#create', t => {
  const jsonConverter = new JSONConfiguration({configuration: JSON_CONFIGURATION});
  t.ok(jsonConverter, 'JSONConfiguration created');
  t.end();
});
