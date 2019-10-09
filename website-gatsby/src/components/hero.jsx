import React, {Component} from 'react';
import {Link} from 'gatsby';
import Stats from 'stats.js';

export default class Hero extends Component {

  componentDidMount() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    if (this.refs.fps) {
      this.refs.fps.appendChild(this.stats.dom);
    }

    const calcFPS = () => {
      this.stats.begin();
      this.stats.end();
      this.animationFrame = window.requestAnimationFrame(calcFPS);
    };

    this.animationFrame = window.requestAnimationFrame(calcFPS);
  }

  componentWillUnmount() {
    window.onresize = null;
    window.cancelAnimationFrame(this.animationFrame);
  }

  render() {
    return (
      <section ref="banner" className="banner">
        <div className="f hero">
          <ExampleRunner example={HeroExample} sourceLink={HeroExample.path} noPanel noStats />
        </div>
        <div className="container" style={{background: 'transparent'}}>
          <h1>loaders.gl</h1>
          <p>Framework-independent loaders for visualization, 3D graphics and geospatial formats</p>
          <Link to="/docs/get-started" className="btn">
            GET STARTED
          </Link>
        </div>
        <div ref="fps" className="fps" />
      </section>
    );
  }
}
