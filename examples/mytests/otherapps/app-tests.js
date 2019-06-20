/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

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

function filterBySourceZone(trs, zone, prop='Sources') {
  var filtered = Array()
  for (const [trid, attrs] of Object.entries(trs)) {
    if (attrs[prop][0] === zone) {
      filtered.push(trs[trid])
    }
  }
  return filtered
}

// Set your mapbox token here
//const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

// Source data CSV
const DATA_URL = {
  TRIPS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};

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
  longitude: -2.358666776,
  latitude: 51.35911178,
  zoom: 10,
  pitch: 45,
  bearing: 0
};

let trsData = require('./inputs/data.json');
let trIds = Object.keys(trsData);
let colors = d3.scaleSequential()
               .domain(shuffle([...trIds]))
               .interpolator(d3.interpolateRainbow);

let lsoasData = require('./inputs/lsoas.json');

let data = {trs: trsData, lsoas: lsoasData};

export class App extends Component {
  constructor(props) {
    super(props);
    this.data = this.props.data
    this.state = {
      time: 0,
      hoveredObject: null,
      selectedZone: null
    };
    this._onHover = this._onHover.bind(this);
    this._onSelectZone = this._onSelectZone.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);

    //this._recalculateTours(this.props.data.trs);

  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this._recalculateArcs(nextProps.data);
    }
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _onSelectZone({object}) {
    this._recalculateTours(this.data.trs, object);
  }

  _recalculateTours(data, selectedZone = this.state.selectedZone) {
    if (!data) {
      return;
    }
    if (!selectedZone) {
      selectedZone = this.data.lsoas.features.find(f => f.properties.lsoa11cd === 'E01014370');
    }
    
    const {lsoa11cd} = selectedZone.properties;

    var trs = filterBySourceZone(this.data.trs, selectedZone, 'Sources')

    // this.state.trs = trs

    if (this.props.onSelectZone) {
      this.props.onSelectZone(selectedZone);
    }

    //this.setState({selectedZone});
  }

  _animate() {
    const {
      loopLength = 86400, // unit corresponds to the timestamp in source data
      animationSpeed = 120 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _renderLayers() {
    const {trs = this.data.trs, lsoas = this.data.lsoas, trailLength = 20} = this.props;

    function getRgbFromStr(strRgb, palette) {
      var color = d3.color(strRgb);
      return [color.r, color.g, color.b]
      
    }
    return [
      new TripsLayer({
        id: 'trips',
        data: trs,
        getPath: d => d.segments,
        getColor: d => getRgbFromStr(colors(d.Tourid)),
        opacity: 0.3,
        widthMinPixels: 2,
        rounded: true,
        trailLength,
        currentTime: this.state.time
      }),
      new GeoJsonLayer({
        id: 'geojson',
        data: lsoas,
        opacity: 0.01,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        fp64: false,
        getElevation: 0,
        getFillColor: [255, 0, 0],
        getLineColor: [0, 0, 255],
        onHover: this._onHover,
        pickable: true,
        onClick: this._onSelectZone
      })
    ];
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: y, left: x}}>
          <div>
            <b>LSOA</b>
          </div>
          <div>
            <div>${hoveredObject.properties.lsoa11cd}</div>
          </div>
          
        </div>
      )
    );
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
  render(<App data={data}/>, container);
}
