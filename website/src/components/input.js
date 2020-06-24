import React, {PureComponent} from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
position: relative;
width: 100%;

&:last-child {
  margin-bottom: 20px;
}

>* {
  vertical-align: middle;
  white-space: nowrap;
}
label {
  display: inline-block;
  width: 40%;
  margin-right: 10%;
  margin-top: 2px;
  margin-bottom: 2px;
}
input, a, button {
  background: #fff;
  font-size: 0.9em;
  text-transform: none;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
  padding: 0 4px;
  margin: 0;
  width: 50%;
  height: 20px;
  line-height: 1.833;
  text-align: left;
}
button {
  color: initial;
}
button:disabled {
  color: #aaa;
  cursor: default;
  background: #eee;
}
input {
  border: solid 1px #ccc;

  &:disabled {
    background: ${props => props.theme.colors.white};;
  }
  &[type="checkbox"] {
    height: auto;
  }
}

.tooltip {
  left: 50%;
  top: 24px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms;
}
&:hover .tooltip {
  opacity: 1;
}
`;

export default class GenericInput extends PureComponent {
  _onChange(evt) {
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

  _resetFunction() {
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
          <button type="text" disabled={!editable} onClick={ this._resetFunction.bind(this) }>{displayValue}</button>
        </div>
      );
    }
    if (type === 'select') {
      return (
        <div className="input">
          <label>{displayName}</label>
          <select onChange={this._onChange.bind(this)} value={displayValue}>
            {props.options.map(((value, i) => <option key={i} value={value}>{value}</option>))}
          </select>
        </div>
      );
    }

    if (type === 'checkbox') {
      props.checked = props.value;
    }

    return (
      <InputContainer>
        <label>{displayName}</label>
        <div className="tooltip">
          {displayName}: {String(displayValue)}
        </div>
        <input {...props} value={displayValue} onChange={this._onChange.bind(this)} />
      </InputContainer>
    );
  }
}
