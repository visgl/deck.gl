/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from 'deck.gl';
import {TripsLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

let actType = 'Other';
let trailLength = 86400;
let animationSpeed = 900 // unit time per second

const startTime = Date.now() / 1000

let trsData = require('./inputs/tours.json');
let zonesData = require('./inputs/zones.json');
let actsCntUpdsData = require('./inputs/activities_count.json');
let trIds = Object.keys(trsData);
let initActsCnt = actsCntUpdsData[0];
let maxResidents = Math.max(...Object.values(initActsCnt['Home']))

var colorsTrs = d3.scaleSequential()
                  .domain(shuffle([...trIds]))
                  .interpolator(d3.interpolateRainbow);

var colorsActs = d3.scaleSequential()
                   .domain(([0, maxResidents]))
                   .interpolator(d3.interpolatePuRd);

let data = {zonesData: zonesData, trs: trsData, actsCnt: initActsCnt, actsCntUpds: actsCntUpdsData};

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

function getZoneIds(zonesDataFeats, idName='lsoa11cd'){
  let zoneIds = new Set()
  for (const [k, f] of Object.entries(zonesDataFeats)) {
    zoneIds.add(f.properties[idName])
  }
  zoneIds = Array.from(zoneIds);
  return zoneIds
}

function getRgbFromStr(strRgb) {
  var color = d3.color(strRgb);
  return [color.r, color.g, color.b]  
}
  
function getActsCnt(actsCnt, actType, zoneId) {
      return _.get(actsCnt, `${actType}.${zoneId}`, 0);   
}

function filterBySourceZone(trs, zone, prop='Sources') {
  let filtered = Array()
  for (const [trid, attrs] of Object.entries(trs)) {
    if (attrs[prop][0] === zone["properties"]["lsoa11cd"]) {
      filtered.push(trs[trid])
    }
  }
  return filtered
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
      trs: data.trs,
      selectedZone: null
    };

    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._onSelectZone = this._onSelectZone.bind(this);
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

  _onSelectZone({object}) {
    if (!object) {
      this.state.selectedZone = null;
    }
    this._recalculateTrs(object);
  }
  
  _animate() {
    const {
      
    } = this.props;
    const timestamp = Date.now() / 1000;

    this.setState({ 
      time: (timestamp - startTime) * this.props.animationSpeed
    }, () => this._updateActsCnt(this.props.data.actsCnt, [actType], this.state.time));
    
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
  
  _recalculateTrs(selectedZone) {
    const {allTrs = this.props.data.trs} = this.props;
    
    if (!allTrs) {
      return;
    }
    
    if (!selectedZone) {
      var filtTrs = allTrs
    } else {
      var filtTrs = filterBySourceZone(allTrs, selectedZone, 'Sources')
    }

    //const {lsoa11cd} = selectedZone.properties;

    //if (this.props.onSelectZone) {
    //  this.props.onSelectZone(selectedZone);
    //}

    this.setState({trs: filtTrs, selectedZone: selectedZone });

  }

  _renderLayers() {
    const {zones = this.props.data.zonesData,
           actsCnt = this.props.data.actsCnt,
           trailLength = this.props.trailLength,
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
        getFillColor: d => getRgbFromStr(colorsActs(getActsCnt(actsCnt, actType, d.properties.lsoa11cd))),
        opacity: 0.10,
        onClick: this._onSelectZone,
        onHover: this._onHover,
        updateTriggers: {
          getFillColor: this.state.time
        },
        autoHighlight: true,
        highlightColor: [0, 255, 255]
      }),
      new TripsLayer({
        id: 'trips',
        data: this.state.trs,
        getPath: d => d.Segments,
        getColor: d => getRgbFromStr(colorsTrs(d.Tourid)),
        opacity: 0.5,
        widthMinPixels: 4,
        rounded: false,
        trailLength,
        currentTime: this.state.time,
        pickable: false,
        autoHighlight: true,
        highlightColor: [0, 255, 255]
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
        onClick={(object) => { if ((!object.layer) || (object.layer.id != 'boundaries')) {
          this._recalculateTrs(null)}
        }}
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
    );
  }
}

export function renderToDOM(container) {
  render(<App actType={actType} 
              data={data} 
              animationSpeed={animationSpeed}
              trailLength={trailLength}/>, container);
}
