import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {App, INITIAL_VIEW_STATE} from 'website-examples/line/app';

export default class LineDemo extends Component {

  static get data() {
    return [
      {
        url: `${DATA_URI}/flight-path-data.txt`,
        worker: 'workers/flight-path-data-decoder.js'
      },
      {
        url: `${DATA_URI}/airports.json`
      }
    ];
  }

  static get parameters() {
    return {
      strokeWidth: {displayName: 'Stroke Width',
        type: 'range', value: 3, step: 0.1, min: 0, max: 10}
    };
  }

  static get viewport() {
    return {
      ...INITIAL_VIEW_STATE,
      mapStyle: MAPBOX_STYLES.DARK
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Flights To And From London Heathrow Airport</h3>
        <p>Flight paths in a 6-hour window</p>
        <p>From 08:32:43 GMT to 14:32:43 GMT on March 28th, 2017</p>
        <p>Flight path data source:
          <a href="https://opensky-network.org/"> The OpenSky Network</a><br />
          Airport location data source:
          <a href="http://www.naturalearthdata.com/"> Natural Earth</a>
        </p>
        <div className="stat">No. of Line Segments<b>{ readableInteger(meta.count || 0) }</b></div>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      tooltipLine1: '',
      tooltipLine2: ''
    };
  }

  _onHover({x, y, object}) {
    let tooltipLine1 = '';
    let tooltipLine2 = '';
    if (object) {
      tooltipLine1 = object.country || object.abbrev;
      tooltipLine2 = object.name.indexOf('0x') >= 0 ? '' : object.name;
    }
    this.setState({x, y, tooltipLine1, tooltipLine2});
  }

  _renderTooltip() {
    const {x, y, tooltipLine1, tooltipLine2} = this.state;
    return tooltipLine1 && (
      <div className="tooltip" style={{left: x, top: y}}>
        <div>{ tooltipLine1 }</div>
        <div>{ tooltipLine2 }</div>
      </div>
    );
  }

  render() {
    const {params, data} = this.props;

    return (
      <div>
        <App
          {...this.props}
          flightPaths={data && data[0]}
          airports={data && data[1]}
          onHover={this._onHover.bind(this)}
          strokeWidth={params.strokeWidth.value} />

        { this._renderTooltip() }

      </div>
    );
  }
}
