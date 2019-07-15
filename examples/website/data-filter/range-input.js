/* global requestAnimationFrame, cancelAnimationFrame */
import React, {PureComponent} from 'react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {LightTheme, BaseProvider, styled} from 'baseui';
import {Slider} from 'baseui/slider';
import {Button, SHAPE, SIZE} from 'baseui/button';
import Start from 'baseui/icon/chevron-right';
import Stop from 'baseui/icon/delete';

const engine = new Styletron();

const Container = styled('div', {
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
  bottom: '20px',
  width: '100%'
});

const ThumbValue = styled('div', {
  position: 'absolute',
  top: '-2em'
});

const TickBar = styled('div', {
  width: '480px',
  height: '24px',
  maxWidth: '80vw'
});

const ANIMATION_SPEED = 30;

export default class RangeInput extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false
    };

    this._renderThumbValue = this._renderThumbValue.bind(this);
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
    const {min, max, value} = this.props;
    const span = value[1] - value[0];
    let newValueMin = value[0] + ANIMATION_SPEED;
    if (newValueMin + span >= max) {
      newValueMin = min;
    }
    this.props.onChange({
      value: [newValueMin, newValueMin + span]
    });

    this._animationFrame = requestAnimationFrame(this._animate);
  }

  _renderThumbValue({$thumbIndex, $value}) {
    const value = $value[$thumbIndex];
    return <ThumbValue>{this.props.formatLabel(value)}</ThumbValue>;
  }

  render() {
    const {value, min, max} = this.props;
    const isButtonEnabled = value[0] > min || value[1] < max;

    return (
      <StyletronProvider value={engine}>
        <BaseProvider theme={LightTheme}>
          <Container>
            <Button
              shape={SHAPE.round}
              size={SIZE.compact}
              disabled={!isButtonEnabled}
              onClick={this._toggle}
            >
              {this.state.isPlaying ? <Stop title="Stop" /> : <Start title="Animate" />}
            </Button>
            <Slider
              {...this.props}
              overrides={{
                ThumbValue: this._renderThumbValue,
                TickBar: () => <TickBar />
              }}
            />
          </Container>
        </BaseProvider>
      </StyletronProvider>
    );
  }
}
