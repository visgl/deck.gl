import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';
import GeoJsonOverlay from '../../../../examples/geojson/deckgl-overlay';

const COLOR_SCALE = [
  // negative
  [65, 182, 196],
  [127, 205, 187],
  [199, 233, 180],
  [237, 248, 177],

  // positive
  [255, 255, 204],
  [255, 237, 160],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [189, 0, 38],
  [128, 0, 38]
];

function colorScale(x) {
  const i = Math.round(x * 7) + 4;
  if (x < 0) {
    return COLOR_SCALE[i] || COLOR_SCALE[0];
  }
  return COLOR_SCALE[i] || COLOR_SCALE[COLOR_SCALE.length - 1];
}

export default class GeoJsonDemo extends Component {

  static get data() {
    return {
      url: 'data/vancouver-blocks.txt',
      worker: 'workers/geojson-data-decoder.js'
    };
  }

  static get parameters() {
    return {};
  }

  static get viewport() {
    return {
      ...GeoJsonOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.LIGHT
    };
  }

  static renderInfo(meta) {

    const legendCount = 5;
    const legends = new Array(legendCount).fill(0).map((d, i) => i / (legendCount - 1) * 2 - 0.5);

    const width = `${100 / legendCount}%`;

    return (
      <div>
        <h3>Vancouver Property Value</h3>
        <p>The property value of Vancouver, BC</p>
        <p>Height of polygons - average property value per square meter of lot<br/>
           Color - value growth from last assessment</p>
        <div className="layout">
          {legends.map((l, i) => (
            <div key={i} className="legend"
              style={{background: `rgb(${colorScale(l).join(',')})`, width}} />
          ))}
        </div>
        <div className="layout">
          {legends.map((l, i) => (
            <div key={i} style={{width}} >{Math.round(l * 100)}%</div>
          ))}
        </div>
        <p>Data source:&nbsp;
          <a href="http://data.vancouver.ca/">City of Vancouver</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Polygons<b>{ readableInteger(meta.count) || 0 }</b>
          </div>
          <div className="stat col-1-2">
            No. of Vertices<b>{ readableInteger(meta.vertexCount || 0) }</b>
          </div>
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      hoveredFeature: null
    };
  }

  _onHover({x, y, object}) {
    this.setState({hoveredFeature: object, x, y});
  }

  _renderTooltip() {
    const {x, y, hoveredFeature} = this.state;
    return hoveredFeature && (
      <div className="tooltip" style={{top: y, left: x}}>
        <div><b>Average Property Value &nbsp;</b></div>
        <div>
          <div>${readableInteger(hoveredFeature.properties.valuePerParcel)} / parcel</div>
          <div>${readableInteger(hoveredFeature.properties.valuePerSqm)} / m<sup>2</sup></div>
        </div>
        <div><b>Growth</b></div>
        <div>{Math.round(hoveredFeature.properties.growth * 100)}%</div>
      </div>
    );
  }

  render() {
    const {viewport, data} = this.props;

    if (!data) {
      return null;
    }

    return (
      <div>
        <GeoJsonOverlay viewport={viewport}
          data={data}
          colorScale={colorScale}
          onHover={this._onHover.bind(this)} />

        {this._renderTooltip()}
      </div>
    );
  }
}
