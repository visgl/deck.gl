import React, {Component} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';

import MapGL from 'react-map-gl';

import * as Demos from './demos';
import {updateMap, updateMeta, loadData, useParams} from '../actions/app-actions';
import ViewportAnimation from '../utils/map-utils';
import {MAPBOX_STYLES} from '../constants/defaults';

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trackMouseMove: false,
      mousePosition: null
    };
  }

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
      let demoViewport = DemoComponent.viewport;

      if (!demoViewport) {
        // do not show map
        this.props.updateMap({
          mapStyle: null
        });
      } else {
        demoViewport = {
          perspectiveEnabled: true,
          minZoom: 0,
          maxZoom: 20,
          ...demoViewport
        };

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

  @autobind
  _onUpdateMap(viewport) {
    this.props.onInteract();
    this.props.updateMap(viewport);
  }

  @autobind
  _onMouseMove(evt){
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

  render() {
    const {viewport, demo, params, owner, data, isInteractive} = this.props;
    const DemoComponent = Demos[demo];

    if (!DemoComponent) {
      return null;
    }

    return (
      <div
        onMouseMove={this.state.trackMouseMove? this._onMouseMove : null}
        onMouseEnter={this.state.trackMouseMove? this._onMouseEnter : null}
        onMouseLeave={this.state.trackMouseMove? this._onMouseLeave : null}>
        <MapGL
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          preventStyleDiffing={true}

          {...viewport}
          mapStyle={viewport.mapStyle || MAPBOX_STYLES.BLANK}
          onChangeViewport={isInteractive ? this._onUpdateMap : undefined}>

          <DemoComponent ref="demo" viewport={viewport} params={params}
            onStateChange={this.props.updateMeta}
            mousePosition={this.state.mousePosition}
            mouseEntered={this.state.mouseEntered}
            data={owner === demo ? data : null} />

          {isInteractive && viewport.perspectiveEnabled &&
            <div className="mapbox-tip">Hold down shift to rotate</div>}

        </MapGL>
      </div>
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
