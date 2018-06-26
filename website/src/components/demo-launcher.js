import React, {Component} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';

import MapGL from 'react-map-gl';
import * as Demos from './demos';
import {updateMap, updateMeta, loadData, useParams, resetParams} from '../actions/app-actions';
import ViewportAnimation from '../utils/map-utils';
import {MAPBOX_STYLES} from '../constants/defaults';

class DemoLauncher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trackMouseMove: false,
      mousePosition: null
    };
  }

  componentDidMount() {
    /* global window */
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

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
      this._mapStyle = DemoComponent.mapStyle || (demoViewport && demoViewport.mapStyle);

      if (demoViewport) {
        demoViewport = {
          minZoom: 0,
          maxZoom: 20,
          ...demoViewport
        };
        delete demoViewport.mapStyle;

        if (useTransition) {
          const {viewport} = this.props;
          ViewportAnimation.fly(viewport, demoViewport, 1000, this.props.updateMap)
          .easing(ViewportAnimation.Easing.Exponential.Out)
          .start();
        } else {
          this.props.updateMap(demoViewport);
        }
      }

      this.setState({
        trackMouseMove: Boolean(DemoComponent.trackMouseMove)
      });
    }
  }

  _unloadDemo() {
    if (this.props.resetParams) {
      this.props.resetParams();
    }
  }

  @autobind
  _onMouseMove(evt) {
    if (evt.nativeEvent) {
      this.setState({mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY]});
    }
  }

  @autobind
  _onMouseEnter() {
    this.setState({mouseEntered: true});
  }

  @autobind
  _onMouseLeave() {
    this.setState({mouseEntered: false});
  }

  @autobind
  _updateMapViewState({viewState}) {
    this.props.updateMap(viewState);
  }

  // Add map wrapper, use for examples that havn't yet been updated to render their own maps
  _renderMap(mapStyle, component) {
    const {viewport, isInteractive} = this.props;

    mapStyle = mapStyle || viewport.mapStyle || MAPBOX_STYLES.BLANK;

    return (
      <MapGL
        mapboxApiAccessToken={MapboxAccessToken}
        preventStyleDiffing={true}
        mapStyle={mapStyle}
        reuseMap

        width={this.state.width}
        height={this.state.height}
        viewState={viewport}
        onViewStateChange={isInteractive ? this._updateMapViewState : undefined}>

        {component}

      </MapGL>
    );
  }

  render() {
    const {viewport, demo, owner, data, isInteractive} = this.props;
    const DemoComponent = Demos[demo];

    // Params are not initialized in time
    const params = Object.assign({}, DemoComponent.parameters, this.props.params);

    if (!DemoComponent) {
      return null;
    }

    return (
      <div
        onMouseMove={this.state.trackMouseMove ? this._onMouseMove : null}
        onMouseEnter={this.state.trackMouseMove ? this._onMouseEnter : null}
        onMouseLeave={this.state.trackMouseMove ? this._onMouseLeave : null}>

        {this._renderMap(
          DemoComponent.mapStyle,
          <DemoComponent
            ref="demo"

            data={owner === demo ? data : null}

            viewState={viewport}
            onViewStateChange={isInteractive ? this._updateMapViewState : undefined}

            mapboxApiAccessToken={MapboxAccessToken}
            mapStyle={this._mapStyle || MAPBOX_STYLES.BLANK}

            params={params}
            onStateChange={this.props.updateMeta}
            mousePosition={this.state.mousePosition}
            mouseEntered={this.state.mouseEntered}
            />
        )}

        {isInteractive && <div className="mapbox-tip">Hold down shift to rotate</div>}

      </div>
    );
  }

}

const mapStateToProps = state => ({
  viewport: state.viewport,
  ...state.vis
});

DemoLauncher.defaultProps = {
  isInteractive: true
};

export default connect(
  mapStateToProps,
  {updateMap, updateMeta, loadData, useParams, resetParams}
)(DemoLauncher);
