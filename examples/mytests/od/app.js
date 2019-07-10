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

const allTrips = require('./inputs/trips.json')
const orderedTps = ['OP1', 'AM', 'IP1', 'IP2', 'PM', 'IP3', 'OP2'] 
const elevenationStep = 2000;

let zones = require('./inputs/zones.json');

let data = {zones: zones, allTrips: allTrips};

let colorTps = d3.scaleSequential()
                  .domain([0, orderedTps.length-1])
                  .interpolator(d3.interpolateGreens);

function getRgbFromStr(strRgb) {
  var color = d3.color(strRgb);
  return [color.r, color.g, color.b]  
}

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
      trips: this.props.data.allTrips,
      selectedZone: null
    };
  
    this._onSelectZone = this._onSelectZone.bind(this);
    this._filterTripsByProp = this._filterTripsByObjProp.bind(this);
  }

  componentDidMount() {    
    const {allTrips = this.props.data.allTrips} = this.props;
    allTrips.forEach(trip => { trip.Segment = [[trip.SourceX, trip.SourceY,
                                                orderedTps.indexOf(trip.Timeperiod) * elevenationStep + 10],
                                               [trip.TargetX, trip.TargetY,
                                                orderedTps.indexOf(trip.Timeperiod) * elevenationStep + 10]] });
    this.setState({trips: allTrips});
  }

  _filterTripsByObjProp(trips, obj, prop) {
    if (obj) {
      let filteredTrips = Array();
      const filt = obj["properties"]["lsoa11cd"];
      filteredTrips = trips.filter(x => x[prop] === filt);
      this.setState({trips: filteredTrips})
    } else {
      this.setState({trips: this.props.data.allTrips})
    }
    
  }

  _onSelectZone(object) {
    if (object.layer) {
      if (object.layer.id == 'boundaries') {
        this.setState({selectedZone: object.object})  
      }
    } else {
        this.setState({selectedZone: null})
    }
    this._filterTripsByObjProp(this.props.data.allTrips, this.state.selectedZone, 'Source');
  }

  _renderLayers() {
    
    const {zones = this.props.data.zones} = this.props;

    return [
      new PathLayer({
        id: 'trips',
        data: this.state.trips,
        widthScale: 1,
        widthMinPixels: 0.7,
        getPath: d => d.Segment,
        getColor: d => getRgbFromStr(colorTps(orderedTps.indexOf(d.Timeperiod))),
        getWidth: d => d.Dailytrips,
      }),

      new GeoJsonLayer({
        id: 'boundaries',
        data: zones,
        getFillColor: [255, 153, 51, 120],
        stroked: true,
        filled: true,
        pickable: true,
        extruded: false,
        opacity: 0.10,
        autoHighlight: true,
        highlightColor: [0, 255, 255],
        onClick: this._onSelectZone
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
            onClick={(object) => {this._onSelectZone(object)}}
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
