/* global window */
import React, {Component} from 'react';
import Popup from "reactjs-popup";
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
import { RadialChart, GradientDefs, Hint, AreaSeries  } from 'react-vis';
import {Sunburst} from 'react-vis';
// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

let sampleSize = 1;
let actType = 'Other';
let trailLength = 300;
let animationSpeed = 1000; // unit time per second
let variable = 0;
let pause = true;
let animationSpeed2 = 0;
let simTime = 0;
let anchorTime = Date.now() / 1000;
//let completedTourColor = [255, 0, 0]
//let incompleteTourColor = [255, 255, 0]

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
      animationSpeed: this.props.animationSpeed,
      trailLength: this.props.trailLength,
      tours: this.props.data.tours,
      isHovering: false,
      selectedZone: null
    };

    this._filterTours = this._filterTours.bind(this);
    this._onHover = this._onHover.bind(this);
    this._onSelectZone = this._onSelectZone.bind(this);
    this._onTimerChange = this._onTimerChange.bind(this);
    this._onanimationSpeed = this._onanimationSpeed.bind(this);
    this._ontrailLength = this._ontrailLength.bind(this);
    this._onRestart = this._onRestart.bind(this);
    this._onPause = this._onPause.bind(this);
    this.handleMouseHover = this.handleMouseHover.bind(this);
  }


  handleMouseHover(object) {
    this.setState(this.toggleHoverState);
    //console.log(object);
     variable = object.index;
    //console.log("handleMouseHover");
  }

  toggleHoverState(state) {
    //console.log("hanver2");
    return {
      isHovering: !state.isHovering,
    };
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
     //let url = './graph.html';
    // let windowName =  "test";  
    if (object.layer) {
      if (object.layer.id == 'boundaries') {
        this.setState({selectedZone: object.object})  
        //newwindow=window.open(url,windowName,'height=400, width=400');
        //if (window.focus) {
        //  newwindow.focus()
        //}
    return false;  
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

  _onanimationSpeed(evnt, newanimationSpeed){
    this.setState({animationSpeed: newanimationSpeed})
    animationSpeed = newanimationSpeed;

  };

  _onPause(evnt, newSimTime){
    
    if (pause){
      animationSpeed2 = animationSpeed;
      animationSpeed = 0;
      pause = false;

    }else{
      pause = true;
      animationSpeed = animationSpeed2;
    }

};


  _onRestart(evnt, newSimTime){
    window.location.reload(false);
  };


  _ontrailLength(evnt, newTrailLength) {    
    this.setState({trailLength: newTrailLength})
  };

  _animate() {
    const timestamp = Date.now() / 1000;

    
  
    this.setState({ 
      time: simTime + (timestamp - anchorTime) * animationSpeed
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
        currentTime: this.state.time,
        animationSpeed: this.state.animationSpeed,
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
              value={this.state.animationSpeed}
              min={0}
              max={1000}
              onChange={this._onanimationSpeed}
              aria-labelledby="range-slider"
           />
          </div>



        <div>{secondsToHms(Math.floor(this.state.time))}</div>
         <div>
          <Typography id="range-slider" gutterBottom>        
           </Typography>
            <Slider
              value={this.state.time}
              min={0}
              max={86400}
              onChange={this._onTimerChange}
              aria-labelledby="range-slider"
           />
          </div>


        <div>Trail-Length: {this.state.trailLength}</div>
        <div className='text3'></div>

        <div>
        <Typography id="range-slider" gutterBottom>      
         </Typography>
          <Slider
            value={this.state.trailLength}
            min={0}
            max={86400}
            onChange={this._ontrailLength}
            aria-labelledby="range-slider"
          />
        </div>

       
       <button
        className="button"        
        onClick={this._onRestart}>restart script</button>   
     
      <button
        className="button2"       
        onClick={this._onPause}>Pause / Play</button>


    </div>

          
      </div>
    );


  }
}

export function renderToDOM(container) {
  render(<App actType={actType} 
              data={data} 
              animationSpeed={animationSpeed}
              trailLength={trailLength}/>, container)
}
