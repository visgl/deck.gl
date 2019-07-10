/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {PathLayer} from '@deck.gl/layers';
import {GeoJsonLayer} from 'deck.gl';
import './style.css';

let _ = require('underscore');
// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

let sampleSize = 1;
const allPaths = require(`./inputs/paths_${sampleSize}pct.json`);
const orderedTps = ['OP1', 'AM', 'IP1', 'IP2', 'PM', 'IP3', 'OP2']; 
const elevenationStep = 1000;

let zones = require('./inputs/zones.json');

let data = {zones: zones, allPaths: allPaths};

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
      paths: this.props.data.allPaths,
      selectedZone: null
    };
  
    this._onSelectZone = this._onSelectZone.bind(this);
    this._filterPathsByProp = this._filterPathsByObjProp.bind(this);
  }

  componentDidMount() {    
    const {allPaths: allPaths = this.props.data.allPaths} = this.props;
    allPaths.forEach(path => { path.Segment = [[path.SourceX, path.SourceY,
                                                orderedTps.indexOf(path.Timeperiod) * elevenationStep + 10],
                                               [path.TargetX, path.TargetY,
                                                orderedTps.indexOf(path.Timeperiod) * elevenationStep + 10]] });
    this.setState({paths: allPaths});
  }

  _filterPathsByObjProp(paths, obj, prop) {
    if (obj) {
      let filteredpaths = Array();
      const filt = obj["properties"]["lsoa11cd"];
      filteredpaths = paths.filter(x => x[prop] === filt);
      this.setState({paths: filteredpaths})
    } else {
      this.setState({paths: this.props.data.allPaths})
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
    this._filterPathsByObjProp(this.props.data.allPaths, this.state.selectedZone, 'Source');
  }

  _renderLayers() {
    
    const {zones = this.props.data.zones} = this.props;

    return [
      new PathLayer({
        id: 'paths',
        data: this.state.paths,
        widthScale: 1,
        widthMinPixels: 1.2,
        getPath: d => d.Segment,
        getColor: d => getRgbFromStr(colorTps(orderedTps.indexOf(d.Timeperiod))),
        getWidth: d => d.Dailytrips,
      }),

      new GeoJsonLayer({
        id: 'boundaries',
        data: zones,
        //getFillColor: [255, 153, 51],
        stroked: true,
        filled: true,
        pickable: true,
        extruded: false,
        opacity: 0.05,
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
                mapStyle="mapbox://styles/mapbox/light-v10"
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
