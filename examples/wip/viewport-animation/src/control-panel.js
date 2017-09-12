import React, {PureComponent} from 'react';

import CITIES from '../../data/cities.json';

const defaultContainer = ({children}) => <div className="control-panel">{children}</div>;

export default class ControlPanel extends PureComponent {

  _renderButton(city, index) {
    return (
      <div key={`btn-${index}`} className="input" >
        <input type="radio" name="city"
          id={`city-${index}`}
          defaultChecked={city.city === 'San Francisco'}
          onClick={() => this.props.onViewportChange(city)} />
        <label htmlFor={`city-${index}`}>{city.city}</label>
      </div>
    );
  }

  render() {
    const Container = this.props.containerComponent || defaultContainer;

    return (
      <Container>
        <h3>Camera Transition</h3>
        <p>Smooth animate of the viewport.</p>
        <div className="source-link">
          <a
            href="https://github.com/uber/react-map-gl/tree/master/examples/viewport-animation"
            target="_new">
            View Code ↗
          </a>
        </div>
        <hr />

        { CITIES.map(this._renderButton.bind(this)) }
      </Container>
    );
  }
}
