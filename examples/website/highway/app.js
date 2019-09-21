import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {scaleLinear, scaleThreshold} from 'd3-scale';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL = {
  ACCIDENTS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/highway/accidents.csv',
  ROADS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/highway/roads.json'
};

function getKey({state, type, id}) {
  return `${state}-${type}-${id}`;
}

export const COLOR_SCALE = scaleThreshold()
  .domain([0, 4, 8, 12, 20, 32, 52, 84, 136, 220])
  .range([
    [26, 152, 80],
    [102, 189, 99],
    [166, 217, 106],
    [217, 239, 139],
    [255, 255, 191],
    [254, 224, 139],
    [253, 174, 97],
    [244, 109, 67],
    [215, 48, 39],
    [168, 0, 0]
  ]);

const WIDTH_SCALE = scaleLinear()
  .clamp(true)
  .domain([0, 200])
  .range([10, 2000]);

const INITIAL_VIEW_STATE = {
  latitude: 38,
  longitude: -100,
  zoom: 4,
  minZoom: 2,
  maxZoom: 8
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredObject: null,
      ...this._aggregateAccidents(props.accidents)
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.accidents !== this.props.accidents) {
      this.setState({
        ...this._aggregateAccidents(nextProps.accidents)
      });
    }
  }

  _aggregateAccidents(accidents) {
    const incidents = {};
    const fatalities = {};

    if (accidents) {
      accidents.forEach(a => {
        const r = (incidents[a.year] = incidents[a.year] || {});
        const f = (fatalities[a.year] = fatalities[a.year] || {});
        const key = getKey(a);
        r[key] = a.incidents;
        f[key] = a.fatalities;
      });
    }
    return {incidents, fatalities};
  }

  _getLineColor(f, fatalities) {
    if (!fatalities) {
      return [200, 200, 200];
    }
    const key = getKey(f.properties);
    const fatalitiesPer1KMile = ((fatalities[key] || 0) / f.properties.length) * 1000;
    return COLOR_SCALE(fatalitiesPer1KMile);
  }

  _getLineWidth(f, incidents) {
    if (!incidents) {
      return 10;
    }
    const key = getKey(f.properties);
    const incidentsPer1KMile = ((incidents[key] || 0) / f.properties.length) * 1000;
    return WIDTH_SCALE(incidentsPer1KMile);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderLayers() {
    const {roads = DATA_URL.ROADS, year} = this.props;
    const {incidents, fatalities} = this.state;

    return [
      new GeoJsonLayer({
        id: 'geojson',
        data: roads,
        opacity: 1,
        stroked: false,
        filled: false,
        lineWidthMinPixels: 0.5,
        parameters: {
          depthTest: false
        },

        getLineColor: f => this._getLineColor(f, fatalities[year]),
        getLineWidth: f => this._getLineWidth(f, incidents[year]),

        pickable: true,
        onHover: this._onHover,

        updateTriggers: {
          getLineColor: {year},
          getLineWidth: {year}
        },

        transitions: {
          getLineColor: 1000,
          getLineWidth: 1000
        }
      })
    ];
  }

  _renderTooltip() {
    const {hoveredObject, x, y, fatalities, incidents} = this.state;
    const {year} = this.props;

    if (!hoveredObject) {
      return null;
    }

    const props = hoveredObject.properties;
    const key = getKey(props);
    const f = fatalities[year][key];
    const r = incidents[year][key];

    const content = r ? (
      <div>
        <b>{f}</b> people died in <b>{r}</b> crashes on{' '}
        {props.type === 'SR' ? props.state : props.type}-{props.id} in <b>{year}</b>
      </div>
    ) : (
      <div>
        no accidents recorded in <b>{year}</b>
      </div>
    );

    return (
      <div className="tooltip" style={{left: x, top: y}}>
        <big>
          {props.name} ({props.state})
        </big>
        {content}
      </div>
    );
  }

  render() {
    const {mapStyle = 'mapbox://styles/mapbox/dark-v9'} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        pickingRadius={5}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />

        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);

  const formatRow = d => ({
    ...d,
    incidents: Number(d.incidents),
    fatalities: Number(d.fatalities)
  });

  require('d3-request').csv(DATA_URL.ACCIDENTS, formatRow, (error, response) => {
    if (!error) {
      render(<App accidents={response} year={response[0].year} />, container);
    }
  });
}
