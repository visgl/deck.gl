import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App, {COLOR_SCALE} from '../../../examples/website/highway/app';

export default class HighwayDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accidentData: null,
      roadData: null,
      year: 1990,
      pathCount: 0,
      vertexCount: 0
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(
      `${DATA_URI}/highway-accidents.txt`,
      '/workers/highway-accidents-decoder.js',
      (response, meta) => {
        this.setState({
          accidentData: response
        });
      }
    );
    loadData(
      `${DATA_URI}/highway-roads.txt`,
      '/workers/highway-roads-decoder.js',
      (response, meta) => {
        this.setState({
          roadData: response,
          pathCount: meta.count,
          vertexCount: meta.vertexCount
        });
      }
    );
  }

  _handleChange(event) {
    this.setState({year: parseInt(event.target.value)});
  }

  render() {
    const {accidentData, roadData, year, pathCount, vertexCount} = this.state;

    const legends = COLOR_SCALE.domain();
    const width = `${100 / legends.length}%`;

    return (
      <div>
        <App mapStyle={MAPBOX_STYLES.DARK} accidents={accidentData} roads={roadData} year={year} />}
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Highway Safety in the US</h3>
          <p>
            Fatal accidents on U.S. highways
            <br />
            (1990 - 2015)
          </p>
          <p>Fatalities per 1,000 miles:</p>
          <div className="layout">
            {legends.map((l, i) => (
              <div
                key={i}
                className="legend"
                style={{background: `rgb(${COLOR_SCALE(l).join(',')})`, width}}
              />
            ))}
          </div>
          <p className="layout">
            {legends.slice(0, -1).map((l, i) => (
              <span key={i} style={{width}}>
                {l}
              </span>
            ))}
          </p>
          <p>
            Data source:
            <br />
            <a href="https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars">
              National Highway Traffic Safty Administration
            </a>
          </p>
          <div className="layout">
            <div className="stat col-1-2">
              No. of Paths<b>{readableInteger(pathCount)}</b>
            </div>
            <div className="stat col-1-2">
              No. of Vertices<b>{readableInteger(vertexCount)}</b>
            </div>
          </div>

          <hr />

          <div className="input">
            <label>Year</label>
            <input
              name="year"
              type="range"
              step="5"
              min="1990"
              max="2015"
              value={year}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}
