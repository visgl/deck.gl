import React, {Component, createRef} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import {renderToDOM} from 'website-examples/election/app';

import makeExample from '../components/example';

class GoogleMapsDemo extends Component {
  static title = 'US Presidential Election 2000-2016';
  
  static code = `${GITHUB_TREE}/examples/website/google-3d`;

  static parameters = {
    year: {displayName: 'Year', type: 'range', value: 2016, step: 4, min: 2000, max: 2016}
  };

  static renderInfo(meta) {
    return (
      <div>
        <p>Interleaving 3D layers with Google Maps</p>

        <p><a href="https://sketchfab.com/3d-models/low-poly-truck-98826ebd44e2492298ac925461509216">Low Poly Truck</a>
        model by <a href="https://sketchfab.com/Arifido._">Arifido._</a>
        licensed under <a href="http://creativecommons.org/licenses/by/4.0/">CC-BY-4.0</a></p>
      </div>
    );
  }

  _containerRef = createRef();

  componentDidMount() {
    const {data, params} = this.props;
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

export default makeExample(GoogleMapsDemo);
