// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createLoaderWorker} from '@loaders.gl/loader-utils';
import CartoVectorTileLoader from '../layers/schema/carto-vector-tile-loader';

createLoaderWorker(CartoVectorTileLoader);
