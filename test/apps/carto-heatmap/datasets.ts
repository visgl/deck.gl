// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {h3TableSource, quadbinTableSource} from '@carto/api-client';

export interface DatasetConfig {
  type: 'h3' | 'quadbin';
  source: typeof h3TableSource | typeof quadbinTableSource;
  tableName: string;
  aggregationExp?: string;
  getWeight: (d: any) => number;
  description: string;
}

export const datasets: Record<string, DatasetConfig> = {
  'H3 Table (Population)': {
    type: 'h3',
    source: h3TableSource,
    tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
    aggregationExp: 'sum(population) as population_sum',
    getWeight: d => d.properties.population_sum || 1,
    description: 'H3 cells with population data from table source'
  },
  'Quadbin Table (Population)': {
    type: 'quadbin',
    source: quadbinTableSource,
    tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_quadbin15_v1_yearly_v2',
    aggregationExp: 'sum(population) as population_sum',
    getWeight: d => d.properties.population_sum || 1,
    description: 'Quadbin cells with population data from table source'
  }
};
