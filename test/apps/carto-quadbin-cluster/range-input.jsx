/* global requestAnimationFrame, cancelAnimationFrame */
import React, {useEffect, useState} from 'react';
import {styled, withStyles} from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

const PositionContainer = styled('div')({
  position: 'absolute',
  zIndex: 1,
  bottom: '40px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const COLOR = '#f5f1d8';

const SliderInput = withStyles({
  root: {
    marginLeft: 12,
    width: '40%',
    color: COLOR
  },
  valueLabel: {
    '& span': {
      whiteSpace: 'nowrap',
      background: 'none',
      color: COLOR
    }
  }
})(Slider);

export default function RangeInput({
  min,
  max,
  value,
  onChange,
  formatLabel,
  bottom = 40,
  name = ''
}) {
  return (
    <PositionContainer style={{color: COLOR, bottom}}>
      <label>{name}</label>
      <SliderInput
        min={min}
        max={max}
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        valueLabelDisplay="on"
        valueLabelFormat={formatLabel}
      />
    </PositionContainer>
  );
}
