import jinja2

'''String that will render a deck.gl vis in a Jupyter notebook. Very minimal and WIP at the moment'''

JUPYTER_HTML = jinja2.Template('''
<div id="deck-container" style="height:{{height}}px;width:{{width}}px;background:grey;color:white;">
  <div id="deck-map-wrapper">
    <canvas id='deck-map-container' style='position:absolute;height:{{height}}px;width:{{width}}px;'></canvas>
  </div>
</div>
<script src="https://duberste.in/deckJson.js"></script>
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
</script>
''')

JUPYTER_JS = jinja2.Template('''
requirejs.config({
  shim: {
    'https://unpkg.com/deck.gl@latest/deckgl.min.js': [
        'https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.js'],
  }
});


require([
    'https://unpkg.com/deck.gl@latest/deckgl.min.js',
    'https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.js',
    'https://cdnjs.cloudflare.com/ajax/libs/d3-dsv/1.0.8/d3-dsv.min.js'
], function(core, mapboxgl, d3Dsv) {

  mapboxgl.accessToken = 'pk.eyJ1IjoidWJlcmRhdGEiLCJhIjoiY2pwY3owbGFxMDVwNTNxcXdwMms2OWtzbiJ9.1PPVl0VLUQgqrosrI2nUhg';

  const deck = new core.Deck({
    canvas: 'deck-map-container',
    height: '{{height}}px',
    width: '{{width}}px',
    position: 'relative',
    mapboxApiAccessToken: mapboxgl.accessToken,
    onViewportChange: onViewportChange,
    views: [new core.MapView()]
  });

  function onViewportChange(viewport) {
    deck.setProps({viewState: viewport});
  };

  var exports = {};
  var deckJsonApiExports = deckJsonApi(exports, core, d3Dsv);

  var jsonConverter = new deckJsonApiExports._JSONConverter({
    'configuration' : {
      'layers':{
        'HexagonLayer': core.HexagonLayer
      }
    }
  });
  const results = jsonConverter.convertJsonToDeckProps({{json}});
  deck.setProps(results);
});
''')
