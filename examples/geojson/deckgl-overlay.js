import React, {Component} from 'react';
import DeckGL, {COORDINATE_SYSTEM,ScatterplotLayer,WebMercatorViewport} from 'deck.gl';
import {point} from '@turf/helpers';
import turfDistance from '@turf/distance';

const LIGHT_SETTINGS = {
  lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
  ambientRatio: 0.2,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: 37.775516,
      longitude: -122.418222,
      zoom: 14,
      maxZoom: 20,
      pitch: 0,
      bearing: 0
    };
  }

  render() {
    const {viewport, data, colorScale} = this.props;

    if (!data) {
      return null;
    }

    const deckGlViewport = new WebMercatorViewport(viewport);

    const target = [-122.418222, 37.775516];

    const lfp64=new ScatterplotLayer({
      id: 'lfp64',
      data: [{position: target, radius: 20, color: [0, 255, 0]}],
      fp64: true,
      opacity: 0.5
    });

    const origin = [-122, 37];

    function turfDistanceX([a,b],[c,d]) {
      return -turfDistance(point([a,b]), point([c,b]));
    }

    function turfDistanceY([a,b],[c,d]) {
      return turfDistance(point([a,b]), point([a,d]));
    }

    const distanceX = 1000 * turfDistanceX(origin, target);
    const distanceY = 1000 * turfDistanceY(origin, target);

    const offset1 = [distanceX, distanceY];
    const offset2 = deckGlViewport.lngLatDeltaToMeters([target[0]-origin[0], target[1]-origin[1]]);

    console.log("offset using turf >>>", offset1);
    console.log("offset using deck >>>", offset2);

    const relativeScatterplot=new ScatterplotLayer({
      id: 'relativeScatterplot',
      data: [
        {position: [0,0], radius: 200, color: [0, 0, 0]},
        {position: offset1, radius: 10, color: [0, 0, 255]},
        {position: offset2, radius: 10, color: [255, 0, 0]}
      ],
      fp64: true,
      opacity: 0.5,

      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: origin
    });

    return (
      <DeckGL {...viewport} layers={ [lfp64, relativeScatterplot] } initWebGLParameters />
    );
  }
}
