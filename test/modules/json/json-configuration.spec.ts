// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

import {JSONConfiguration} from '@deck.gl/json';
import configuration from './json-configuration-for-deck';

test('JSONConfiguration#import', () => {
  expect(JSONConfiguration, 'JSONConfiguration imported').toBeTruthy();
});

test('JSONConfiguration#create', () => {
  const jsonConverter = new JSONConfiguration({configuration});
  expect(jsonConverter, 'JSONConfiguration created').toBeTruthy();
});
