import React, {PureComponent} from 'react';
import autobind from 'autobind-decorator';

export default class GenericInput extends PureComponent {
  @autobind _onChange(evt) {
    const {value, type} = evt.target;
    let newValue = value;
    if (type === 'checkbox') {
      newValue = evt.target.checked;
    }
    if (type === 'range') {
      newValue = Number(value);
      if (this.props.min !== undefined) {
        newValue = Math.max(this.props.min, newValue);
      }
      if (this.props.max !== undefined) {
        newValue = Math.min(this.props.max, newValue);
      }
    }
    return this.props.onChange(this.props.name, newValue);
  }

  @autobind _resetFunction() {
    return this.props.onChange(this.props.name, this.props.altValue);
  }

  render() {
    const {displayName, type, displayValue} = this.props;
    const props = {...this.props};
    delete props.displayName;
    delete props.displayValue;
    delete props.altType;
    delete props.altValue;

    if (type === 'link') {
      return (
        <div className="input">
          <label>{displayName}</label>
          <a href={displayValue} target="_new">
            {displayValue}
          </a>
        </div>
      );
    }
    if (type === 'function' || type === 'json') {
      const editable = 'altValue' in this.props;
      return (
        <div className="input">
          <label>{displayName}</label>
          <button type="text" disabled={!editable} onClick={ this._resetFunction }>{displayValue}</button>
        </div>
      );
    }

    if (type === 'checkbox') {
      props.checked = props.value;
    }

    return (
      <div className="input">
        <label>{displayName}</label>
        <div className="tooltip">
          {displayName}: {displayValue}
        </div>
        <input {...props} value={displayValue} onChange={this._onChange} />
      </div>
    );
  }
}
