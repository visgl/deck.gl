import React, {PureComponent} from 'react';
import ColorPicker from './utils/color-picker';
import ColorPalettePicker from './utils/color-palette-picker';

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
    const props = {value, onChange: this._onValueChange.bind(this, settingName)};

    return (
      <div key={settingName}>
        <div className="input-group" >
          <label>{settingName}</label>
          {settingName === 'colorRange' ?
            <ColorPalettePicker {...props}/> : <ColorPicker {...props}/>}
        </div>
      </div>
    );
  }

  _renderSlider(settingName, value) {
    let max = 1;
    if (/radiusScale|elevationScale|width|height|pixel|size|miter/i.test(settingName) &&
      (/^((?!scale).)*$/).test(settingName)) {
      max = 100;
    }

    if (settingName === 'cellSize' || settingName === 'radius') {
      // cell size and radius are in meters
      max = 3000;
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
