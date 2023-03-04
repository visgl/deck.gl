import React, {Component, createRef} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import {renderToDOM} from 'website-examples/i3s/app';

import {makeExample} from '../components';

class ArcGISDemo extends Component {
  static title = 'San Francisco 3D Buildings';

  static code = `${GITHUB_TREE}/examples/website/i3s`;

  static renderInfo(meta) {
    return (
      <div>
        <p>
          Highly detailed LoD2 textured 3D buildings for downtown San Francisco in I3S format,
          visualized with deck.gl's Tile3DLayer. This data is provided by{' '}
          <a href="https://www.precisionlightworks.com/">Precision Light Works (PLW)</a>.
        </p>
        <div>
          <img
            src="http://downloads.esri.com/blogs/arcgisonline/esrilogo_new.png"
            alt="ESRI logo"
          />
          <a href="https://www.arcgis.com/home/item.html?id=d3344ba99c3f4efaa909ccfbcc052ed5">
            Data profile page
          </a>
        </div>
      </div>
    );
  }

  _containerRef = createRef();

  componentDidMount() {
    /* global document */
    // Attach arcgis stylesheet
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', 'https://js.arcgis.com/4.16/esri/themes/light/main.css');
    document.head.appendChild(style);

    renderToDOM(this._containerRef.current).then(instance => (this._view = instance));
  }

  componentWillUnmount() {
    if (this._view) {
      this._view.remove();
    }
  }

  render() {
    return <div ref={this._containerRef} style={{width: '100%', height: '100%'}} />;
  }
}

export default makeExample(ArcGISDemo);
