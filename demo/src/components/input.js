import React, {Component} from 'react';
import pureRender from 'pure-render-decorator';
import autobind from 'autobind-decorator';

@pureRender
export default class GenericInput extends Component {

  @autobind _onChange(evt) {
    const {value, type} = evt.target;
    let newValue = value;
    if (type === 'checkbox') {
      newValue = evt.target.checked;
    }
    if (type === 'number') {
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

  render() {
    const {displayName, type, displayValue} = this.props;
    const props = {...this.props};
    delete props.displayName;
    delete props.displayValue;

    if (type === 'function') {
      // non-editable
      return (<div className="input">
        <label>{displayName}</label>
        <input type="text" disabled value={displayValue} />
      </div>);
    }

    if (type === 'checkbox') {
      props.checked = props.value;
    }

    return (
      <div className="input">
        <label>{displayName}</label>
        <div className="tooltip">{displayName}: {displayValue}</div>
        <input
          {...props}
          value={displayValue}
          onChange={ this._onChange }/>
      </div>
    );
  }
}
