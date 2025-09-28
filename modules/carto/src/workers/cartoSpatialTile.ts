// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createLoaderWorker} from '@loaders.gl/loader-utils';
import CartoSpatialTileLoader from '../layers/schema/carto-spatial-tile-loader';

createLoaderWorker(CartoSpatialTileLoader);
