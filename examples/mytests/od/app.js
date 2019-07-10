/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {PathLayer} from '@deck.gl/layers';
import {GeoJsonLayer} from 'deck.gl';
import Slider from '@material-ui/lab/Slider';
import './style.css';

let _ = require('underscore');
// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

const orderedTps = ['OP1', 'AM', 'IP1', 'IP2', 'PM', 'IP3', 'OP2'] 
const elevenationStep = 1000;

let zones = require('./inputs/zones.json');
let od = require('./inputs/od.json');
let coords = require('./inputs/coords.json');

let data = {zones: zones, od: od, coords: coords};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

export const INITIAL_VIEW_STATE = {
  longitude: -2.50, //-2.5893897,
  latitude: 51.45,// 51.4516883,
  zoom: 10,
  pitch: 45,
  bearing: 0
};

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trips: null
    };
  }

  componentDidMount() {    
    
    const {coords = this.props.data.coords,
           od = this.props.data.od} = this.props;

    let zoneCoords;
    let trips;
    trips = _.map(od, function(trip){ 
      zoneCoords = _.find(coords, function(zone){ return zone.BoundaryId == trip.Source });
      trip.SourceX = zoneCoords.X
      trip.SourceY = zoneCoords.Y
      return trip; 
    })

    trips = _.map(od, function(trip){ 
      zoneCoords = _.find(coords, function(zone){ return zone.BoundaryId == trip.Target });
      trip.TargetX = zoneCoords.X
      trip.TargetY = zoneCoords.Y
      return trip; 
    })
    
    trips.forEach(trip => { trip.Segment = [[trip.SourceX, trip.SourceY,
                                             orderedTps.indexOf(trip.Timeperiod) * elevenationStep + 10],
                                            [trip.TargetX, trip.TargetY,
                                             orderedTps.indexOf(trip.Timeperiod) * elevenationStep + 10]] });
    
    this.setState({trips: trips});

  }

  componentWillUnmount() {

  }

  _renderLayers() {
    
    const {zones = this.props.data.zones} = this.props;

    return [
      new PathLayer({
        id: 'od',
        data: this.state.trips,
        getPath: d => d.Segment,
        pickable: true,
        widthMinPixels: 2,
        getColor: [255, 255, 0],
        getWidth: 1,
      }),

      new GeoJsonLayer({
        id: 'boundaries',
        data: zones,
        stroked: true,
        filled: true,
        pickable: true,
        extruded: false,
        opacity: 0.10,
        autoHighlight: true,
        highlightColor: [0, 255, 255]
      })
    ];
  }
  
  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <div>
        <div>
          <DeckGL
            layers={this._renderLayers()}
            effects={[lightingEffect]}
            initialViewState={INITIAL_VIEW_STATE}
            viewState={viewState}
            controller={controller}
            onClick={(object) => { this._onSelectZone(object)}}
          >
            {baseMap && (
              <StaticMap
                reuseMaps
                mapStyle="mapbox://styles/mapbox/dark-v9"
                preventStyleDiffing={true}
                mapboxApiAccessToken={MAPBOX_TOKEN}
              />
            )}
            {this._renderTooltip}        
          </DeckGL>
        </div>
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<App data={data} />, container);
}
