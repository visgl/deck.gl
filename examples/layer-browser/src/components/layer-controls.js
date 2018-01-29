import React, {PureComponent} from 'react';
import ColorPicker from './color-picker';
import ColorPalettePicker from './color-palette-picker';

export default class LayerControls extends PureComponent {
  _onValueChange(settingName, newValue) {
    const {settings, propTypes = {}} = this.props;
    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {...this.props.settings};

      if (propTypes[settingName] && propTypes[settingName].onUpdate) {
        propTypes[settingName].onUpdate(newValue, newSettings, (name, value) =>
          this._onValueChange(name, value)
        );
        return;
      } else if (settingName.indexOf('get') === 0) {
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
        <div className="input-group">
          <label>{settingName}</label>
          {settingName === 'colorRange' ? (
            <ColorPalettePicker {...props} />
          ) : (
            <ColorPicker {...props} />
          )}
        </div>
      </div>
    );
  }

  _renderSlider(settingName, value, propType) {
    let max;

    if (propType && Number.isFinite(propType.max)) {
      max = propType.max;
    } else if (
      /radius|scale|width|height|pixel|size|miter/i.test(settingName) &&
      /^((?!scale).)*$/.test(settingName)
    ) {
      max = 100;
    } else {
      max = 1;
    }

    return (
      <div key={settingName}>
        <div className="input-group">
          <label className="label" htmlFor={settingName}>
            {settingName}
          </label>
          <div>
            <input
              type="range"
              id={settingName}
              min={0}
              max={max}
              step={max / 100}
              value={value}
              onChange={e => this._onValueChange(settingName, Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    );
  }

  _renderCheckbox(settingName, value) {
    return (
      <div key={settingName}>
        <div className="input-group">
          <label htmlFor={settingName}>
            <span>{settingName}</span>
          </label>
          <input
            type="checkbox"
            id={settingName}
            checked={value}
            onChange={e => this._onValueChange(settingName, e.target.checked)}
          />
        </div>
      </div>
    );
  }

  _renderSetting(settingName, value, propType) {
    // first test if proptype is already defined
    if (propType && propType.type) {
      switch (propType.type) {
        case 'number':
          return this._renderSlider(settingName, value, propType);
        case 'compound':
          const {settings, propTypes = {}} = this.props;
          return propType.elements.map(name =>
            this._renderSetting(name, settings[name], propTypes[name])
          );
        default:
          break;
      }
    }

    switch (typeof value) {
      case 'boolean':
        return this._renderCheckbox(settingName, value, propType);
      case 'number':
        return this._renderSlider(settingName, value, propType);
      default:
        if (/color/i.test(settingName)) {
          return this._renderColorPicker(settingName, value, propType);
        }
    }
    return null;
  }

  // Get all inherited property keys
  _getAllKeys(object) {
    const keys = [];
    for (const key in object) {
      keys.push(key);
    }
    return keys;
  }

  render() {
    const {title, settings, propTypes = {}} = this.props;

    return (
      <div className="layer-controls">
        {title && <h4>{title}</h4>}
        {this._getAllKeys(settings).map(key =>
          this._renderSetting(key, settings[key], propTypes[key])
        )}
      </div>
    );
  }
}
