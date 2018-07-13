import React, {Component} from 'react';
import autobind from 'autobind-decorator';
import {readableInteger} from '../../utils/format-utils';
import {App} from 'website-examples/point-cloud-laz/app';

export default class PointCloudDemo extends Component {

  static get data() {
    return [];
  }

  static get parameters() {
    return {};
  }

  static get viewport() {
    return null;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>3D Indoor Scan</h3>
        <p>This demo may not work on mobile devices due to browser limitations.</p>
        <p>Data source: <a href="https://kaarta.com">kaarta.com</a></p>
        <div className="stat">No. of Points
          <b>{ readableInteger(meta.count) }</b>
        </div>
        {meta.progress < 1 && <p>Loading {(meta.progress * 100).toFixed(2)}%</p>}
      </div>
    );
  }

  @autobind
  _onLoad(meta) {
    this.props.onStateChange(meta);
  }

  render() {
    return (
      <App onLoad={this._onLoad} />
    );
  }
}
