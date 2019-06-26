import React, {Fragment, Component} from 'react';

class RangeSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minValue: this.props.defaultMin || this.props.range[0],
      maxValue: this.props.defaultMax || this.props.range[1]
    };
    this.handleRangeChange = this.handleRangeChange.bind(this);
  }

  handleRangeChange(event) {
    const rangeInputId = event.target.id;
    const value = parseInt(event.target.value, 10);
    if (rangeInputId === 'min' && value < this.state.maxValue) {
      this.setState({minValue: value}, () => {
        this.props.handleChange(this.state.minValue, this.state.maxValue);
      });
    } else if (rangeInputId === 'max' && value > this.state.minValue) {
      this.setState({maxValue: value}, () => {
        this.props.handleChange(this.state.minValue, this.state.maxValue);
      });
    }
  }

  render() {
    const {range, step} = this.props;
    return (
      <Fragment>
        <div className="rangeslider">
          <input
            id="min"
            className="min"
            name="range_1"
            type="range"
            min={range[0]}
            max={range[1]}
            step={step}
            value={this.state.minValue}
            onChange={this.handleRangeChange}
          />
          <input
            id="max"
            className="max"
            name="range_2"
            type="range"
            min={range[0]}
            max={range[1]}
            step={step}
            value={this.state.maxValue}
            onChange={this.handleRangeChange}
          />
        </div>
      </Fragment>
    );
  }
}

export default RangeSlider;
