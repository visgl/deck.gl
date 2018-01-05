import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TWEEN from 'tween.js';

const propTypes = {
  settings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default class ControlPanel extends Component {
  constructor(props) {
    super(props);

    const timeState = {time: 0};

    this.timeTween = new TWEEN.Tween(timeState)
      .to({time: 1800}, 60000)
      .onUpdate(() => this.props.onChange(timeState))
      .repeat(Infinity);
  }

  _renderToggle(key, displayName) {
    return (
      <div className="input">
        <label>{displayName}</label>
        <input
          type="checkbox"
          checked={this.props.settings[key] || false}
          onChange={e => this.props.onChange({[key]: e.target.checked})}
        />
      </div>
    );
  }

  _renderSlider(key, displayName, props) {
    return (
      <div className="input">
        <label>{displayName}</label>
        <input
          type="range"
          {...props}
          value={this.props.settings[key] || 0}
          onChange={e => this.props.onChange({[key]: e.target.value})}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        {this._renderToggle('showParticles', 'particles')}
        {this._renderToggle('showWind', 'field')}
        {this._renderToggle('showElevation', 'elevation')}
        {this._renderToggle('useDevicePixels', 'Retina/ HD')}
        {this._renderSlider('time', 'time', {min: 0, max: 70, step: 0.1})}
      </div>
    );
  }
}

ControlPanel.propTypes = propTypes;
