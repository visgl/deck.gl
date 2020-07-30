/* eslint-env browser */
import React from 'react';
import { render } from 'react-dom';
import DeckGL, { GeoJsonLayer, TileLayer, PathLayer } from 'deck.gl';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 0
};

function mid(a, b, portion) {
  return a + portion * (b - a);
}

function Root() {
  return (
    <DeckGL controller={true} initialViewState={INITIAL_VIEW_STATE}>
      <GeoJsonLayer
        id="base-map"
        data={COUNTRIES}
        stroked={true}
        filled={true}
        lineWidthMinPixels={2}
        opacity={0.4}
        getLineColor={[60, 60, 60]}
        getFillColor={[200, 200, 200]}
      />
      <TileLayer
        // tileSize={128}
        getTileData={async tile => {
          const {
            x,
            y,
            bbox: { north, east, south, west },
            signal
          } = tile;
          const wait = 2000;
          // console.log("waiting", wait); // eslint-disable-line no-console
          // return fetch(`https://cors-anywhere.herokuapp.com/https://postman-echo.com/delay/${wait}`);

          // Simulate a slow fetch
          // docker run --rm -it -p 7000:80 ealen/echo-server
          await fetch(
            `http://localhost:7000?echo_header=Access-Control-Allow-Origin:*&echo_time=${wait}&echo_body=x:${x},y=${y}`,
            { signal }
          );

          // Return a rectangle just inside the bounds of the tile
          return {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'MultiLineString',
                  coordinates: [
                    // top
                    [
                      [mid(west, east, 0.1), mid(north, south, 0.1)],
                      [mid(west, east, 0.9), mid(north, south, 0.1)]
                    ],
                    // right
                    [
                      [mid(west, east, 0.9), mid(north, south, 0.1)],
                      [mid(west, east, 0.9), mid(north, south, 0.9)]
                    ],
                    // bottom
                    [
                      [mid(west, east, 0.1), mid(north, south, 0.9)],
                      [mid(west, east, 0.9), mid(north, south, 0.9)]
                    ],
                    // left
                    [
                      [mid(west, east, 0.1), mid(north, south, 0.1)],
                      [mid(west, east, 0.1), mid(north, south, 0.9)]
                    ]
                  ]
                }
              }
            ]
          };
        }}
        renderSubLayers={props => {
          const {
            bbox: { west, south, east, north }
          } = props.tile;

          return [
            new GeoJsonLayer({
              id: `${props.id}-geometry`,
              data: props.data,
              pointRadiusUnits: 'pixels',
              getRadius: 5,
              getLineColor: [0, 0, 255],
              getFillColor: [0, 0, 255],
              getLineWidth: 2,
              lineWidthUnits: 'pixels'
            }),
            new PathLayer({
              id: `${props.id}-border`,
              data: [[[west, north], [west, south], [east, south], [east, north], [west, north]]],
              getPath: d => d,
              getColor: [255, 0, 0],
              getWidth: 3,
              widthUnits: 'pixels'
            })
          ];
        }}
      />
    </DeckGL>
  );
}

render(<Root />, document.body.appendChild(document.createElement('div')));
