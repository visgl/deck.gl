import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/point-cloud/app';

export default class PointCloudDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataCount: 0
    };

    this._onLoad = this._onLoad.bind(this);
  }

  _onLoad(meta) {
    this.setState({dataCount: meta.count});
  }

  render() {
    const {data, dataCount} = this.state;

    return (
      <div>
        <App onLoad={this._onLoad} />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>3D Indoor Scan</h3>
          <p>This demo may not work on mobile devices due to browser limitations.</p>
          <p>
            Data source: <a href="https://kaarta.com">kaarta.com</a>
          </p>
          <div className="stat">
            No. of Points
            <b>{readableInteger(dataCount)}</b>
          </div>
        </InfoPanel>
      </div>
    );
  }
}
