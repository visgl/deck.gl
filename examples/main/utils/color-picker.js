/* global document */
import React, {PureComponent} from 'react';

function pad2(str) {
  while (str.length < 2) {
    str = `0${str}`;
  }
  return str;
}

function toHexString(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'function') {
    const funcText = value.toString();
    const colorArray = (funcText.match(/\[\d+(,\s*\d+){2,3}\]/) || [])[0];
    if (colorArray) {
      value = JSON.parse(colorArray);
    }
  }
  if (Array.isArray(value) && value.length >= 3) {
    return `#${value.slice(0, 3).map(v => pad2(v.toString(16))).join('')}`;
  }
  return '#888';
}

function hexStringToArray(str) {
  return [
    parseInt(str.slice(1, 3), 16),
    parseInt(str.slice(3, 5), 16),
    parseInt(str.slice(5, 7), 16)
  ];
}

export default class ColorPicker extends PureComponent {

  _onClick(color) {
    const {onChange} = this.props;
    const input = document.createElement('input');
    input.type = 'color';
    input.value = color;
    input.onchange = () => onChange(hexStringToArray(input.value));
    input.onblur = () => document.body.removeChild(input);

    document.body.appendChild(input);
    input.click();
  }

  render() {
    const color = toHexString(this.props.value);
    return (
      <div className="color-picker" style={{background: color}}
        onClick={ this._onClick.bind(this, color) } />
    );
  }
}
