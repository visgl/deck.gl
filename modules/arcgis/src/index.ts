// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import createDeckProps from './deck-props';
import createDeckLayer from './deck-layer';
import createDeckLayerView2D from './deck-layer-view-2d';
import createDeckRenderer from './deck-renderer';

import Accessor from '@arcgis/core/core/Accessor';
import Layer from '@arcgis/core/layers/Layer';
import BaseLayerViewGL2D from '@arcgis/core/views/2d/layers/BaseLayerViewGL2D';
import * as externalRenderers from '@arcgis/core/views/3d/externalRenderers';

// require-style loader
export {loadArcGISModules} from './load-modules';

// ESM-style classes
const DeckProps = createDeckProps(Accessor);
const DeckLayerView2D = createDeckLayerView2D(BaseLayerViewGL2D);
export const DeckLayer = createDeckLayer(DeckProps, Layer, DeckLayerView2D);
export const DeckRenderer = createDeckRenderer(DeckProps, externalRenderers);
