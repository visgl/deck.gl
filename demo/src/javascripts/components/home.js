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

              <h3>
              A Layered Approach to Data Visualization
              </h3>
              <p>
              deck.gl allows complex visualizations to be constructed by
              composing existing layers, and makes it easy to package and
              share new visulizations as reusable layers. We already offer
              a <a href="/#/layers/catalog/overview">catalog of proven layers</a> and
              we have many more in the works.
              </p>

              <h3>High-Precision Computations in the GPU</h3>
              <p>
              By emulating 64 bit floating point computations in the GPU,
              deck.gl renders datasets with unparalleled accuracy and
              performance.
              </p>

              <h3>React and Mapbox GL Integrations</h3>
              <p>
              deck.gl is a great match with React, supporting
              efficient WebGL rendering under the Reactive programming
              paradigm. And when used with Mapbox GL it automatically
              coordinates with the Mapbox camera system to provide
              compelling 2D and 3D visualizations on top of your Mapbox
              based maps.
              </p>

            </div>
          </div>
          <a href="#/layers/catalog/overview">
            <div className="image" />
          </a>
        </section>

        <section id="buttons">
          <a href="https://github.com/uber/deck.gl/">
            <button>Github</button>
          </a>
        </section>

        <hr />

        <section id="footer">
          <div className="container">
            <h4>Made by</h4>
            <img src="images/uber-logo.png" />
          </div>
        </section>

      </div>
    );
  }
}

export default connect(state => state, {loadData, updateMap})(Home);
