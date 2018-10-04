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
    // layerFilter needs to be changed inside a rendering/picking cycle
    // But calling setProps({layerFilter}) will trigger another rerender which sets off an infinite loop
    // Instead, we use a constant callback here and access the dynamic filter in userData
    layerFilter: ({layer}) => filterLayer(deck, layer),
    _customRender: () => map.triggerRepaint(),
    userData: {
      layerFilter: '',
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
  deck.props.userData.layerFilter = layer.id;
  deck._drawLayers('mapbox-repaint');
  deck.needsRedraw({clearRedrawFlags: true});
}

function filterLayer(deck, layer) {
  const {layerFilter} = deck.props.userData;

  if (typeof layerFilter !== 'string') {
    return layerFilter;
  }

  let layerInstance = layer;
  while (layerInstance) {
    if (layerInstance.id === layerFilter) {
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
  deck.props.userData.layerFilter = true;

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
