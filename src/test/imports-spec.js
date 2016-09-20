import test from 'tape-catch';
import 'luma.gl/headless';
import {
  DeckGLOverlay, Layer, BaseLayer,
  HexagonLayer, ChoroplethLayer, ScatterplotLayer,
  GridLayer, ArcLayer, LineLayer,
  Viewport
} from '../..';

import {
  PointCloudLayer, ExtrudedChoroplethLayer, EnhancedHexagonLayer
} from '../../experimental';

import Viewport2 from '../../viewport';

test('Top-level imports', t0 => {
  t0.test('import "deck.gl"', t => {
    t.ok(DeckGLOverlay, 'DeckGLOverlay symbol imported');
    t.ok(Layer, 'Layer symbol imported');
    t.ok(BaseLayer, 'BaseLayer symbol imported');
    t.ok(HexagonLayer, 'HexagonLayer symbol imported');
    t.ok(ChoroplethLayer, 'ChoroplethLayer symbol imported');
    t.ok(ScatterplotLayer, 'ScatterplotLayer symbol imported');
    t.ok(GridLayer, 'GridLayer symbol imported');
    t.ok(ArcLayer, 'ArcLayer symbol imported');
    t.ok(LineLayer, 'LineLayer symbol imported');
    t.ok(Viewport, 'Viewport symbol imported');
    t.end();
  });

  t0.test('import "deck.gl/experimental"', t => {
    t.ok(PointCloudLayer, 'PointCloudLayer symbol imported');
    t.ok(ExtrudedChoroplethLayer, 'ExtrudedChoroplethLayer symbol imported');
    t.ok(EnhancedHexagonLayer, 'EnhancedHexagonLayer symbol imported');
    t.end();
  });

  t0.test('import "deck.gl/viewport"', t => {
    t.ok(Viewport2, 'Viewport symbol imported');
    t.end();
  });
  t0.end();
});
