/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from 'deck.gl';
import {TripsLayer} from '@deck.gl/geo-layers';
import Input from '@material-ui/core/Input';
import Slider from '@material-ui/lab/Slider';
import './style.css';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

let sampleSize = 1;
let actType = 'Other';
let trailLength = 86400;
let animationSpeed = 500 // unit time per second

let simTime = 0;
let anchorTime = Date.now() / 1000;

let toursData = require(`./inputs/tours_${sampleSize}pct.json`);
let actsCntUpdsData = require(`./inputs/activities_count_${sampleSize}pct.json`);
let zonesData = require('./inputs/zones.json');
let trIds = Object.keys(toursData);
let initActsCnt = actsCntUpdsData[0];
let maxResidents = Math.max(...Object.values(initActsCnt['Home']))

var colorstours = d3.scaleSequential()
                  .domain(shuffle([...trIds]))
                  .interpolator(d3.interpolateRainbow);

var colorsActs = d3.scaleSequential()
                   .domain(([0, maxResidents]))
                   .interpolator(d3.interpolatePuRd);

let data = {zonesData: zonesData, tours: toursData, actsCnt: initActsCnt, actsCntUpds: actsCntUpdsData};

function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

function getRgbFromStr(strRgb) {
  var color = d3.color(strRgb);
  return [color.r, color.g, color.b]  
}
  
function getActsCnt(actsCnt, actType, zoneId) {
      return _.get(actsCnt, `${actType}.${zoneId}`, 0);   
}

function filterToursBySource(tours, zone, prop='Sources') {
  let filtered = Array();
  const filterZone = zone["properties"]["lsoa11cd"];
  filtered = tours.filter(x => x[prop][0] === filterZone);
  return filtered
}

function filterIncompleteTours(tours, currentTime, delay=10.1) {
  
  for (const tour of tours) {
    tour['Completed'] = false;
    if (tour.Segments[tour.Segments.length-1][2] < currentTime) {
      tour['Completed'] = true;
    }
  }
  //return filtered
  return tours
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

const material = new PhongMaterial({
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
});

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
      time: 0,
      tours: this.props.data.tours,
      selectedZone: null
    };

    this._filterTours = this._filterTours.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    
    this._onHover = this._onHover.bind(this);
    this._onSelectZone = this._onSelectZone.bind(this);
    this._onTimerChange = this._onTimerChange.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: y, left: x}}>
          <div>
            <b>ActCnt</b>
          </div>
          <div>{data.actsCnt[actType][hoveredObject.properties.lsoa11cd]}</div>
        </div>
      )
    );
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
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
    this._filterTours();
  }
  
  _onAnimationSpeedChange(evnt) {
    this.props.animationSpeed = evnt.target.value
  }

  _onTimerChange(evnt, newSimTime) {
    anchorTime = Date.now() / 1000
    simTime = newSimTime
  };

  _animate() {
    const timestamp = Date.now() / 1000;

    this.setState({ 
      time: simTime + (timestamp - anchorTime) * this.props.animationSpeed
    }, () => this._filterTours());
    
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }
    
  _updateActsCnt(actsCnt, actTypes, currentTime) {
    const {actsCntUpds = this.props.data.actsCntUpds} = this.props;

    for (const updTime of Object.keys(actsCntUpds)) {
      if (updTime > currentTime) {
        for (const actType of actTypes) {
          actsCnt[actType] = Object.assign(actsCnt[actType], actsCntUpds[updTime][actType])
        }
        break
      }
    }
    this.props.data.actsCnt = actsCnt
  }
  
  _filterTours() {
    const {allTours: allTours = this.props.data.tours} = this.props;
    
    // I should probably split tours and activities
    this._updateActsCnt(this.props.data.actsCnt, [actType], this.state.time)

    let filteredTours = allTours;
    let incompleteTours;
    let sourceTours;

    if (!allTours) {
      return;
    }
    
    incompleteTours = filterIncompleteTours(allTours, this.state.time);
    //incompleteTours = allTours;
    
    if (!this.state.selectedZone) {
      sourceTours = incompleteTours
    } else {
      sourceTours = filterToursBySource(allTours, this.state.selectedZone, 'Sources')
    }
    
    filteredTours = incompleteTours.filter(x => sourceTours.includes(x));
    this.setState({ tours: filteredTours });
  }

  _renderLayers() {
    const {zones = this.props.data.zonesData,
           actsCnt = this.props.data.actsCnt,
           trailLength = this.props.trailLength,
           actType = this.props.actType
          } = this.props;
    
    return [
      
      new TripsLayer({
        id: 'trips',
        data: this.state.tours,
        getPath: d => d.Segments,
        getColor: d => d.Completed ? [255, 0, 0] : getRgbFromStr(colorstours(d.Tourid)),
        opacity: 0.5,
        widthMinPixels: 2,
        rounded: false,
        trailLength,
        currentTime: this.state.time,
        pickable: false,
        autoHighlight: false,
        highlightColor: [0, 255, 255],
        transitions: {
          getColors: {
            duration: 2000,
            easing: d3.easeLinear,
            enter: value => [value[0], ]
          }
        }
      }),
      new GeoJsonLayer({
        id: 'boundaries',
        //data:this.state.zones,
        data: zones,
        stroked: true,
        filled: true,
        pickable: true,
        extruded: false,
        getFillColor: d => getRgbFromStr(colorsActs(getActsCnt(actsCnt, actType, d.properties.lsoa11cd))),
        opacity: 0.10,
        onClick: this._onSelectZone,
        onHover: this._onHover,
        updateTriggers: {
          getFillColor: this.state.time
        },
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
        
        <div className='timer'>
            ({this.state.time})
        </div>

        <div className='time-slider'>
          <Slider
            value={this.state.time}
            min={0}
            max={86400}
            onChange={this._onTimerChange}
          />
        </div>
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<App actType={actType} 
              data={data} 
              animationSpeed={animationSpeed}
              trailLength={trailLength}/>, container);
}
