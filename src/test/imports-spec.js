import test from 'tape-catch';
import 'luma.gl';

import DeckGL from '../../react';

import {
  Layer,
  ChoroplethLayer, ScatterplotLayer, ScreenGridLayer, ArcLayer, LineLayer,
  COORDINATE_SYSTEM
} from '../..';

import {
  EnhancedChoroplethLayer
} from '../../samples';

test('Top-level imports', t0 => {
  t0.test('import "deck.gl"', t => {

    t.ok(Layer, 'Layer symbol imported');
    t.ok(Layer, 'Layer symbol imported');
    t.ok(ChoroplethLayer, 'ChoroplethLayer symbol imported');
    t.ok(ScatterplotLayer, 'ScatterplotLayer symbol imported');
    t.ok(ScreenGridLayer, 'ScreenGridLayer symbol imported');
    t.ok(ArcLayer, 'ArcLayer symbol imported');
    t.ok(LineLayer, 'LineLayer symbol imported');

    t.ok(Number.isFinite(COORDINATE_SYSTEM.LNGLAT), 'COORDINATE_SYSTEM.LNGLAT imported');
    t.ok(Number.isFinite(COORDINATE_SYSTEM.METERS), 'COORDINATE_SYSTEM.METERS imported');
    t.ok(Number.isFinite(COORDINATE_SYSTEM.IDENTITY), 'COORDINATE_SYSTEM.IDENTITY imported');
    t.end();
  });

  t0.test('import "deck.gl/react"', t => {
    t.ok(DeckGL, 'DeckGL symbol imported from /react');
    t.end();
  });

  t0.test('import "deck.gl/samples"', t => {
    t.ok(EnhancedChoroplethLayer, 'EnhancedChoroplethLayer symbol imported');
    t.end();
  });
  t0.end();
});
