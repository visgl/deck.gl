import {
  CartoH3TilesetSource,
  CartoH3TableSource,
  CartoH3QuerySource,
  CartoQuadbinTableSource,
  CartoQuadbinTilesetSource,
  CartoQuadbinQuerySource,
  CartoVectorTableSource,
  CartoVectorTilesetSource,
  CartoVectorQuerySource,
  colorBins
} from '@deck.gl/carto';

export default {
  'h3-query': {
    Source: CartoH3QuerySource,
    sqlQuery:
      'select h3, population from carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
    aggregationExp: 'min(population) as population_min',
    getFillColor: colorBins({
      attr: 'population_min',
      domain: [10, 50, 100, 250, 500, 1000],
      colors: 'BrwnYl'
    })
  },
  'h3-table': {
    Source: CartoH3TableSource,
    tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
    aggregationExp: 'avg(population) as population_average',
    getFillColor: colorBins({
      attr: 'population_average',
      domain: [10, 50, 100, 250, 500, 1000],
      colors: 'SunsetDark'
    })
  },
  'h3-tileset': {
    Source: CartoH3TilesetSource,
    tableName:
      'carto-demo-data.demo_tilesets.derived_spatialfeatures_usa_h3res8_v1_yearly_v2_tileset',
    getFillColor: colorBins({
      attr: 'retail',
      domain: [1, 2, 3, 5, 8, 11],
      colors: 'Earth'
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
  'quadbin-tileset': {
    Source: CartoQuadbinTilesetSource,
    tableName:
      'carto-demo-data.demo_tilesets.derived_spatialfeatures_usa_quadbin15_v1_yearly_v2_tileset',
    getFillColor: colorBins({
      attr: 'avg_retail',
      domain: [1, 2, 3, 5, 8, 11],
      colors: 'Earth'
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
