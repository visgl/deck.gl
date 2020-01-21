import {jsonConverter} from './create-deck';

// eslint-disable-next-line complexity
function dtypeToTypedArray(dtype, data) {
  // Supports converting a numpy-typed array to a JavaScript-typed array
  // based on a string value dtype and a DataView `data`
  switch (dtype) {
    case 'int8':
      return new Int8Array(data);
    case 'uint8':
      return new Uint8Array(data);
    case 'int16':
      return new Int16Array(data);
    case 'uint16':
      return new Uint16Array(data);
    case 'float32':
      return new Float32Array(data);
    case 'float64':
      return new Float64Array(data);
    case 'int32':
      return new Int32Array(data);
    case 'uint32':
      return new Uint32Array(data);
    case 'int64':
      return new BigInt64Array(data); // eslint-disable-line no-undef
    case 'uint64':
      return new BigUint64Array(data); // eslint-disable-line no-undef
    default:
      throw new Error(`Unrecognized dtype ${dtype}`);
  }
}

function deserializeMatrix(arr, manager) {
  /* 
   * Data is sent from the pydeck backend
   * in the following format:
   *`
   * {'<layer ID>': 
   *     {'<accessor function name e.g. getPosition>': {
   *        {
   *          layer_id: <duplicate ID of layer as above>
   *          column_name: <string name of column>
   *          matrix: {
   *            data: <binary data, a row major order representation of a matrix>,
   *            shape: [<height>, <width>],
   *            dtype: <string representation of typed array data type>
   *          }
   *
   * Multiple layers and multiple accessors are possible.
   *
   * Objects at the JSON path `<accessor name>.matrix.data`
   * are vectors representing a 1 x n matrix,
   * or they can represent a m x n matrix in row major order form;
   * shape of the matrix is given at <accessor name>.matrix.data.shape
   */
  if (!arr) {
    return null;
  }
  const renderable = {};
  for (const datum of arr.payload) {
    // Each entry here represents a single column in
    // a pandas.DataFrame arriving from the pydeck backend
    const layerId = datum.layer_id;
    const accessor = datum.accessor;
    if (renderable[layerId] === undefined) {
      renderable[layerId] = {};
    }
    // Creates a typed array of the numpy data as a row-major ordered matrix, with shape specified elsewhere
    const rowMajorOrderMatrix = dtypeToTypedArray(datum.matrix.dtype, datum.matrix.data.buffer);
    renderable[layerId][accessor] = {
      layerId,
      accessor,
      columnName: datum.column_name,
      matrix: {data: rowMajorOrderMatrix, shape: datum.matrix.shape}
    };
    if (renderable[layerId][accessor].matrix.data.length === 0) {
      console.warn(`No records in accessor ${accessor} belonging to ${layerId}`); // eslint-disable-line
    }
  }
  // Becomes the data stored within the widget model at `model.get('data_buffer')`
  return renderable;
}

function makeLayerAccessorPropFunction({width, accessor}) {
  // Given a specific accessor name as a string and width as an integer,
  // returns a function that can be used for lookups on the data at data.src
  // data.src is a layer-specific data dictionary keyed by accessor
  return (object, {index, data, target}) => {
    for (let j = 0; j < width; j++) {
      target[j] = data.src[accessor][index * width + j];
    }
    return target;
  };
}

function getAccessorNamesFrom(dataBuffer, layerId) {
  // Given data transferred from pydeck's backend,
  // get the names of the accessors using binary data on a particular layer
  return Object.keys(dataBuffer[layerId]);
}

function constructData(dataBuffer, layerId) {
  const src = {};
  let length = 0;
  const accessors = getAccessorNamesFrom(dataBuffer, layerId);
  // For each accessor, we have a row major ordered matrix of data,
  // represented as a single vector under `src[accessor]`
  for (const accessor of accessors) {
    const currentData = dataBuffer[layerId][accessor];
    length = Math.max(currentData.matrix.shape[0], length);
    src[accessor] = currentData.matrix.data;
  }
  return {
    src,
    length
  };
}

function makeBinaryAccessorProps(accessors, layerId, dataBuffer) {
  const dataAccessorProps = {};
  for (const accessor of accessors) {
    // width of matrix
    const width = dataBuffer[layerId][accessor].matrix.shape[1] || 1;
    const newAccessorFunction = makeLayerAccessorPropFunction({width, accessor});
    dataAccessorProps[accessor] = newAccessorFunction;
  }
  return dataAccessorProps;
}

function processDataBuffer({dataBuffer, jsonProps}) {
  const convertedJsonProps = jsonConverter(jsonProps);
  for (let i = 0; i < convertedJsonProps.layers.length; i++) {
    const layer = convertedJsonProps.layers[i];
    layer.data = constructData(dataBuffer, layer.id);
    // use https://deck.gl/#/documentation/deckgl-api-reference/layers/layer?section=state-object- instead
    const accessors = getAccessorNamesFrom(dataBuffer, layer.id);
    const accessorProps = makeBinaryAccessorProps(accessors, layer.id, dataBuffer);
    for (const accessor of accessors) {
      layer[accessor] = accessorProps[accessor];
    }
  }
  return convertedJsonProps;
}

export {deserializeMatrix, processDataBuffer};
