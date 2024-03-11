import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/i3s/app';

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

  render() {
    return <App />;
  }
}

export default makeExample(ArcGISDemo);
