import React, { Fragment, useEffect, useState } from 'react';
import {render} from 'react-dom';
import DeckGL, {GeoJsonLayer, BitmapLayer, SpriteLayer} from 'deck.gl';
import tilebelt from 'tilebelt';

// Test tile
// https://gateway.api.globalfishingwatch.org/v1/4wings/tile/heatmap/2/1/1?proxy=true&format=intArray&temporal-aggregation=false&interval=10days&datasets[0]=public-global-fishing-effort:v20201001&datasets[1]=public-bra-onyxsat-fishing-effort:v20211126,public-chile-fishing-effort:v20211126,public-costa-rica-fishing-effort:v20211126,public-ecuador-fishing-effort:v20211126,public-indonesia-fishing-effort:v20200320,public-panama-fishing-effort:v20211126,public-peru-fishing-effort:v20211126&&

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 50,
  longitude: -78,
  zoom: 2,
  bearing: 0,
  pitch: 0
};

const bounds =  tilebelt.tileToBBOX([1,1,2])
const bounds2 =  tilebelt.tileToBBOX([1,2,2])

const LOOP_LENGTH = 18

const CONTROL_PANEL_STYLE = {
    position: 'fixed',
    top: 20,
    left: 20,
    padding: 20,
    fontSize: 13,
    background: '#fff'
  };

function Root() {
//   const onClick = info => {
//     if (info.object) {
//       // eslint-disable-next-line
//       alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
//     }
//   };

    const [time, setTime] = useState(0);
    const [paused, setPaused] = useState(false);
    const [animation] = useState({});

    const animate = () => {
        setTime(t => (t+1) % LOOP_LENGTH);
        animation.id = window.requestAnimationFrame(animate);
    };
    useEffect(() => {
        if (!paused) animation.id = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(animation.id);
      }, [animation, paused]);



  return (
      <Fragment>
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
            <BitmapLayer
                id="bitmap-layer"
                bounds={bounds2}
                image="mummy.png"
                animationCurrentFrame={time}
                animationNumCols={5}
                animationNumRows={5}
                />
            <SpriteLayer
                id="sprite-layer"
                bounds={bounds}
                image="mummy.png"
                animationCurrentFrame={time}
                animationNumCols={5}
                animationNumRows={5}
                />
        </DeckGL>
        <div style={CONTROL_PANEL_STYLE}>
            <button onClick={() => setPaused(!paused)}>play/pause</button>
        </div>
      </Fragment>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
