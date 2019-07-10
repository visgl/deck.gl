/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from 'deck.gl';
import {TripsLayer} from '@deck.gl/geo-layers';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';
import './style.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import {GradientDefs, AreaSeries  } from 'react-vis';
// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

let sampleSize = 1;
let actType = 'Other';
let variable = 0;
let pause = true;

let prevSimTime = Date.now() / 1000;

let simAnchorTime = 0;
let anchorTime = Date.now() / 1000;

let toursData = require(`./inputs/tours_${sampleSize}pct.json`);
let zonesData = require('./inputs/zones.json');
let trIds = Object.keys(toursData);

var colorTours = d3.scaleSequential()
                  .domain(shuffle([...trIds]))
                  .interpolator(d3.interpolateRainbow);

let data = {zones: zonesData, tours: toursData};

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
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    //let s = Math.floor(d % 3600 % 60);
    if (h < 24) {
      return  "Time: " + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') 
    } else {
      return 'Simulation finished'
    }    
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
      simTime: 0,
      animationSpeed: 100,
      trailLength: 100,
      tours: this.props.data.tours,
      isHovering: false,
      selectedZone: null
    };

    this._onHover = this._onHover.bind(this);
    this._onSelectZone = this._onSelectZone.bind(this);
    this._onTimerChange = this._onTimerChange.bind(this);
    this._onAnimationSpeedChange = this._onAnimationSpeedChange.bind(this);
    this._onTrailLengthChange = this._onTrailLengthChange.bind(this);
    this._onRestart = this._onRestart.bind(this);
    this._onPause = this._onPause.bind(this);
    this.handleMouseHover = this.handleMouseHover.bind(this);

    this._filterTours = this._filterTours.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  handleMouseHover(object) {
    this.setState(this.toggleHoverState);
     variable = object.index;
  }

  toggleHoverState(state) {
    return {
      isHovering: !state.isHovering,
    };
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
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
    this.setState({simTime: newSimTime})
  };

  _onAnimationSpeedChange(evnt, newAnimationSpeed){
    this.setState({animationSpeed: newAnimationSpeed})
  };

  _onTrailLengthChange(evnt, newTrailLength) {    
    this.setState({trailLength: newTrailLength})
  };

  _animate() {

    const timestamp = Date.now() / 1000;    

    this.setState({ 
      simTime: this.state.simTime + (timestamp - prevSimTime) * this.state.animationSpeed
    });
    prevSimTime = Date.now() / 1000;
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
    
    incompleteTours = filterIncompleteTours(allTours, this.state.simTime);
    
    if (!this.state.selectedZone) {
      sourceTours = incompleteTours
    } else {
      sourceTours = filterToursBySource(allTours, this.state.selectedZone, 'Sources')
    }
    
    filteredTours = incompleteTours.filter(x => sourceTours.includes(x));
    this.setState({ tours: filteredTours });
  }

  _onPause() {
    if (pause) {
      pause = false;
      this.setState({animationSpeed: 0});
    } else {
      pause = true;
      // reads the value 
      this._onTimerChange
    }
  };

_onRestart(evnt){
  window.location.reload(false);
};

  _renderLayers() {
    
    const {zones = this.props.data.zones} = this.props;

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
        currentTime: this.state.simTime,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 255],
      }),
      new GeoJsonLayer({
        id: 'boundaries',
        data: zones,
        stroked: true,
        filled: true,
        pickable: true,
        extruded: false,
        opacity: 0.10,
        onClick: this._onSelectZone,
        onHover: this.handleMouseHover,
        updateTriggers: {
          getFillColor: this.state.simTime
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
                //streets-v9 dark-v9  light-v10
                preventStyleDiffing={true}
                mapboxApiAccessToken={MAPBOX_TOKEN}
              />
            )}
            {this._renderTooltip}        
          </DeckGL>
        </div>
        //MapboxAccess.ClearCache() 

      <div className="graph">
        <div
          onMouseEnter={this.handleMouseHover}
          onMouseLeave={this.handleMouseHover}
        >         
        </div>
        {this.state.isHovering &&
     <div> 
      <XYPlot width={300} height={300}>
        <GradientDefs>
          <linearGradient id="CoolGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="red" stopOpacity={0.7} />
          </linearGradient>
        </GradientDefs>
        <AreaSeries
          color={'url(#CoolGradient)'}
          data={[
            {x: variable, y: variable, y0: 1},
            {x: 2, y: 25, y0: 5},
            {x: 2, y: variable, y0: 5},
            {x: variable, y: 10, y0: 6},
            {x: 3, y: variable, y0: 3}
          ]}/>
      </XYPlot>
      
      </div>}
    </div>


    <div className='timer2'>
        <div className='text2'>Bristol City:</div>

        <div>AnimationSpeed: {this.state.animationSpeed}</div>
        <div>
          <Typography id="range-slider" gutterBottom>        
           </Typography>
            <Slider
              value={Math.round(this.state.animationSpeed, 0)}
              min={0}
              max={3600}
              onChange={this._onAnimationSpeedChange}
              aria-labelledby="range-slider"
           />
          </div>

        <div>{secondsToHms(Math.floor(this.state.simTime))}</div>
         <div>
          <Typography id="range-slider" gutterBottom>        
           </Typography>
            <Slider
              value={this.state.simTime}
              min={0}
              max={86400}
              onChange={this._onTimerChange}
              aria-labelledby="range-slider"
             />
          </div>

        <div>Trail-Length: {parseInt(this.state.trailLength)}</div>
        <div className='text3'></div>

        <div>
        <Typography id="range-slider" gutterBottom>      
         </Typography>
          <Slider
            value={this.state.trailLength}
            min={0}
            max={86400}
            onChange={this._onTrailLengthChange}
            aria-labelledby="range-slider"
          />
        </div>

       <button
        className="btn_restart"        
        onClick={this._onRestart}>restart script</button>   
     
      <button
        className="btn_pause"       
        onClick={this._onPause}>Pause / Play</button>
    </div>
          
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<App actType={actType} 
              data={data} 
          />, container)
}
