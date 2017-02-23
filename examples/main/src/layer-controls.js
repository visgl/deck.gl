import React, {PureComponent} from 'react';
import ColorPicker from './utils/color-picker';

export default class LayerControls extends PureComponent {

  _onValueChange(settingName, newValue) {
    const {settings} = this.props;
    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {...this.props.settings};

      if (settingName.indexOf('get') === 0) {
        newSettings[settingName] = d => newValue;
        newSettings.updateTriggers = {
          ...newSettings.updateTriggers,
          [settingName]: {value: newValue.toString()}
        };
      } else {
        newSettings[settingName] = newValue;
      }

      this.props.onChange(newSettings);
    }
  }

  _renderColorPicker(settingName, value) {
    return (
      <div key={settingName}>
        <div className="input-group" >
          <label>{settingName}</label>
          <ColorPicker value={value}
            onChange={this._onValueChange.bind(this, settingName)} />
        </div>
      </div>
    );
  }

  _renderSlider(settingName, value) {
    let max = 1;
    if (/radius|width|height|pixel|size|miter/i.test(settingName) &&
      (/^((?!scale).)*$/).test(settingName)) {
      max = 100;
    }

    if (settingName === 'cellSize') {
      // cell size is in meters
      max = 10000;
    }

    return (
      <div key={settingName} >
        <div className="input-group" >
          <label className="label" htmlFor={settingName}>
            {settingName}
          </label>
          <div>
            <input
              type="range"
              id={settingName}
              min={0} max={max} step={max / 100}
              value={value}
              onChange={ e => this._onValueChange(settingName, Number(e.target.value)) }/>
          </div>
        </div>
      </div>
    );
  }

  _renderCheckbox(settingName, value) {
    return (
      <div key={settingName} >
        <div className="input-group" >
          <label htmlFor={settingName}>
            <span>{settingName}</span>
          </label>
          <input
            type="checkbox"
            id={settingName}
            checked={value}
            onChange={ e => this._onValueChange(settingName, e.target.checked) }/>
        </div>
      </div>
    );
  }

  _renderSetting(settingName, value) {
    switch (typeof value) {
    case 'boolean':
      return this._renderCheckbox(settingName, value);
    case 'number':
      return this._renderSlider(settingName, value);
    default:
      if (/color/i.test(settingName)) {
        return this._renderColorPicker(settingName, value);
      }
    }
    return null;
  }

  render() {
    const {title, settings} = this.props;
    return (
      <div className="layer-controls" >
        { title && <h4>{title}</h4>}
        { Object.keys(settings).map(key => this._renderSetting(key, settings[key])) }
      </div>
    );
  }
}
