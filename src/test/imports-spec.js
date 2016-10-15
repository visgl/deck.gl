import test from 'tape-catch';
import 'luma.gl/headless';
import {
  DeckGL, Layer, BaseLayer,
  ChoroplethLayer, ScatterplotLayer,
  GridLayer, ArcLayer, LineLayer,
  Viewport
} from '../..';

import {
  PointCloudLayer, EnhancedChoroplethLayer, HexagonLayer, EnhancedHexagonLayer
} from '../../samples';

import Viewport2 from '../../viewport';

test('Top-level imports', t0 => {
  t0.test('import "deck.gl"', t => {
    t.ok(DeckGL, 'DeckGLOverlay symbol imported');
    t.ok(Layer, 'Layer symbol imported');
    t.ok(BaseLayer, 'BaseLayer symbol imported');
    t.ok(ChoroplethLayer, 'ChoroplethLayer symbol imported');
    t.ok(ScatterplotLayer, 'ScatterplotLayer symbol imported');
    t.ok(GridLayer, 'GridLayer symbol imported');
    t.ok(ArcLayer, 'ArcLayer symbol imported');
    t.ok(LineLayer, 'LineLayer symbol imported');
    t.ok(Viewport, 'Viewport symbol imported');
    t.end();
  });

  t0.test('import "deck.gl/samples"', t => {
    t.ok(PointCloudLayer, 'PointCloudLayer symbol imported');
    t.ok(HexagonLayer, 'HexagonLayer symbol imported');
    t.ok(EnhancedChoroplethLayer, 'EnhancedChoroplethLayer symbol imported');
    t.ok(EnhancedHexagonLayer, 'EnhancedHexagonLayer symbol imported');
    t.end();
  });

  t0.test('import "deck.gl/viewport"', t => {
    t.ok(Viewport2, 'Viewport symbol imported');
    t.end();
  });
  t0.end();
});
