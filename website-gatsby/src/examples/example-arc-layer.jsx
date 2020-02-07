import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App, {inFlowColors, outFlowColors} from '../../../examples/website/arc/app';

const colorRamp = inFlowColors
  .slice()
  .reverse()
  .concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

export default class ArcDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      lineWidth: 1,
      sourceName: null,
      count: 0,
      flowCount: 0
    };

    this._handleChange = this._handleChange.bind(this);
    this._onSelectCounty = this._onSelectCounty.bind(this);
  }

  componentDidMount() {
    loadData(`${DATA_URI}/arc-data.txt`, '/workers/arc-data-decoder.js', (response, meta) => {
      this.setState({
        data: response,
        count: meta.count,
        flowCount: meta.flowCount
      });
    });
  }

  _handleChange(event) {
    this.setState({lineWidth: parseFloat(event.target.value)});
  }

  _onSelectCounty(f) {
    console.log(f);
    this.setState({sourceName: f.properties.name});
  }

  render() {
    const {data, lineWidth, sourceName, count, flowCount} = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.LIGHT}
          data={data}
          strokeWidth={lineWidth}
          onSelectCounty={this._onSelectCounty}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>United States County-to-county Migration</h3>
          <p>
            People moving in and out of <b>{sourceName}</b> between 2009-2013
          </p>

          <div className="layout">
            {colorRamp.map((c, i) => (
              <div
                key={i}
                className="legend"
                style={{background: c, width: `${100 / colorRamp.length}%`}}
              />
            ))}
          </div>
          <p className="layout">
            <span className="col-1-2">Net gain</span>
            <span className="col-1-2 text-right">Net loss</span>
          </p>

          <p>
            Data source: <a href="http://www.census.gov">US Census Bureau</a>
          </p>

          <div className="layout">
            <div className="stat col-1-2">
              Counties<b>{count || 0}</b>
            </div>
            <div className="stat col-1-2">
              Arcs<b>{readableInteger(flowCount)}</b>
            </div>
          </div>

          <hr />
          <div className="input">
            <label>Width</label>
            <input
              name="width"
              type="range"
              step="0.1"
              min="0"
              max="10"
              value={lineWidth}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}
