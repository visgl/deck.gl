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
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import {GradientDefs, AreaSeries  } from 'react-vis';
// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";
const marks = [{value: 0,},{value: 3600/4,},{value: 3600/2,},{value: (3600/2)+(3600/4),},{value: 3600,},];
const marks2 = [{value: 0,},{value: (86400/4),},{value: (86400/2),},{value: (86400/2)+(86400/4),},{value: 86400,},];
const iOSBoxShadow =  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';
const IOSSlider = withStyles({ root: { color: '#3880ff', height: 2, padding: '5px 0',},
  thumb: { height: 28,width: 28, backgroundColor: '#fff', boxShadow: iOSBoxShadow, marginTop: -14, marginLeft: -14,
    '&:focus,&:hover,&$active': { boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': { boxShadow: iOSBoxShadow, }, }, },active: {},
  valueLabel: {left: 'calc(-50% + 11px)', top: -22,'& *': { background: 'transparent', color: '#fff', },}, track: {height: 2,},rail: { height: 2, opacity: 0.5,
   backgroundColor: '#fff', }, mark: { backgroundColor: '#fff', height: 8, width: 1, marginTop: -3,},markActive: { backgroundColor: 'currentColor',},})(Slider);
let sampleSize = 1;
let actType = 'Other';
let variable = 0;
let pause = true;
let animationSpeed = 1000;
let animationSpeed2 = 1000;
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
      animationSpeed: animationSpeed,
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
     console.log(object);
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
    this.setState({animationSpeed: newAnimationSpeed});
    animationSpeed2 = newAnimationSpeed;
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

  _onPause(){    
    if (pause){ 
      animationSpeed = 0;
      pause = false;
      this.setState({animationSpeed: 0});
    }else{
      pause = true;   
      this.setState({animationSpeed: animationSpeed2});
      animationSpeed = animationSpeed2;
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
            {x: variable, y: variable},
            {x: 2, y: 25},
            {x: 2, y: variable},
            {x: variable, y: 10},
            {x: 3, y: variable}
          ]}/>
      </XYPlot>
      
      </div>}
    </div>

    <div className='timer2'>

        <div className='text2'>Bristol City:</div>

         <div>{secondsToHms(Math.floor(this.state.simTime))}</div>
         <div>
          <Typography id="range-slider" gutterBottom></Typography>
            <IOSSlider aria-label="iOS slider"
              value={this.state.simTime}
              min={0}
              max={86400}
              marks={marks2}
              onChange={this._onTimerChange}
              aria-labelledby="range-slider"
             />
          </div>

        <div>AnimationSpeed</div>
        <span className="example"></span>
        <div>
          <Typography id="range-slider" gutterBottom></Typography>
            <IOSSlider aria-label="iOS slider"
              value={Math.round(this.state.animationSpeed, 0)}
              min={0}
              max={3600}
              step = {20}
              valueLabelDisplay="on"
              marks={marks}
              onChange={this._onAnimationSpeedChange}
              aria-labelledby="range-slider"
           />
          </div>     

        <div>Trail-Length</div>
        <span className="example"></span>
        <div>
        <Typography id="range-slider" gutterBottom></Typography>
          <IOSSlider aria-labelledby="discrete-slider-small-steps"
            value={this.state.trailLength}
            valueLabelDisplay="on"
            min={0}
            max={86400}
            step = {20}
            marks={marks2}
            onChange={this._onTrailLengthChange}
            aria-labelledby="range-slider"
          />
        </div>
     
      <button
        className="bnt_Pause"       
        onClick={this._onPause}>Pause / Play</button>

      <button
        className="btn_Restart"        
        onClick={this._onRestart}>Restart Script</button>   
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
