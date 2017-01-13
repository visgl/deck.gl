/* eslint-disable no-unused-vars */
/* eslint-disable no-inline-comments */
import React, {Component} from 'react';

export default class LayerControls extends Component {

  _onSliderChange(settingName, e) {
    const newValue = Number(e.target.value);
    const {settings} = this.props;
    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      this.props.onSettingsChange({
        ...settings,
        [settingName]: newValue
      });
    }
  }

  _renderSlider(settingName, setting, value, title) {
    return (
      <div key={settingName} style={{marginTop: 0, marginLeft: 30, marginRight: 30}}>
        <div className="input-group" style={{width: '100%'}}>
          <label className="label" htmlFor={settingName}>
            {title}
          </label>
          <input
            type="range"
            style={{width: '100%'}}
            id={settingName}
            min={setting.min || 0}
            max={setting.max || 1}
            step={setting.step || 0.01}
            value={value}
            onChange={this._onSliderChange.bind(this, settingName)}/>
        </div>
      </div>
    );
  }

  render() {
    const {settings} = this.props;
    return (
      <div className="layer-controls" style={{marginTop: 0, padding: 0, width: 270}}>
        <h4>Layer Controls</h4>
        {this._renderSlider('separation', {}, settings.separation, 'Separation')}
        {this._renderSlider('rotation', {}, settings.rotation, 'Rotation')}
      </div>
    );
  }
}
