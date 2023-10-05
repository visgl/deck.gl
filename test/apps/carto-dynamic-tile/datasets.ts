import {
  cartoBoundaryQuerySource,
  cartoBoundaryTableSource,
  cartoH3QuerySource,
  cartoH3TableSource,
  cartoH3TilesetSource,
  cartoQuadbinQuerySource,
  cartoQuadbinTableSource,
  cartoQuadbinTilesetSource,
  cartoRasterSource,
  cartoVectorQuerySource,
  cartoVectorTableSource,
  cartoVectorTilesetSource,
  colorBins
} from '@deck.gl/carto';

export default {
  'boundary-query': {
    source: cartoBoundaryQuerySource,
    boundaryId: 'usa_pos4',
    propertiesSqlSource:
      'select * from `cartodb-on-gcp-backend-team.juanra.geography_usa_zcta5_2019_clustered`',
    getFillColor: colorBins({
      // TODO remove parseFloat, only needed as binary format encodes as strings
      attr: d => parseFloat(d!.properties!['do_perimeter']),
      domain: [0, 1, 5, 10, 25, 50, 100].map(n => 10000 * n),
      colors: 'Peach'
    })
  },
  'boundary-table': {
    source: cartoBoundaryTableSource,
    boundaryId: 'usa_pos4',
    columns: ['do_label', 'do_perimeter'],
    propertiesTableSource: 'cartodb-on-gcp-backend-team.juanra.geography_usa_zcta5_2019_clustered',
    getFillColor: colorBins({
      attr: d => parseFloat(d!.properties!['do_perimeter']),
      domain: [0, 1, 5, 10, 25, 50, 100].map(n => 10000 * n),
      colors: 'Purp'
    })
  },
  'h3-query': {
    source: cartoH3QuerySource,
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
    source: cartoH3TableSource,
    tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
    aggregationExp: 'avg(population) as population_average',
    getFillColor: colorBins({
      attr: 'population_average',
      domain: [10, 50, 100, 250, 500, 1000],
      colors: 'SunsetDark'
    })
  },
  'h3-tileset': {
    source: cartoH3TilesetSource,
    tableName:
      'carto-demo-data.demo_tilesets.derived_spatialfeatures_usa_h3res8_v1_yearly_v2_tileset',
    getFillColor: colorBins({
      attr: 'retail',
      domain: [1, 2, 3, 5, 8, 11],
      colors: 'Earth'
    })
  },
  'quadbin-query': {
    source: cartoQuadbinQuerySource,
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
    source: cartoQuadbinTableSource,
    tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_quadbin15_v1_yearly_v2',
    aggregationExp: 'avg(population) as population_average',
    getFillColor: colorBins({
      attr: 'population_average',
      domain: [10, 50, 100, 250, 500, 1000],
      colors: 'SunsetDark'
    })
  },
  'quadbin-tileset': {
    source: cartoQuadbinTilesetSource,
    tableName:
      'carto-demo-data.demo_tilesets.derived_spatialfeatures_usa_quadbin15_v1_yearly_v2_tileset',
    getFillColor: colorBins({
      attr: 'avg_retail',
      domain: [1, 2, 3, 5, 8, 11],
      colors: 'Earth'
    })
  },
  raster: {
    source: cartoRasterSource,
    tableName: 'cartodb-data-engineering-team.jarroyo_raster.sdsc23_5_quadbin',
    getFillColor: colorBins({
      attr: 'band_1',
      domain: [0, 5, 10, 15, 20, 25, 30],
      colors: 'Temps'
    })
  },
  'vector-query': {
    source: cartoVectorQuerySource,
    sqlQuery:
      'select geom, district from carto-demo-data.demo_tables.chicago_crime_sample where year > 2016',
    getFillColor: [255, 0, 0]
  },
  'vector-table': {
    source: cartoVectorTableSource,
    tableName: 'carto-demo-data.demo_tables.chicago_crime_sample',
    columns: ['date', 'year'],
    getFillColor: colorBins({
      attr: 'year',
      domain: [2002, 2006, 2010, 2016, 2020],
      colors: 'Magenta'
    })
  },
  'vector-table-dynamic': {
    source: cartoVectorTableSource,
    tableName: 'carto-demo-data.demo_tables.osm_buildings_usa',
    spatialDataColumn: 'geog',
    getFillColor: [131, 44, 247]
  },
  'vector-tileset': {
    source: cartoVectorTilesetSource,
    tableName: 'carto-demo-data.demo_tilesets.sociodemographics_usa_blockgroup',
    getFillColor: colorBins({
      attr: 'income_per_capita',
      domain: [15000, 25000, 35000, 45000, 60000],
      colors: 'OrYel'
    })
  }
};
