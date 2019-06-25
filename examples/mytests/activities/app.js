/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from 'deck.gl';
import Slider from '@material-ui/lab/Slider';
import './style.css';
 

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

let sampleSize = 1;
let actType = 'Other';
let animationSpeed = 500 // unit time per second

let simTime = 0;
let anchorTime = Date.now() / 1000;

let actsCntsData = require(`./inputs/activities_count_${sampleSize}pct.json`);
let zonesData = require('./inputs/zones.json');
let initActsCnt = actsCntsData[0];
let residents = Math.max(...Object.values(initActsCnt['Home']))

var colorsActs = d3.scaleSequential()
                   .domain(([0, residents]))
                   .interpolator(d3.interpolatePuRd);

let data = {zonesData: zonesData, actsCnts: actsCntsData};

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
  
function getCurrentActsCnt(curActsCnt, actType, zoneId) {
      return _.get(curActsCnt, `${actType}.${zoneId}`, 0);   
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
      time: 0,
      actsCntsTime: 0
    };

    this._renderTooltip = this._renderTooltip.bind(this);
    this._onHover = this._onHover.bind(this);
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
          <div>{_.get(this.props.data.actsCnts,`${this.state.actsCntsTime}.${actType}.${hoveredObject.properties.lsoa11cd}`, 0)}</div>
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

  _onTimerChange(evnt, newSimTime) {
    anchorTime = Date.now() / 1000;
    simTime = newSimTime
  };

  _animate() {
    const timestamp = Date.now() / 1000;
    this.setState({ 
      time: simTime + (timestamp - anchorTime) * this.props.animationSpeed
    }, () => this._updateActsCntTime(this.props.data.actsCnts, this.state.time));
    
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }
    
  _updateActsCntTime(actsCnts, curTime) {
    // Update the index of the actsCnts   
    for (const updTime of Object.keys(actsCnts)) {
      if (updTime > curTime) {
        this.setState({actsCntsTime: updTime});
        return;
    }
  }
}
  _renderLayers() {
    const {zones = this.props.data.zonesData,
           actsCnts = this.props.data.actsCnts,
           actType = this.props.actType
          } = this.props;
    
    return [
      new GeoJsonLayer({
        id: 'boundaries',
        //data:this.state.zones,
        data: zones,
        stroked: true,
        filled: true,
        pickable: true,
        extruded: false,
        getFillColor: d => getRgbFromStr(colorsActs(
                           _.get(actsCnts,`${this.state.actsCntsTime}.${actType}.${d.properties.lsoa11cd}`, 0))),
        

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
              animationSpeed={animationSpeed}/>,
              container);
}
