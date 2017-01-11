import React, {PureComponent} from 'react';

export default class LayerInfo extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      hovered: null,
      clicked: null
    };

    this.onItemHovered = this._onMouseEvent.bind(this, 'hovered');
    this.onItemClicked = this._onMouseEvent.bind(this, 'clicked');
  }

  _onMouseEvent(name, item) {
    if (item.index < 0) {
      item = null;
    }

    const oldItem = this.state[name];
    if (oldItem === item ||
      (oldItem && item && oldItem.layer.id === item.layer.id && oldItem.index === item.index)) {
      // no change
      return;
    }
    this.setState({[name]: item});
  }

  render() {
    const {hovered, clicked} = this.state;

    return (
      <div id="layer-info">
        { hovered && (<div>
          <h4>Hover</h4>
          <span>Layer: { hovered.layer.id } Index: { hovered.index }</span>
        </div>) }
        { clicked && (<div>
          <h4>Click</h4>
          <span>Layer: { clicked.layer.id } Index: { clicked.index }</span>
        </div>) }
      </div>
    );
  }
}
