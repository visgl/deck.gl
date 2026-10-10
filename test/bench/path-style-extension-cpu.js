// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Bench} from '@probe.gl/bench';
import pathStyleExtensionBench from './path-style-extension.bench';

const suite = new Bench({minIterations: 3});
pathStyleExtensionBench(suite);
suite.calibrate().run();
