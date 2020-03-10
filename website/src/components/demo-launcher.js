/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as Demos from './demos';
import {updateMapState, updateMeta, loadData, useParams, resetParams} from '../actions/app-actions';
import {MAPBOX_STYLES} from '../constants/defaults';

class DemoLauncher extends Component {
  componentWillMount() {
    this._loadDemo(this.props.demo, false);
  }

  componentWillReceiveProps(nextProps) {
    const {demo} = nextProps;
    if (demo !== this.props.demo) {
      this._unloadDemo(this.props.demo);
      this._loadDemo(demo, true);
    }
  }

  componentWillUnmount() {
    this._unloadDemo(this.props.demo);
  }

  _loadDemo(demo, useTransition) {
    const DemoComponent = Demos[demo];

    if (DemoComponent) {
      this.props.loadData(demo, DemoComponent.data);
      this.props.useParams(DemoComponent.parameters);
      this._mapStyle = DemoComponent.mapStyle;

      this.props.updateMapState(DemoComponent.viewport);
    }
  }

  _unloadDemo() {
    if (this.props.resetParams) {
      this.props.resetParams();
    }
  }

  // Add map tooltip
  _renderMap(mapStyle, component) {
    const {width, height, isInteractive} = this.props;

    return (
      <div style={{width, height, position: 'relative'}}>
        {component}
        {isInteractive && mapStyle && <div className="mapbox-tip">Hold down shift to rotate</div>}
      </div>
    );
  }

  render() {
    const {demo, owner, data, viewState} = this.props;
    const DemoComponent = Demos[demo];

    // Params are not initialized in time
    const params = Object.assign({}, DemoComponent.parameters, this.props.params);

    if (!DemoComponent) {
      return null;
    }

    return this._renderMap(
      DemoComponent.mapStyle,
      <DemoComponent
        ref="demo"
        data={owner === demo ? data : null}
        viewState={viewState}
        mapStyle={this._mapStyle || MAPBOX_STYLES.BLANK}
        params={params}
        onStateChange={this.props.updateMeta}
        useParams={this.props.useParams}
      />
    );
  }
}

const mapStateToProps = state => ({
  ...state.map,
  ...state.vis
});

DemoLauncher.defaultProps = {
  isInteractive: true
};

export default connect(
  mapStateToProps,
  {updateMapState, updateMeta, loadData, useParams, resetParams}
)(DemoLauncher);
