// eslint-disable-next-line complexity
function dtypeToTypedArray(dtype, data) {
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
   *
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
    // Columns can be nested
    const convertedBinary = dtypeToTypedArray(datum.matrix.dtype, datum.matrix.data.buffer);
    renderable[layerId][accessor] = {
      layerId,
      accessor,
      columnName: datum.column_name,
      matrix: {data: convertedBinary, shape: datum.matrix.shape}
    };
    if (renderable[layerId][accessor].matrix.data.length === 0) {
      console.warn(`No records in accessor ${accessor} belonging to ${layerId}`); // eslint-disable-line
    }
  }
  return renderable;
}

function makeLayerAccessorPropFunction({width, accessor}) {
  /* data.src is a layer-specific data dictionary keyed by accessor */
  return (object, {index, data, target}) => {
    for (let j = 0; j < width; j++) {
      target[j] = data.src[accessor][index * width + j];
    }
    return target;
  };
}

function getLayer(deckLayers, layerId) {
  for (const layer of deckLayers) {
    if (layer.id === layerId) {
      return layer;
    }
  }
  return null;
}

function getCurrentLayerProps(layer) {
  const LayerConstructor = layer.__proto__.constructor; // eslint-disable-line
  const layerProps = layer.props;
  return {
    LayerConstructor,
    layerProps
  };
}

function getAccessorNamesFrom(dataBuffer, layerId) {
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

function processDataBuffer({currentLayers, dataBuffer}) {
  const updatedLayers = [];
  const updateLayerIds = Object.keys(dataBuffer);
  for (const layerId of updateLayerIds) {
    const currentLayer = getLayer(currentLayers, layerId);
    const newLayerData = constructData(dataBuffer, layerId);
    const {LayerConstructor, layerProps} = getCurrentLayerProps(currentLayer);
    const accessors = getAccessorNamesFrom(dataBuffer, layerId);
    const accessorProps = makeBinaryAccessorProps(accessors, layerId, dataBuffer);
    const combinedProps = {...layerProps, ...accessorProps};
    combinedProps.data = newLayerData;
    const layer = new LayerConstructor({...combinedProps});
    updatedLayers.push(layer);
  }

  return updatedLayers;
}

export {deserializeMatrix, processDataBuffer};
