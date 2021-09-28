import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

import {Map} from '@esri/react-arcgis';
import {loadArcGISModules} from '@deck.gl/arcgis';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// A React wrapper around https://deck.gl/docs/api-reference/arcgis/deck-layer
function DeckGLLayer(props) {
  const [layer, setLayer] = useState(null);

  useEffect(() => {
    let deckLayer;
    loadArcGISModules().then(({DeckLayer}) => {
      deckLayer = new DeckLayer({});
      setLayer(deckLayer);
      props.map.add(deckLayer);
    });

    // clean up
    return () => deckLayer && props.map.remove(deckLayer);
  }, []);

  if (layer) {
    layer.deck.set(props);
  }

  return null;
}

function App() {
  const layers = [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: info =>
        info.object &&
        // eslint-disable-next-line
        alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ];

  return (
    <Map
      mapProperties={{basemap: 'dark-gray-vector'}}
      viewProperties={{
        center: [0.119167, 52.205276],
        zoom: 5
      }}
    >
      <DeckGLLayer
        getTooltip={info => info.object && info.object.properties.name}
        layers={layers}
      />
    </Map>
  );
}

/* global document */
ReactDOM.render(<App />, document.getElementById('root'));
