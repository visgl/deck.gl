import 'babel-polyfill';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';
import MapGL from 'react-map-gl';

import Demos from './demos';
import {updateMap, updateMeta, loadData, useParams} from '../actions/app-actions';
import {MAPBOX_STYLES} from '../constants/defaults';
import MAPBOX_ACCESS_TOKEN from '../constants/mapbox-token';
import ViewportAnimation from '../utils/map-utils';

class Map extends Component {

  componentDidMount() {
    this._loadDemo(this.props.demo, false);
  }

  componentWillReceiveProps(nextProps) {
    const {demo} = nextProps;
    if (demo !== this.props.demo) {
      this._loadDemo(demo, true);
    }
  }

  _loadDemo(demo, useTransition) {
    const {loadData, useParams, updateMap} = this.props;
    const DemoComponent = Demos[demo];

    if (DemoComponent) {
      loadData(demo, DemoComponent.data);
      useParams(DemoComponent.parameters);

      if (useTransition) {
        const {viewport} = this.props;
        ViewportAnimation.fly(viewport, DemoComponent.viewport, 1000, updateMap)
        .easing(ViewportAnimation.Easing.Exponential.Out)
        .start();
      } else {
        updateMap(DemoComponent.viewport);
      }      
    }
  }

  @autobind
  _onUpdateMap(viewport) {
    this.props.onInteract();
    this.props.updateMap(viewport);
  }

  render() {
    const {viewport, demo, params, owner, data, updateMeta, isInteractive} = this.props;
    const DemoComponent = Demos[demo];

    if (!DemoComponent) {
      return null;
    }

    return (
      <MapGL
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        perspectiveEnabled={true}
        { ...viewport }
        onChangeViewport={ isInteractive ? this._onUpdateMap : undefined }>

        <DemoComponent ref="demo" viewport={viewport} params={params}
          onStateChange={updateMeta}
          data={owner === demo ? data : null} />

      </MapGL>
    )
  }

}

function mapStateToProps(state) {
  return {
    viewport: state.viewport, 
    ...state.vis
  }
}

Map.defaultProps = {
  onInteract: () => {},
  isInteractive: true
};

export default connect(mapStateToProps, {updateMap, updateMeta, loadData, useParams})(Map);
