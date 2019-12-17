// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable no-console, no-invalid-this */
import {Bench} from '@probe.gl/bench';

import layerBench from './layer.bench';
import coreLayersBench from './core-layers.bench';
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
suite.run();
