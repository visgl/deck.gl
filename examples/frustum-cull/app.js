/* eslint-disable no-continue */
/* global requestAnimationFrame, cancelAnimationFrame */

import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {SimpleMeshLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import {SphereGeometry} from '@luma.gl/core';
import {Vector3} from 'math.gl';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 7,
  bearing: 0,
  pitch: 0
};

const position = [-0.4531566, 51.4709959, 100000];
const radius = 10000;
const testPosition = new Vector3();

class Root extends Component {
  constructor(props) {
    super(props);
    this.deckRef = React.createRef();
    this.animationLoop = null;
    this.state = {
      cullStatus: 'IN'
    };

    this.statusStyle = {
      position: 'absolute',
      right: '10px',
      top: '10px',
      padding: '10px',
      background: 'white',
      border: '1px solid black'
    };

    this.loop = this.loop.bind(this);
  }

  componentDidMount() {
    this.animationLoop = requestAnimationFrame(this.loop);
  }

  loop() {
    if (this.deckRef.current.viewports) {
      const viewport = this.deckRef.current.viewports[0];

      // Culling tests must be done in common space
      const commonPosition = viewport.projectPosition(position);

      // Extract frustum planes based on current view.
      const frustumPlanes = viewport.getFrustumPlanes();
      let out = false;
      let outDir = null;
      for (const dir in frustumPlanes) {
        const plane = frustumPlanes[dir];
        if (plane.d === undefined) {
          continue;
        }

        if (testPosition.copy(commonPosition).dot(plane.n) > plane.d) {
          out = true;
          outDir = dir;
          break;
        }
      }

      this.setState({cullStatus: out ? `OUT (${outDir})` : 'IN'});
    }

    this.animationLoop = requestAnimationFrame(this.loop);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationLoop);
  }

  render() {
    return (
      <DeckGL
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        ref={this.deckRef}
        _animate={true}
      >
        <StaticMap key="map" mapStyle="mapbox://styles/mapbox/light-v9" />
        <SimpleMeshLayer
          id="mesh"
          data={[position.slice(0, 2)]}
          mesh={new SphereGeometry({radius})}
          getPosition={p => p}
          getTranslation={[0, 0, position[2]]}
          getColor={[255, 0, 0]}
        />
        <div style={this.statusStyle}>Culling Status: {this.state.cullStatus}</div>
      </DeckGL>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
