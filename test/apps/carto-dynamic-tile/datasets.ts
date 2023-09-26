import {
  CartoQuadbinTableSource,
  CartoQuadbinQuerySource,
  CartoVectorTableSource,
  CartoVectorTilesetSource,
  CartoVectorQuerySource,
  colorBins
} from '@deck.gl/carto';

export default {
  'quadbin-table': {
    Source: CartoQuadbinTableSource,
    tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_quadbin15_v1_yearly_v2',
    aggregationExp: 'avg(population) as population_average',
    getFillColor: colorBins({
      attr: 'population_average',
      domain: [10, 50, 100, 250, 500, 1000],
      colors: 'SunsetDark'
    })
  },
  'quadbin-query': {
    Source: CartoQuadbinQuerySource,
    sqlQuery:
      'select quadbin, population from carto-demo-data.demo_tables.derived_spatialfeatures_usa_quadbin15_v1_yearly_v2',
    aggregationExp: 'min(population) as population_min',
    getFillColor: colorBins({
      attr: 'population_min',
      domain: [10, 50, 100, 250, 500, 1000],
      colors: 'BrwnYl'
    })
  },
  'vector-query': {
    Source: CartoVectorQuerySource,
    sqlQuery:
      'select geom, district from carto-demo-data.demo_tables.chicago_crime_sample where year > 2016',
    getFillColor: [255, 0, 0]
  },
  'vector-table': {
    Source: CartoVectorTableSource,
    tableName: 'carto-demo-data.demo_tables.chicago_crime_sample',
    columns: ['date', 'year'],
    getFillColor: colorBins({
      attr: 'year',
      domain: [2002, 2006, 2010, 2016, 2020],
      colors: 'Magenta'
    })
  },
  'vector-table-dynamic': {
    Source: CartoVectorTableSource,
    tableName: 'carto-demo-data.demo_tables.osm_buildings_usa',
    spatialDataColumn: 'geog',
    getFillColor: [131, 44, 247]
  },
  'vector-tileset': {
    Source: CartoVectorTilesetSource,
    tableName: 'carto-demo-data.demo_tilesets.sociodemographics_usa_blockgroup',
    getFillColor: colorBins({
      attr: 'income_per_capita',
      domain: [15000, 25000, 35000, 45000, 60000],
      colors: 'OrYel'
    })
  }
};
