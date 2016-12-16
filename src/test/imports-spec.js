import test from 'tape-catch';
import 'luma.gl/headless';

import DeckGL from '../../react';

import {
  DeckGLOverlay,
  Layer,
  ChoroplethLayer, ScatterplotLayer,
  ScreenGridLayer, ArcLayer, LineLayer
} from '../..';

import {
  EnhancedChoroplethLayer
} from '../../samples';

test('Top-level imports', t0 => {
  t0.test('import "deck.gl"', t => {
    t.ok(DeckGL, 'DeckGL symbol imported from /react');
    t.ok(!DeckGLOverlay, 'DeckGLOverlay symbol NOT imported from index');
    t.ok(Layer, 'Layer symbol imported');
    t.ok(Layer, 'Layer symbol imported');
    t.ok(ChoroplethLayer, 'ChoroplethLayer symbol imported');
    t.ok(ScatterplotLayer, 'ScatterplotLayer symbol imported');
    t.ok(ScreenGridLayer, 'ScreenGridLayer symbol imported');
    t.ok(ArcLayer, 'ArcLayer symbol imported');
    t.ok(LineLayer, 'LineLayer symbol imported');
    t.end();
  });

  t0.test('import "deck.gl/samples"', t => {
    t.ok(EnhancedChoroplethLayer, 'EnhancedChoroplethLayer symbol imported');
    t.end();
  });
  t0.end();
});
