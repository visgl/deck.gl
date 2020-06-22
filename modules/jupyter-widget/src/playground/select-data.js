const DEFAULT_HIGHLIGHT_RGBA = [255, 255, 0];
const HIGHLIGHT_LAYER_ID = '_deck.gl-jupyter-widget-hightlight';

// createHighlightLayer takes a selected data object
export function createHighlightLayer({selectedData, selectedLayer}) {
  const {highlightColor = DEFAULT_HIGHLIGHT_RGBA} = selectedLayer;
  return selectedLayer.clone({
    id: HIGHLIGHT_LAYER_ID,
    data: selectedData,
    colorRange: [highlightColor],
    getFillColor: highlightColor,
    getLineColor: highlightColor,
    getColor: highlightColor
  });
}

function multiselectEnabled(e) {
  return e.srcEvent.metaKey;
}

// Add highlight layer to pre-existing deck.gl object;
export function addHighlightLayer({transport, selectedData, selectedLayer}) {
  const highlightLayer = createHighlightLayer({selectedData, selectedLayer});
  const deckgl = transport.userData.deck;
  const {layers} = deckgl.props;
  const layersPlusHighlight = [];
  // gather all the layers except the highlight layer
  for (const layer of layers) {
    if (layer.id === HIGHLIGHT_LAYER_ID) {
      continue; // eslint-disable-line no-continue
    }
    layersPlusHighlight.push(layer);
  }
  layersPlusHighlight.unshift(highlightLayer);

  deckgl.setProps({layers: layersPlusHighlight});
}

// Adds data selected by a click to the Python backend
export function selectData(transport, datum, e) {
  if (!datum || !datum.object) {
    transport.jupyterModel.set('selected_data', '[]');
    transport.jupyterModel.save_changes();
    return;
  }

  const dataPayload = datum.object.points || [datum.object];
  console.debug(`Selected datum ${JSON.stringify(dataPayload)}`); // eslint-disable-line no-console,no-undef
  const selectedLayer = datum.layer;
  let selectedData;
  if (multiselectEnabled(e)) {
    selectedData = JSON.parse(transport.jupyterModel.get('selected_data'));
    selectedData.push(dataPayload);
  } else {
    // Single selection
    if (!Array.isArray(dataPayload)) {
      console.log.warn('Seleted datum is not an array'); // eslint-disable-line no-console,no-undef
    }
    selectedData = dataPayload;
  }
  transport.jupyterModel.set('selected_data', JSON.stringify(selectedData));
  addHighlightLayer({transport, selectedData, selectedLayer});
  transport.jupyterModel.save_changes();
}
