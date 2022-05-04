import React, {useEffect, useRef} from 'react';
import {render} from 'react-dom';
import {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {Wrapper, Status} from '@googlemaps/react-wrapper';
import {GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAP_ID = process.env.GoogleMapsMapId; // eslint-disable-line

const overlay = new DeckOverlay({
  layers: [
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
        // eslint-disable-next-line
        info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
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
  ]
});

const renderMap = status => {
  if (status === Status.LOADING) return <h3>{status} ..</h3>;
  if (status === Status.FAILURE) return <h3>{status} ...</h3>;
  return null;
};

// if using the create-react-app template try this
// function MyMapComponent({center, zoom}) {
//   const ref = useRef();
//   const [map, setMap] = useState(null);
  
//   useEffect(() => {
//     const map = new window.google.maps.Map(ref.current, {
//       center: center,
//       zoom: zoom,
//       mapId: GOOGLE_MAP_ID
//     });
//     setMap(map);
    
//   }, [center, zoom]);

//   useEffect(() => {
//     overlay.setMap(map);
//   }, [map]);

function MyMapComponent({center, zoom}) {
  const ref = useRef();

  useEffect(() => {
    const map = new window.google.maps.Map(ref.current, {
      center: center,
      zoom: zoom,
      mapId: GOOGLE_MAP_ID
    });
    overlay.setMap(map);
  }, [center, zoom]);

  return (
    <>
      <div ref={ref} id="map" style={{height: '100vh', width: '100wh'}} />
    </>
  );
}

function Root() {
  const center = {lat: 51.47, lng: 0.45};
  const zoom = 5;

  return (
    <>
      <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={renderMap}>
        <MyMapComponent center={center} zoom={zoom} />
      </Wrapper>
    </>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
