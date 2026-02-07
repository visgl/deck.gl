// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {fetchMap} from '@deck.gl/carto';
import {test, expect} from 'vitest';

test('fetchMap#export', async () => {
  expect(fetchMap, 'fetchMap exists').toBeTruthy();
});
