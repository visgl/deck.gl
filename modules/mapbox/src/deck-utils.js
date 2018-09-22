import {Deck} from '@deck.gl/core';

export function getDeckInstance({map, gl}) {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  const deck = new Deck({
    gl,
    width: '100%',
    height: '100%',
    controller: false,
    useDevicePixels: true,
    // layerFilter needs to be changed inside a rendering/picking cycle
    // But calling setProps({layerFilter}) will trigger another rerender which sets off an infinite loop
    // Instead, we use a constant callback here and access the dynamic filter in userData
    layerFilter: ({layer}) => filterLayer(deck, layer),
    _customRender: () => map.triggerRepaint(),
    userData: {
      mapboxLayers: new Set()
    }
  });
  map.__deck = deck;

  map.on('remove', () => {
    deck.finalize();
    map.__deck = null;
  });

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

  if (typeof layerFilter === 'string') {
    return layer.id === layerFilter;
  }
  return layerFilter;
}

function updateLayers(deck) {
  const layers = [];
  deck.props.userData.mapboxLayers.forEach(deckLayer => {
    const LayerType = deckLayer.props.type;
    const layer = new LayerType(deckLayer.props);
    layers.push(layer);
  });
  deck.setProps({layers});
}

// Register deck callbacks for pointer events
function initEvents(map, deck) {
  function handleMouseEvent(event, callback) {
    // draw all layers in picking buffer
    deck.props.userData.layerFilter = true;
    // Map from mapbox's MapMouseEvent object to mjolnir.js' Event object
    callback({
      offsetCenter: event.point,
      srcEvent: event.originalEvent
    });
  }

  map.on('click', event => handleMouseEvent(event, deck._onClick));
  map.on('mousemove', event => handleMouseEvent(event, deck._onPointerMove));
  map.on('mouseleave', event => handleMouseEvent(event, deck._onPointerLeave));
}
