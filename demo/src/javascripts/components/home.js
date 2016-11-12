import 'babel-polyfill';
import Stats from 'stats.js';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Demos from './demos';
import {updateMap, setHeaderOpacity} from '../actions/app-actions';
import Map from './map';
import ViewportAnimation from '../utils/map-utils';

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
    const opacity = Math.max(0, Math.min(1, (y - 168) / 20));
    this.props.setHeaderOpacity(opacity);
  }

  render() {
    const {atTop} = this.state;
    return (
      <div className={`home-wrapper ${atTop ? 'top' : ''}`}>

        <section ref="banner" id="banner">
          <div className="hero">
            <Map demo="HomeDemo" isInteractive={false} />
          </div>
          <div className="container soft-left">
            <h1>deck.gl</h1>
            <p>Large-scale WebGL-powered Data Visualization</p>
            <a href="#/documentation/overview/getting-started" className="btn">Get started</a>
          </div>
          <div ref="fps" className="fps" />
        </section>

        <section id="features">
          <div className="image" />
          <div className="container soft-left texts">
            <div>
              <h2>
                deck.gl is a WebGL-powered framework for visual exploratory
                data analysis of large datasets.
              </h2>
              <hr className="short" />

              <h3>
                <img src="images/icon-layers.svg" />
                A Layered Approach to Data Visualization
              </h3>
              <p>
              deck.gl allows complex visualizations to be constructed by
              composing existing layers, and makes it easy to package and
              share new visulizations as reusable layers. We already offer
              a <a href="#/layers/catalog/overview">catalog of proven layers</a> and
              we have many more in the works.
              </p>

              <h3>
                <img src="images/icon-high-precision.svg" />
                High-Precision Computations in the GPU
              </h3>
              <p>
              By emulating 64 bit floating point computations in the GPU,
              deck.gl renders datasets with unparalleled accuracy and
              performance.
              </p>

              <h3>
                <img src="images/icon-react.svg" />
                React and Mapbox GL Integrations
              </h3>
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

          <div className="container text-center buttons">
            <a href="#/documentation/overview/getting-started" className="btn">
              Get Started <i className="icon icon-arrow-right" />
            </a>
            <a href="https://github.com/uber/deck.gl" className="btn">
              View on Github <i className="icon icon-github" />
            </a>
            <a href="#/examples" className="btn">
              See examples <i className="icon icon-gallery" />
            </a>
          </div>
        </section>


        <hr />

        <section id="footer">
          <div className="container soft-left">
            <h4>Made by</h4>
            <i className="icon icon-uber-logo" />
          </div>
        </section>

      </div>
    );
  }
}

export default connect(
  state => ({}),
  {updateMap, setHeaderOpacity}
)(Home);
