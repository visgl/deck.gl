/* global requestAnimationFrame, cancelAnimationFrame */
import React, {PureComponent} from 'react';
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
      background: 'none',
      color: '#000'
    }
  }
})(Slider);

export default class RangeInput extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false
    };

    this._animate = this._animate.bind(this);
    this._toggle = this._toggle.bind(this);
    this._animationFrame = null;
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._animationFrame);
  }

  _toggle() {
    cancelAnimationFrame(this._animationFrame);
    const {isPlaying} = this.state;
    if (!isPlaying) {
      this._animate();
    }
    this.setState({isPlaying: !isPlaying});
  }

  _animate() {
    const {min, max, value, animationSpeed} = this.props;
    const span = value[1] - value[0];
    let newValueMin = value[0] + animationSpeed;
    if (newValueMin + span >= max) {
      newValueMin = min;
    }
    this.props.onChange([newValueMin, newValueMin + span]);

    this._animationFrame = requestAnimationFrame(this._animate);
  }

  render() {
    const {value, min, max, onChange, formatLabel} = this.props;
    const isButtonEnabled = value[0] > min || value[1] < max;

    return (
      <PositionContainer>
        <Button color="primary" disabled={!isButtonEnabled} onClick={this._toggle}>
          {this.state.isPlaying ? <PauseIcon title="Stop" /> : <PlayIcon title="Animate" />}
        </Button>
        <SliderInput
          min={min}
          max={max}
          value={value}
          onChange={(event, newValue) => onChange(newValue)}
          valueLabelDisplay="auto"
          valueLabelFormat={formatLabel}
        />
      </PositionContainer>
    );
  }
}
