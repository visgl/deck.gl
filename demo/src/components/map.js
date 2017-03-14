import React, {Component} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';
import MapGL from 'react-map-gl';

import * as Demos from './demos';
import {updateMap, updateMeta, loadData, useParams} from '../actions/app-actions';
import ViewportAnimation from '../utils/map-utils';
import {MAPBOX_STYLES} from '../constants/defaults';

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
    const DemoComponent = Demos[demo];

    if (DemoComponent) {
      this.props.loadData(demo, DemoComponent.data);
      this.props.useParams(DemoComponent.parameters);

      if (!DemoComponent.viewport) {
        // do not show map
        this.props.updateMap({
          mapStyle: null
        });
      } else if (useTransition) {
        const {viewport} = this.props;
        ViewportAnimation.fly(viewport, DemoComponent.viewport, 1000, this.props.updateMap)
        .easing(ViewportAnimation.Easing.Exponential.Out)
        .start();
      } else {
        this.props.updateMap(DemoComponent.viewport);
      }
    }
  }

  @autobind
  _onUpdateMap(viewport) {
    this.props.onInteract();
    this.props.updateMap(viewport);
  }

  render() {
    const {viewport, demo, params, owner, data, isInteractive} = this.props;
    const DemoComponent = Demos[demo];

    if (!DemoComponent) {
      return null;
    }

    return (
      <MapGL
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        perspectiveEnabled={true}
        preventStyleDiffing={true}
        {...viewport}
        mapStyle={viewport.mapStyle || MAPBOX_STYLES.BLANK}
        onChangeViewport={isInteractive ? this._onUpdateMap : undefined}>

        <DemoComponent ref="demo" viewport={viewport} params={params}
          onStateChange={this.props.updateMeta}
          data={owner === demo ? data : null} />

      </MapGL>
    );
  }

}

const mapStateToProps = state => ({
  viewport: state.viewport,
  ...state.vis
});

Map.defaultProps = {
  onInteract: () => {},
  isInteractive: true
};

export default connect(
  mapStateToProps,
  {updateMap, updateMeta, loadData, useParams}
)(Map);
