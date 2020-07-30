/* eslint-env browser */
import React from 'react';
import { render } from 'react-dom';
import DeckGL, { GeoJsonLayer, ArcLayer, TileLayer, PathLayer } from 'deck.gl';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 0
};

function mid(a, b, portion) {
  return a + (portion * (b - a));
}

function Root() {
  const onClick = info => {
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
    }
  };

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
          const { x, y, bbox: { north, east, south, west }, signal } = tile;
          const wait = 2000;
          // Math.round((Math.random() * 8) + 2);
          // console.log("waiting", wait); // eslint-disable-line no-console
          // return fetch(`https://cors-anywhere.herokuapp.com/https://postman-echo.com/delay/${wait}`);
          // return new Promise(resolve => setInterval(resolve, wait));

          // docker run --rm -it -p 7000:80 ealen/echo-server
          await fetch(`http://localhost:7000?echo_header=Access-Control-Allow-Origin:*&echo_time=${wait}&echo_body=x:${x},y=${y}`, { signal });

          return {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  // type: 'Point',
                  // coordinates: [(east + west) / 2, (north + south) / 2]

                  type: 'MultiLineString',
                  coordinates: [
                    // top
                    [
                      [mid(west, east, .1), mid(north, south, .1)],
                      [mid(west, east, .9), mid(north, south, .1)]
                    ],
                    // right
                    [
                      [mid(west, east, .9), mid(north, south, .1)],
                      [mid(west, east, .9), mid(north, south, .9)]
                    ],
                    // bottom
                    [
                      [mid(west, east, .1), mid(north, south, .9)],
                      [mid(west, east, .9), mid(north, south, .9)]
                    ],
                    // left
                    [
                      [mid(west, east, .1), mid(north, south, .1)],
                      [mid(west, east, .1), mid(north, south, .9)]
                    ]

                    //   [west, south],
                    //   [east, south],
                    //   [east, north],
                    //   [west, north],
                    // ]
                  ]
                }
              }
            ]
          }
        }}

        renderSubLayers={(props) => {
          const {
            bbox: { west, south, east, north },
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
              lineWidthUnits: 'pixels',
            }),
            new PathLayer({
              id: `${props.id}-border`,
              data: [
                [
                  [west, north],
                  [west, south],
                  [east, south],
                  [east, north],
                  [west, north],
                ],
              ],
              getPath: (d) => d,
              getColor: [255, 0, 0],
              getWidth: 3,
              widthUnits: 'pixels',

            }),
          ];
        }}
      />

    </DeckGL>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
