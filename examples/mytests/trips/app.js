/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {TripsLayer} from '@deck.gl/geo-layers';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';
import './style.css';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

let sampleSize = 1;
let actType = 'Other';
let trailLength = 300;
let animationSpeed = 500 // unit time per second


let simTime2 = 0;
let anchorTime2 = 0;

let simTime = 0;
let anchorTime = Date.now() / 1000;
let completedTourColor = [255, 0, 0]
let incompleteTourColor = [255, 255, 0]

let toursData = require(`./inputs/tours_${sampleSize}pct.json`);
let zonesData = require('./inputs/zones.json');
let trIds = Object.keys(toursData);

var colorTours = d3.scaleSequential()
                  .domain(shuffle([...trIds]))
                  .interpolator(d3.interpolateRainbow);

let data = {zonesData: zonesData, tours: toursData};

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

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var text = " ";
    var hDisplay = h;
    var mDisplay = m 
    var sDisplay = s 
    if(hDisplay < 10){
      hDisplay = "0" + hDisplay  
    }
    if(mDisplay < 10){
      mDisplay = "0" + mDisplay 
    }
    if (hDisplay < 12){
      text = " am"
    }else{
      text = " pm"
    }
    if (hDisplay > 23){     
      hDisplay = "00"
      mDisplay = "00" 
      text = ""    
    }
    return hDisplay + ":" + mDisplay + text; 
}

function getRgbFromStr(strRgb) {
  var color = d3.color(strRgb);
  return [color.r, color.g, color.b]  
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
    if (tour.Timestamps[tour.Timestamps.length-1] < currentTime) {
      tour['Completed'] = true;
    }
  }
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
      trailLength: this.props.trailLength,
      tours: this.props.data.tours,
      selectedZone: null
    };

    this._filterTours = this._filterTours.bind(this);
    this._onHover = this._onHover.bind(this);
    this._onSelectZone = this._onSelectZone.bind(this);
    this._onTimerChange = this._onTimerChange.bind(this);
    this._ontrailLength = this._ontrailLength.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
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
  
  _onTimerChange(evnt, newSimTime) {
    anchorTime = Date.now() / 1000
    simTime = newSimTime
  };

  _ontrailLength(evnt, newTrailLength) {    
    this.setState({trailLength: newTrailLength})
  };

  _animate() {
    const timestamp = Date.now() / 1000;

    this.setState({ 
      time: simTime + (timestamp - anchorTime) * this.props.animationSpeed
    }, () => this._filterTours());
    
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }
    
  _filterTours() {
    const {allTours: allTours = this.props.data.tours} = this.props;
    
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
    
    return [
      new TripsLayer({
        id: 'trips',
        data: this.state.tours,
        getPath: d => d.Segments,
        getTimestamps: d => d.Timestamps,
        //getColor: d => d.Completed ? completedTourColor : incompleteTourColor, //getRgbFromStr(colorstours(d.Tourid)),
        getColor: d => getRgbFromStr(colorTours(d.Tourid)),
        billboard: true,
        opacity: 0.5,
        widthMinPixels: 2,
        rounded: false,
        trailLength: this.state.trailLength,
        currentTime: this.state.time,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 255]
      }),
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
        
        <div className='timer'> Time: {secondsToHms(Math.floor(this.state.time))}</div>

        <div className='trailLength'>
        <Typography id="range-slider" gutterBottom>
        TrailLength
         </Typography>
          <Slider
            value={this.state.trailLength}
            min={0}
            max={86400}
            onChange={this._ontrailLength}
            aria-labelledby="range-slider"
          />
        </div>

        <div className='timer2'>Trail-Length: {this.state.trailLength}</div>

        <div className='time-slider'>
        <Typography id="range-slider" gutterBottom>
        Time-Slider
         </Typography>
          <Slider
            value={this.state.time}
            min={0}
            max={86400}
            onChange={this._onTimerChange}
            aria-labelledby="range-slider"
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
