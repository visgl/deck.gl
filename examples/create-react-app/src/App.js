/// app.js
import React, {Component} from 'react';
import MapGL from 'react-map-gl';
import DeckGL, {LineLayer} from 'deck.gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'MAPBOX_ACCESS_TOKEN';

// Viewport settings that is shared between mapbox and deck.gl
const viewport = {
    width: 500,
    height: 500,
    longitude: -100,
    latitude: 40.7,
    zoom: 3,
    pitch: 0,
    bearing: 0
}

// Data to be used by the LineLayer
const data = [
    {sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}
];

export default class App extends Component {

    render() {

        return (
            <MapGL {...viewport} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
                <DeckGL {...viewport} layers={[
                    new LineLayer({id: 'line-layer', data})
                ]} />
            </MapGL>
        );
    }
}
