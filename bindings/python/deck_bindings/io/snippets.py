'''String that will render a deck.gl vis in a Jupyter notebook. Very minimal and WIP at the moment'''

JUPYTER_HTML = '''
<div id="deck-container" style="height:500px;width:700px;background:grey;">
  <h1> Demo Vis </h1>
  <div id="deck-map-wrapper">
    <canvas id='deck-map-container' style='position:absolute;height:100%;width:100%;'></canvas>
  </div>
</div>
<script>

function installStyleSheet(url) {
  /* global document */
  const styles = document.createElement('link');
  styles.type = 'text/css';
  styles.rel = 'stylesheet';
  styles.href = url;
  document.head.appendChild(styles);

  document.body.style.margin = '0px';
}


installStyleSheet('https://api.tiles.mapbox.com/mapbox-gl-js/v0.47.0/mapbox-gl.css')

require([
    'https://unpkg.com/deck.gl@latest/deckgl.min.js',
    'https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.js'
], function(deckgl, mapboxgl) {
    mapboxgl.accessToken = {}

    const layer = new deckgl.ScatterplotLayer({
      id: 'dots',
      data: [{coordinates: [0, 0]}, {coordinates: [0.001, 0]}],
      getRadius: 100,
      getPosition: d => d.coordinates,
      getFillColor: [255, 255, 255],
    });

    const INITIAL_VIEWPORT_STATE = {
      latitude: 0,
      longitude: 0,
      zoom: 15
    };
    const deck = new deckgl.Deck({
      canvas: 'deck-map-container',
      longitude: 0,
      latitude: 0,
      mapboxApiAccessToken: mapboxgl.accessToken,
      viewState: INITIAL_VIEWPORT_STATE,
      onViewportChange: onViewportChange,
      views: [new deckgl.MapView()],
      layers: [layer]
    });

    function onViewportChange(viewport) {
      deck.setProps({viewState: viewport});
    }
});
</script>
'''
