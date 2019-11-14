import React, {PureComponent, Fragment} from 'react';
import DeckGL from '@deck.gl/react';
import {AmbientLight, DirectionalLight, LightingEffect} from '@deck.gl/core';
import {StaticMap} from 'react-map-gl';
import {SolidPolygonLayer} from '@deck.gl/layers';
import WBOITLayer from './wboit-layer/wboit-layer';

const INITIAL_VIEW_STATE = {
  latitude: 37.78,
  longitude: -122.45,
  zoom: 12,
  bearing: 60,
  pitch: 60
};

const data = [
  {
    type: 'Feature',
    properties: {
      elevation: 1000,
      fillColor: [200, 0, 0]
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-122.48027965423081, 37.829867098561465, 2000],
          [-122.47809493799619, 37.81005779676214, 2000],
          [-122.47558250383605, 37.81012990109551, 2000],
          [-122.47793275748633, 37.83010787870729, 2000],
          [-122.48027965423081, 37.829867098561465, 2000]
        ]
      ]
    }
  },
  {
    type: 'Feature',
    properties: {
      elevation: 2500,
      fillColor: [200, 0, 0]
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-122.4807592721423, 37.83148659090809],
          [-122.48042337175899, 37.830085010427176],
          [-122.47769563278436, 37.83049279439961],
          [-122.47803148135057, 37.83189437487894],
          [-122.4807592721423, 37.83148659090809]
        ]
      ]
    }
  },
  {
    type: 'Feature',
    properties: {
      elevation: 2500,
      fillColor: [200, 0, 0]
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-122.47796926383656, 37.809650033000324],
          [-122.47796926383656, 37.80803536584605],
          [-122.47501561198487, 37.80803532897342],
          [-122.47501554739789, 37.80964999612554],
          [-122.47796926383656, 37.809650033000324]
        ]
      ]
    }
  }
];

export default class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      opacity: 0.5,
      wireframe: true,
      lightMode: 2,
      wboit: true
    };
  }

  render() {
    const {opacity, wireframe, lightMode, wboit} = this.state;

    let material = true;
    let lightingEffect = new LightingEffect();

    if (lightMode === 2) {
      // Ambient Light only / Flat
      material = {
        ambient: 1.0,
        diffuse: 0.0,
        shininess: 32,
        specularColor: [255, 255, 255]
      };

      lightingEffect = new LightingEffect({
        light1: new AmbientLight({
          color: [255, 255, 255],
          intensity: 1.0
        })
      });
    } else if (lightMode === 3) {
      // Single Directional
      material = {
        ambient: 0.5,
        diffuse: 0.5,
        shininess: 32,
        specularColor: [255, 255, 255]
      };

      lightingEffect = new LightingEffect({
        light1: new AmbientLight({
          color: [255, 255, 255],
          intensity: 1.0
        }),
        light2: new DirectionalLight({
          color: [255, 255, 255],
          intensity: 1.0,
          direction: [1, 1, 0]
        })
      });
    }

    const options = {
      data,
      getPolygon: f => f.geometry.coordinates,
      getFillColor: f => f.properties.fillColor,
      getLineColor: f => [0, 0, 0, 255],
      getElevation: f => f.properties.elevation,
      pickable: false,
      extruded: true,
      opacity,
      wireframe,
      material
    };

    const layers = [];
    if (wboit) {
      layers.push(new WBOITLayer({id: 'WBOITLayer', ...options}));
    } else {
      layers.push(new SolidPolygonLayer({id: 'SolidPolygonLayer', ...options}));
    }

    const mkButton = (label, name, value) => (
      <button
        style={{fontWeight: this.state[name] === value ? 'bold' : 'normal'}}
        onClick={e => this.setState({[name]: value})}
      >
        {label}
      </button>
    );

    return (
      <Fragment>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          effects={[lightingEffect]}
          layers={layers}
        >
          <StaticMap />
        </DeckGL>
        <div style={{position: 'fixed'}}>
          {mkButton('Opacity 25%', 'opacity', 0.25)}
          {mkButton('Opacity 50%', 'opacity', 0.5)}
          {mkButton('Opacity 75%', 'opacity', 0.75)}
          {mkButton('Opacity 100%', 'opacity', 1.0)}

          {mkButton('Wireframe ON', 'wireframe', true)}
          {mkButton('Wireframe OFF', 'wireframe', false)}

          {mkButton('Default Light', 'lightMode', 1)}
          {mkButton('Flat Light', 'lightMode', 2)}
          {mkButton('Single Light', 'lightMode', 3)}

          {mkButton('WBOITLayer', 'wboit', true)}
          {mkButton('SolidPolygonLayer', 'wboit', false)}
        </div>
      </Fragment>
    );
  }
}
