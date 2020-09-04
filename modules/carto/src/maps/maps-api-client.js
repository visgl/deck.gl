// const REQUEST_GET_MAX_URL_LENGTH = 2048;
// const VECTOR_EXTENT = 2048;
// const VECTOR_SIMPLIFY_EXTENT = 2048;

export default class MapsApiClient {
  constructor(connection) {
    this._connection = connection;
  }

  instantiateMapFrom(mapOptions) {
    const {source} = mapOptions;

    const isSQL = source.search(' ') > -1;
    const sql = isSQL ? source : `SELECT * FROM ${source}`;
    return sql; //
  }
}
