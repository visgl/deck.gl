import {Deck} from '@deck.gl/core';

export function getDeckInstance({map, gl, deck}) {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  const deckProps = {
    gl,
    width: '100%',
    height: '100%',
    useDevicePixels: true,
    _customRender: () => map.triggerRepaint(),
    userData: {
      isExternal: false,
      mapboxLayers: new Set()
    }
  };

  if (deck) {
    deck.setProps(deckProps);
    deck.props.userData.isExternal = true;
  } else {
    deck = new Deck(deckProps);

    map.on('remove', () => {
      deck.finalize();
      map.__deck = null;
    });
  }
  map.__deck = deck;
  map.on('render', () => afterRender(deck));

  initEvents(map, deck);

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
  deck.layerManager.layerFilter = params => shouldDrawLayer(layer.id, params.layer);
  deck._drawLayers('mapbox-repaint');
}

function afterRender(deck) {
  const {mapboxLayers, isExternal} = deck.props.userData;

  if (isExternal) {
    // Draw non-Mapbox layers
    const mapboxLayerIds = Array.from(mapboxLayers).map(layer => layer.id);
    deck.layerManager.layerFilter = params => {
      for (const id of mapboxLayerIds) {
        if (shouldDrawLayer(id, params.layer)) {
          return false;
        }
      }
      return true;
    };
    deck._drawLayers('mapbox-repaint');
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

// Triggers picking on a mouse event
function handleMouseEvent(deck, event) {
  // reset layerFilter to allow all layers during picking
  deck.layerManager.layerFilter = null;

  let callback;
  switch (event.type) {
    case 'click':
      callback = deck._onClick;
      break;

    case 'mousemove':
    case 'pointermove':
      callback = deck._onPointerMove;
      break;

    case 'mouseleave':
    case 'pointerleave':
      callback = deck._onPointerLeave;
      break;

    default:
      return;
  }

  if (!event.offsetCenter) {
    // Map from mapbox's MapMouseEvent object to mjolnir.js' Event object
    event = {
      offsetCenter: event.point,
      srcEvent: event.originalEvent
    };
  }
  callback(event);
}

// Register deck callbacks for pointer events
function initEvents(map, deck) {
  const pickingEventHandler = event => handleMouseEvent(deck, event);

  if (deck.eventManager) {
    // Replace default event handlers with our own ones
    deck.eventManager.off({
      click: deck._onClick,
      pointermove: deck._onPointerMove,
      pointerleave: deck._onPointerLeave
    });
    deck.eventManager.on({
      click: pickingEventHandler,
      pointermove: pickingEventHandler,
      pointerleave: pickingEventHandler
    });
  } else {
    map.on('click', pickingEventHandler);
    map.on('mousemove', pickingEventHandler);
    map.on('mouseleave', pickingEventHandler);
  }
}
