import React, {PureComponent} from 'react';
import ColorPicker from './color-picker';
import ColorPalettePicker from './color-palette-picker';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';

const PROP_TYPES = {
  title: PropTypes.string,
  settings: PropTypes.object.isRequired,
  propTypes: PropTypes.object
  // layer:
};

const defaultProps = {
  title: '',
  propTypes: {}
};

const PROP_BLACK_LIST = new Set([
  'coordinateSystem',
  'coordinateOrigin',
  'fetch',
  'dataTransform',
  'dataComparator',
  'updateTriggers',
  'onHover',
  'onClick',
  'highlightedObjectIndex',
  'parameters',
  'uniforms',
  'scenegraph'
]);

function isAccessor(settingName) {
  return settingName.indexOf('get') === 0;
}

export default class LayerControls extends PureComponent {
  static getSettings(props) {
    const keys = [];
    for (const key in props) {
      if (!PROP_BLACK_LIST.has(key)) {
        keys.push(key);
      }
    }
    keys.sort();

    const settings = {};
    for (const key of keys) {
      settings[key] = props[key];
    }
    return settings;
  }

  constructor(props) {
    super(props);
    autobind(this);

    this.renderers = {
      number: this._renderSlider,
      boolean: this._renderCheckbox,
      category: this._renderSelect,
      color: this._renderColorPicker
    };
  }

  _getPropTypes() {
    const {layer, propTypes} = this.props;
    return Object.assign({}, layer && layer._propTypes, propTypes);
  }

  _onToggleTransition(settingName, transitioned) {
    const {settings} = this.props;
    const newSettings = {
      ...settings,
      transitions: {
        ...settings.transitions
      }
    };
    newSettings.transitions[settingName] = transitioned ? 600 : 0;
    this.props.onChange(newSettings);
  }

  _onToggleConstant(settingName, value, useConstant) {
    const {settings} = this.props;
    const newSettings = {...settings};
    newSettings[settingName] = useConstant ? value : d => value;
    this.props.onChange(newSettings);
  }

  _onValueChange(settingName, newValue) {
    const {settings} = this.props;
    const propTypes = this._getPropTypes();

    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {...settings};

      if (propTypes[settingName] && propTypes[settingName].onUpdate) {
        propTypes[settingName].onUpdate(newValue, newSettings, (name, value) =>
          this._onValueChange(name, value)
        );
        return;
      } else if (isAccessor(settingName)) {
        const useConstant = typeof newSettings[settingName] !== 'function';
        newSettings[settingName] = useConstant ? newValue : d => newValue;
        newSettings.updateTriggers = {
          ...newSettings.updateTriggers,
          [settingName]: Date.now()
        };
      } else {
        newSettings[settingName] = newValue;
      }

      this.props.onChange(newSettings);
    }
  }

  _renderTransitionSelector({settingName, transition}) {
    if (isAccessor(settingName)) {
      const active = Boolean(transition);
      return (
        <div
          className={`addon ${active ? 'on' : ''}`}
          onClick={() => this._onToggleTransition(settingName, !active)}
        >
          T
        </div>
      );
    }
    return <div />;
  }

  _renderConstantSelector({settingName, value, originalValue}) {
    if (isAccessor(settingName)) {
      const active = typeof originalValue !== 'function';
      return (
        <div
          className={`addon ${active ? 'on' : ''}`}
          onClick={() => this._onToggleConstant(settingName, value, !active)}
        >
          C
        </div>
      );
    }
    return <div />;
  }

  _renderColorPicker({settingName, value, propType}) {
    const onChange = this._onValueChange.bind(this, settingName);

    return settingName === 'colorRange' ? (
      <ColorPalettePicker value={value} onChange={onChange} />
    ) : (
      <ColorPicker value={value} onChange={onChange} />
    );
  }

  _renderSlider({settingName, value, propType}) {
    let min;
    let max;

    if (propType && Number.isFinite(propType.min)) {
      min = propType.min;
    } else {
      min = 0;
    }

    if (propType && Number.isFinite(propType.max)) {
      max = propType.max;
    } else if (/angle/i.test(settingName)) {
      max = 360;
    } else {
      max = 100;
    }

    return (
      <input
        type="range"
        id={settingName}
        min={min}
        max={max}
        step={max / 100}
        value={value}
        onChange={e => this._onValueChange(settingName, Number(e.target.value))}
      />
    );
  }

  _renderCheckbox({settingName, value}) {
    return (
      <input
        type="checkbox"
        id={settingName}
        checked={value}
        onChange={e => this._onValueChange(settingName, e.target.checked)}
      />
    );
  }

  _renderSelect({settingName, value, propType}) {
    const {value: options} = propType;
    if (!options || !options.length) {
      return null;
    }
    return (
      <select value={value} onChange={e => this._onValueChange(settingName, e.target.value)}>
        {options.map((val, idx) => (
          <option key={idx} value={val}>
            {val}
          </option>
        ))}
      </select>
    );
  }

  /* eslint-disable complexity */
  _renderSetting({settingName, value, propType, data, transitions}) {
    const originalValue = value;

    if (typeof value === 'function' && isAccessor(settingName)) {
      try {
        // infer type by executing an accessor
        value = value(data && data[0]);
      } catch (err) {
        // ignore
      }
    }

    const type = propType && propType.type;

    switch (propType && propType.type) {
      case 'compound':
        const {settings, propTypes = {}} = this.props;
        return propType.elements.map(name =>
          this._renderSetting({
            settingName: name,
            value: settings[name],
            propType: propTypes[name],
            data
          })
        );
      default:
        break;
    }

    const renderer =
      this.renderers[type] ||
      (/color/i.test(settingName) && Array.isArray(value) && this.renderers.color) ||
      this.renderers[typeof value];

    return (
      renderer && (
        <div key={settingName}>
          <div className="input-group">
            <label>{settingName}</label>
            <div className="input">{renderer({settingName, value, propType, originalValue})}</div>
            {this._renderTransitionSelector({
              settingName,
              transition: transitions && transitions[settingName]
            })}
            {this._renderConstantSelector({settingName, value, originalValue})}
          </div>
        </div>
      )
    );
  }
  /* eslint-enable complexity */

  render() {
    const {title, settings} = this.props;
    const propTypes = this._getPropTypes();

    return (
      <div className="layer-controls">
        {title && <h4>{title}</h4>}
        {Object.keys(settings).map(key =>
          this._renderSetting({
            settingName: key,
            value: settings[key],
            propType: propTypes[key],
            data: settings.data,
            transitions: settings.transitions
          })
        )}
      </div>
    );
  }
}

LayerControls.propTypes = PROP_TYPES;
LayerControls.defaultProps = defaultProps;
