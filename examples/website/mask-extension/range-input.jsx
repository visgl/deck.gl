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

export default function RangeInput({min, max, value, animationSpeed, onChange, formatLabel}) {
  const [isPlaying, setIsPlaying] = useState(true);

  // prettier-ignore
  useEffect(() => {
    let animation;

    if (isPlaying) {
      animation = requestAnimationFrame(() => {
        let nextValue = value + animationSpeed;
        if (nextValue > max) {
          nextValue = min;
        }
        onChange(nextValue);
      });
    }

    return () => animation && cancelAnimationFrame(animation);
  });

  return (
    <PositionContainer style={{color: COLOR}}>
      <Button color="inherit" onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? <PauseIcon title="Stop" /> : <PlayIcon title="Animate" />}
      </Button>
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
