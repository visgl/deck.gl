import Protobuf from "pbf";

const decodeProto = data => {
  const readField = function(tag, obj, pbf) {
      if (tag === 1) pbf.readPackedVarint(obj.data);
  };
  const read = function(pbf, end) {
      return pbf.readFields(readField, { data: [] }, end);
  };
  const pbfData = new Protobuf(data);
  const intArray = read(pbfData);
  return intArray && intArray.data;
};

const parseTemporalgrid = (arraybuffer, options) => {
  const int16ArrayBuffer = decodeProto(arraybuffer);
  console.log(int16ArrayBuffer)
  return 'plop'
}

export const MVTWorkerLoader /* : Loader*/ = {
  name: 'Temporl Grid',
  id: 'temporalgrid',
  module: 'temporalgrid',
  version: '1',
  // Note: ArcGIS uses '.pbf' extension and 'application/octet-stream'
  extensions: ['mvt', 'pbf'],
  mimeTypes: [
    'application/vnd.mapbox-vector-tile',
    'application/x-protobuf'
    // 'application/octet-stream'
  ],
  // worker: true,
  worker: false,
  category: 'geometry',
  options: {
    temporalgrid: {
      // coordinates: 'local',
      // layerProperty: 'layerName',
      // layers: null,
      // tileIndex: null
    }
  }
};

export const TemporalGridLoader /* : LoaderWithParser*/ = {
  ...MVTWorkerLoader,
  parse: async (arrayBuffer, options) => parseTemporalgrid(arrayBuffer, options),
  parseSync: parseTemporalgrid,
  binary: true
};
