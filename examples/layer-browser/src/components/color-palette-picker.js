import React, {PureComponent} from 'react';
import {getColorArray, getColorHex} from './color-picker';
import colorbrewer from 'colorbrewer';

function entries(obj) {
  return Object.keys(obj).map(k => [k, obj[k]]);
}

const cbNames = [
  'YlOrRd',
  'YlGnBu',
  'PuRd',
  'YlGn',
  // 'Greens', 'Reds', 'Blues', 'RdYlGn',
  'Spectral'
];
const flip = ['RdYlGn', 'Spectral'];

const colorbrewerColors = [];
for (const [keyName, colorScheme] of entries(colorbrewer)) {
  for (const [lenKey, colors] of entries(colorScheme)) {
    if (lenKey === '6' && cbNames.includes(keyName)) {
      colorbrewerColors.push({
        name: `${keyName}-${lenKey}`,
        colors: flip.includes(keyName) ? colors.slice().reverse() : colors
      });
    }
  }
}

function isSamePalette(colors1, colors2) {
  return colors1.length === colors2.length && colors1.every((c, i) => c === colors2[i]);
}

export default class ColorPalettePicker extends PureComponent {
  _renderPalette(name, colors, isCurrent) {
    const width = `${80 / colors.length}%`;
    const {onChange} = this.props;

    return (
      <div key={name} style={{display: 'inline'}}>
        <div className="block" style={{width: '20%'}}>
          <input
            type="checkbox"
            id="colorRange"
            checked={isCurrent}
            onChange={() => onChange(colors.map(getColorArray))}
          />
        </div>
        {colors.map(color => (
          <div className="block" key={color} style={{background: color, width}} />
        ))}
      </div>
    );
  }

  render() {
    const currentColors = this.props.value.map(getColorHex);

    return (
      <div className="color-palette-picker">
        {colorbrewerColors.map(({name, colors}) =>
          this._renderPalette(name, colors, isSamePalette(currentColors, colors))
        )}
      </div>
    );
  }
}
