import React, {Component} from 'react';
import TWEEN from 'tween.js';

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
        <input type="checkbox"
          checked={this.props.params[key]}
          onChange={ e => this.props.onChange({[key]: e.target.checked}) } />
      </div>
    );
  }

  _renderSlider(key, displayName, props) {
    return (
      <div className="input">
        <label>{displayName}</label>
        <input type="range" {...props}
          value={this.props.params[key]}
          onChange={ e => this.props.onChange({[key]: e.target.value}) } />
      </div>
    );
  }

  render() {
    return (
      <div>
        { this._renderToggle('toggleParticles', 'particles') }
        { this._renderToggle('toggleWind', 'field') }
        { this._renderToggle('toggleElevation', 'elevation') }
        { this._renderSlider('time', 'time', {min: 0, max: 70, step: 0.1}) }
      </div>
    );
  }
}
