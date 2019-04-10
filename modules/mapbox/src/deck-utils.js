import {Deck} from '@deck.gl/core';

export function getDeckInstance({map, gl, deck}) {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  const deckProps = {
    useDevicePixels: true,
    _customRender: () => map.triggerRepaint(),
    // TODO: import these defaults from a single source of truth
    parameters: {
      depthMask: true,
      depthTest: true,
      blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
      blendEquation: gl.FUNC_ADD
    },
    userData: {
      isExternal: false,
      mapboxLayers: new Set()
    }
  };

  if (deck) {
    deck.setProps(deckProps);
    deck.props.userData.isExternal = true;
  } else {
    // Using external gl context - do not set css size
    Object.assign(deckProps, {
      gl,
      width: false,
      height: false
    });
    deck = new Deck(deckProps);

    map.on('remove', () => {
      deck.finalize();
      map.__deck = null;
    });
  }
  map.__deck = deck;
  map.on('render', () => afterRender(deck, map));

  return deck;
}

export function addLayer(deck, layer) {
  deck.props.userData.mapboxLayers.add(layer);
  updateLayers(deck);
}

export function removeLayer(deck, layer) {
  deck.props.userData.mapboxLayers.delete(layer);
  updateLayers(deck);
}

export function updateLayer(deck, layer) {
  updateLayers(deck);
}

export function drawLayer(deck, layer) {
  // set layerFilter to only allow the current layer
  deck.deckRenderer.layerFilter = params => shouldDrawLayer(layer.id, params.layer);
  deck._drawLayers('mapbox-repaint', {clearCanvas: false});
  deck.deckPicker.layerFilter = null;
}

export function getViewState(map, extraProps) {
  const {lng, lat} = map.getCenter();
  return Object.assign(
    {
      longitude: lng,
      latitude: lat,
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch()
    },
    extraProps
  );
}

function afterRender(deck, map) {
  const {mapboxLayers, isExternal} = deck.props.userData;

  if (isExternal) {
    // Update viewState
    const viewState = getViewState(map, {
      nearZMultiplier: 0.1,
      farZMultiplier: 10
    });
    deck.setProps({viewState});

    // Draw non-Mapbox layers
    const mapboxLayerIds = Array.from(mapboxLayers, layer => layer.id);
    deck.deckRenderer.layerFilter = params => {
      for (const id of mapboxLayerIds) {
        if (shouldDrawLayer(id, params.layer)) {
          return false;
        }
      }
      return true;
    };
    deck._drawLayers('mapbox-repaint', {clearCanvas: false});
    deck.deckPicker.layerFilter = null;
  }

  deck.needsRedraw({clearRedrawFlags: true});
}

function shouldDrawLayer(id, layer) {
  let layerInstance = layer;
  while (layerInstance) {
    if (layerInstance.id === id) {
      return true;
    }
    layerInstance = layerInstance.parent;
  }
  return false;
}

function updateLayers(deck) {
  if (deck.props.userData.isExternal) {
    return;
  }

  const layers = [];
  deck.props.userData.mapboxLayers.forEach(deckLayer => {
    const LayerType = deckLayer.props.type;
    const layer = new LayerType(deckLayer.props);
    layers.push(layer);
  });
  deck.setProps({layers});
}
