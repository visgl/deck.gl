// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createLoaderWorker} from '@loaders.gl/loader-utils';
import CartoRasterTileLoader from '../layers/schema/carto-raster-tile-loader';

createLoaderWorker(CartoRasterTileLoader);
