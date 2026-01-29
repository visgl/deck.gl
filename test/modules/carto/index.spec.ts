// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {CartoLayer} from '@deck.gl/carto';

test('global#CartoLayerLibrary', () => {
  expect(globalThis.CartoLayerLibrary, 'CartoLayerLibrary is exported').toBeTruthy();
  expect(
    globalThis.CartoLayerLibrary.CartoLayer,
    'CartoLayerLibrary contains CartoLayer'
  ).toBeTruthy();
  expect(globalThis.CartoLayerLibrary.CartoLayer, 'CartoLayer is valid').toEqual(CartoLayer);
});
