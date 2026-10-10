// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ProjectionConfig} from './projection-config';
import mercator from './web-mercator';
import equalEarth from './equal-earth';
import equirectangular from './equirectangular';
import stereographic from './stereographic';

export type {ProjectionConfig} from './projection-config';
export type ProjectionName = 'mercator' | 'equalEarth' | 'equirectangular' | 'stereographic';

export const projections: Record<ProjectionName, ProjectionConfig> = {
  mercator,
  equalEarth,
  equirectangular,
  stereographic
};
