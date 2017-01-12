import React, {PureComponent} from 'react';

export default class LayerControls extends PureComponent {

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
      <div key={settingName} >
        <div className="input-group" >
          <label className="label" htmlFor={settingName}>
            {title}
          </label>
          <input
            type="range"
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
      <div id="layer-controls" >
        <h4>Layer Controls</h4>
        {this._renderSlider('separation', {}, settings.separation, 'Separation')}
        {this._renderSlider('rotationZ', {}, settings.rotationZ, 'Rotation (in plane)')}
        {this._renderSlider('rotationX', {}, settings.rotationX, 'Rotation (3D)')}
      </div>
    );
  }
}
