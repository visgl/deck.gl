// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */
import {Bench} from '@probe.gl/bench';

import layerBench from './layer.bench';
import coreLayersBench from './core-layers.bench';
import deepEqualBench from './deep-equal.bench';
import viewportBench from './viewport.bench';
import colorBench from './color.bench';
import pickLayersBench from './pick-layers.bench';
import tesselationBench from './tesselation.bench';
import gridAggregatorBench from './gpu-grid-aggregator.bench';
import utilsBench from './utils.bench';
import arrayCopyBench from './array-copy.bench';
import attributeUpdateBench from './attribute-update.bench';
import comparePropsBench from './compare-props.bench';
import createPropsBench from './create-props.bench';
import textAutoWrappingBench from './text-auto-wrapping.bench';

const suite = new Bench({minIterations: 10});

// add tests
layerBench(suite);
coreLayersBench(suite);
deepEqualBench(suite);
viewportBench(suite);
colorBench(suite);
utilsBench(suite);
pickLayersBench(suite);
tesselationBench(suite);
gridAggregatorBench(suite);
arrayCopyBench(suite);
attributeUpdateBench(suite);
comparePropsBench(suite);
createPropsBench(suite);
textAutoWrappingBench(suite);

// Run the suite
suite.calibrate().run();
