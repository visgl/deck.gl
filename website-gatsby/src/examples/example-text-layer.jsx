import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/tagmap/app';

export default class TextLayerDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataCount: 0,
      cluster: true,
      fontSize: 32
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(`${DATA_URI}/hashtags100k.txt`, '/workers/hashtags-decoder.js', (response, meta) => {
      this.setState({
        data: response,
        dataCount: meta.count
      });
    });
  }

  _handleChange(event) {
    switch (event.target.name) {
      case 'font-size':
        this.setState({fontSize: parseInt(event.target.value)});
        break;
      case 'cluster':
        this.setState({cluster: event.target.checked});
        break;
    }
  }

  render() {
    const {data, dataCount, cluster, fontSize} = this.state;

    return (
      <div>
        <App mapStyle={MAPBOX_STYLES.DARK} data={data} cluster={cluster} fontSize={fontSize} />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Twitter Hashtags</h3>
          <p>Data set from Twitter showing hashtags with geolocation.</p>
          <p>
            Data source:
            <a href="">Twitter</a>
          </p>
          <div className="layout">
            <div className="stat col-1-2">
              No. of Tweets
              <b>{readableInteger(dataCount)}</b>
            </div>
          </div>
          <hr />
          <div className="input">
            <label>Dynamic Cluster</label>
            <input name="cluster" type="checkbox" checked={cluster} onChange={this._handleChange} />
          </div>
          <div className="input">
            <label>Font Size</label>
            <input
              name="font-size"
              type="range"
              step="1"
              min="20"
              max="80"
              value={fontSize}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}
