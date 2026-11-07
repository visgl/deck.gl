// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {setupParseWorker} from '@ateliercartographie/geoarrow-deck-stream/worker';
import {registry} from './projections';
setupParseWorker({projections: registry});
