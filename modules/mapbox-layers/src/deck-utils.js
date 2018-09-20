import {Deck} from '@deck.gl/core';
/* global window */

export function getDeckInstance({map, gl}) {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  const deck = new Deck({
    // TODO - this should not be needed
    canvas: 'deck-canvas',
    width: '100%',
    height: '100%',
    controller: false,
    useDevicePixels: true,
    layerFilter: ({layer}) => filterLayer(deck, layer),
    _customRender: true,
    userData: {
      mapboxLayers: new Set()
    }
  });
  deck._setGLContext(gl);
  map.__deck = deck;

  initAnimationLoop(map, deck);
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

// Create animation loop
function initAnimationLoop(map, deck) {
  let animationFrame = null;

  function animate() {
    deck.props.userData.layerFilter = false;
    // Nothing's actually drawn yet because of the layer filter
    // this just runs all the animation/layer updates then check if redraw flag is set
    if (deck._onRenderFrame()) {
      map.triggerRepaint();
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  animate();

  map.on('remove', () => {
    window.cancelAnimationFrame(animationFrame);
    deck.finalize();
    map.__deck = null;
  });
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
