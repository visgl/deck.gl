import React, {Component} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';
import {FlyToInterpolator} from 'react-map-gl';

import MapGL from 'react-map-gl';
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
      let demoViewport = DemoComponent.viewport;
      this._mapStyle = DemoComponent.mapStyle;

      if (demoViewport) {
        demoViewport = {
          transitionDuration: useTransition ? 2000 : 0,
          transitionInterpolator: new FlyToInterpolator(),
          minZoom: 0,
          maxZoom: 20,
          ...demoViewport
        };

        this.props.updateMapState(demoViewport);
      }
    }
  }

  _unloadDemo() {
    if (this.props.resetParams) {
      this.props.resetParams();
    }
  }

  @autobind
  _updateMapViewState({viewState}) {
    this.props.updateMapState(viewState);
  }

  // Add map wrapper, use for examples that havn't yet been updated to render their own maps
  _renderMap(mapStyle = MAPBOX_STYLES.BLANK, component) {
    const {viewState, width, height, isInteractive} = this.props;

    return (
      <MapGL
        mapboxApiAccessToken={MapboxAccessToken}
        mapStyle={mapStyle}
        reuseMap

        {...viewState}
        width={width}
        height={height}
        onViewStateChange={this._updateMapViewState}>

        {component}
        {isInteractive && <div className="mapbox-tip">Hold down shift to rotate</div>}

      </MapGL>
    );
  }

  render() {
    const {viewState, demo, owner, data, isInteractive} = this.props;
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

        controller={false}
        baseMap={false}

        data={owner === demo ? data : null}
        viewState={viewState}

        mapboxApiAccessToken={MapboxAccessToken}
        mapStyle={this._mapStyle || MAPBOX_STYLES.BLANK}

        params={params}
        onStateChange={this.props.updateMeta}
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
