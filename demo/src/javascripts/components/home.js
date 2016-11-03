import 'babel-polyfill';
import Stats from 'stats.js';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {HeroDemo} from './demos';
import {loadData, updateMap} from '../actions/app-actions';
import MapGL from 'react-map-gl';
import Header from './header';

import ViewportAnimation from '../utils/map-utils';
import stylesheet from '../constants/styles';
import {MAPBOX_ACCESS_TOKEN, MAPBOX_STYLES} from '../constants/defaults';

const DEMO_TAB = 0;
const CONTENT_TAB = 1;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.cameraAnimation = ViewportAnimation.fly(
      {bearing: 0},
      {bearing: -15},
      29000,
      this.props.updateMap
    ).easing(ViewportAnimation.Easing.Sinusoidal.InOut)
    .repeat(Infinity)
    .yoyo(true);
  }

  componentDidMount() {
    const {loadData, updateMap} = this.props;
    window.onscroll = this._onScroll.bind(this);
    window.onresize = this._resizeMap.bind(this);
    this._onScroll();
    this._resizeMap();

    this._stats = new Stats();
    this._stats.showPanel(0);
    this.refs.fps.appendChild(this._stats.dom);

    const calcFPS = () => {
      this._stats.begin();
      this._stats.end();
      this._animateRef = requestAnimationFrame(calcFPS);
    }

    this._animateRef = requestAnimationFrame(calcFPS);

    const {data, viewport} = HeroDemo;
    loadData('Home', [
      {
        ...data[0],
        url: 'data/hero-data-s.txt'
      },
      {
        ...data[1],
        url: 'data/building-data-s.txt'
      }
    ]);

    updateMap({...viewport, longitude: -74.01, latitude: 40.707, pitch: 40, zoom: 14});
    this.cameraAnimation.start();
  }

  componentWillUnmount() {
    window.onscroll = null;
    window.onresize = null;
    this.cameraAnimation.stop();
    cancelAnimationFrame(this._animateRef);
  }

  _resizeMap() {
    const container = this.refs.banner;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.props.updateMap({width, height});
  }

  _onScroll() {
    const y = window.pageYOffset;
    this.setState({atTop: y < 168});
  }

  _renderDemo() {
    const {viewport, app: {owner, data}} = this.props;
    const dataLoaded = owner === 'Home' ? data : null;

    return dataLoaded && (
      <div className="hero">
        <MapGL mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          { ...viewport } >
          <HeroDemo viewport={viewport} data={dataLoaded} />
        </MapGL>
      </div>
    );
  }

  render() {
    const {atTop} = this.state;
    return (
      <div className={`home-wrapper ${atTop ? 'top' : ''}`}>
        <style>{ stylesheet }</style>
        <Header />

        <section ref="banner" id="banner">
          { this._renderDemo() }
          <div className="container">
            <h1>deck.gl</h1>
            <p>Large-scale WebGL-powered Data Visualization</p>
            <a href="/#/documentation/overview/getting-started">
              <button>Get started</button>
            </a>
          </div>
          <div ref="fps" className="fps" />
        </section>

        <section id="features">
          <div className="container">
            <div>
              <h2>
                deck.gl is a WebGL-powered framework for visual exploratory
                data analysis of large datasets.
              </h2>
              <hr className="short" />

              <h3>A Layered Approach to Visualization</h3>
              <p>
              Based on the notion of layers and instancing deck.gl is
              suitable to reason about and display data, perform
              on-the-fly aggregations and visually explore large datasets.
              </p>

              <h3>Growing Layer Catalog</h3>
              <p>
              deck.gl defines an architecture for packaging high performance
              WebGL visualizations as reusable JavaScript layers. We already
              offer a catalog of proven layers and we have many more in the
              works.
              </p>

              <h3>Interoperability with Mapbox</h3>
              <p>
              deck.gl is interoperable with Mapbox GL. We coordinate
              with the Mapbox camera system to provide compelling 2D and 3D
              visualizations on top of your Mapbox based maps.
              </p>

              <h3>Strong React Integration</h3>
              <p>
              deck.gl is a particularly good match with React, supporting
              efficient WebGL rendering under the Reactive programming
              paradigm.
              </p>
            </div>
          </div>
          <div className="image" />
        </section>

        <hr />

        <section id="highlights">
          <div className="container text-center">
            <h4>Highlights</h4>
            <hr className="short" />
            <div className="layout">
              <div className="col-1-3">
                <img src="images/Icon-1.svg" />
                <h5>WebGL rendered</h5>
                <p>
                Tested, highly performant layers for core data
                visualization use cases such as scatterplots, choropleths,
                and more, as well as support for custom WebGL layers.
                </p>
              </div>

              <div className="col-1-3">
                <img src="images/Icon-2.svg" />
                <h5>Robust Architecture</h5>
                <p>
                deck.gl is built using the latest JavaScript standards,
                including ES2016 and a rich ecosystem of libraries and
                settings that enable easy debugging and profiling of
                WebGL applications.
                </p>
              </div>

              <div className="col-1-3">
                <img src="images/Icon-3.svg" />
                <h5>High-precision computations in the GPU</h5>
                <p>
                By emulating float64 computations in the GPU we support
                rendering datasets with unparalleled accuracy and performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="footer">
          <div className="container text-center">
            <div className="logo">deck.gl</div>
            <hr className="short" />
            <h4>Made by</h4>
            <img src="images/uber-logo.png" />
          </div>
        </section>

      </div>
    );
  }
}

export default connect(state => state, {loadData, updateMap})(Home);
