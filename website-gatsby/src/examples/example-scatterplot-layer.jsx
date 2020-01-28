import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger, rgbToHex, colorToRGBArray} from '../utils/format-utils';
import App from '../../../examples/website/scatterplot/app';

export default class ScatterplotDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      points: 0,
      maleColor: [0, 128, 255],
      femaleColor: [255, 0, 128],
      radius: 10
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(
      `${DATA_URI}/scatterplot-data.txt`,
      '/workers/scatterplot-data-decoder.js',
      (response, meta) => {
        this.setState({
          data: response,
          points: meta.points
        });
      }
    );
  }

  _handleChange(event) {
    switch (event.target.name) {
      case 'female-color':
        this.setState({femaleColor: colorToRGBArray(event.target.value)});
        break;
      case 'male-color':
        this.setState({maleColor: colorToRGBArray(event.target.value)});
        break;
      case 'radius':
        this.setState({radius: parseFloat(event.target.value)});
        break;
    }
  }

  render() {
    const {data, points, maleColor, femaleColor, radius} = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.LIGHT}
          data={data}
          maleColor={maleColor}
          femaleColor={femaleColor}
          radius={radius}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Every Person in New York City</h3>
          <p>Each dot represents 10 people. Density per tract from 2015 census data</p>
          <p>
            Data source: <a href="http://www.census.gov">US Census Bureau</a>
          </p>
          <div className="stat">
            No. of Instances
            <b>{readableInteger(points)}</b>
          </div>
          <hr />
          <div className="input">
            <label>Female</label>
            <input
              name="female-color"
              type="color"
              value={rgbToHex(femaleColor)}
              onChange={this._handleChange}
            />
          </div>
          <div className="input">
            <label>Male</label>
            <input
              name="male-color"
              type="color"
              value={rgbToHex(maleColor)}
              onChange={this._handleChange}
            />
          </div>
          <div className="input">
            <label>Radius</label>
            <input
              name="radius"
              type="range"
              step="0.1"
              min="1"
              max="20"
              value={radius}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}
