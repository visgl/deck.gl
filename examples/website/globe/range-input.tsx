// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

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

const SliderInput = withStyles({
  root: {
    marginLeft: 12,
    width: '40%'
  },
  valueLabel: {
    '& span': {
      whiteSpace: 'nowrap',
      background: 'none',
      color: '#fff'
    }
  }
})(Slider);

export default function RangeInput({
  min,
  max,
  value,
  animationSpeed,
  onChange,
  formatLabel
}: {
  min: number;
  max: number;
  value: number;
  animationSpeed: number;
  formatLabel: (x: number) => string;
  onChange: (newValue: number) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

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
    <PositionContainer>
      <Button
        color="primary"
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? 'Stop' : 'Animate'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <SliderInput
        min={min}
        max={max}
        value={value}
        onChange={(event, newValue) => onChange(newValue as number)}
        valueLabelDisplay="on"
        valueLabelFormat={formatLabel}
      />
    </PositionContainer>
  );
}
