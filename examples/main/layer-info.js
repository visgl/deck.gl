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

  _onMouseEvent(name, info) {
    if (info.index < 0) {
      info = null;
    }

    const oldItem = this.state[name];
    if (oldItem === info ||
      (oldItem && info && oldItem.layer.id === info.layer.id && oldItem.index === info.index)) {
      // no change
      return;
    }
    this.setState({[name]: info});
  }

  _infoToString(info) {
    const object = info.feature || info.object;
    const props = object.properties || object;
    return JSON.stringify(props);
  }

  render() {
    const {hovered, clicked} = this.state;

    return (
      <div id="layer-info">
        { hovered && (<div>
          <h4>Hover</h4>
          <span>Layer: { hovered.layer.id } Object: { this._infoToString(hovered) }</span>
        </div>) }
        { clicked && (<div>
          <h4>Click</h4>
          <span>Layer: { clicked.layer.id } Object: { this._infoToString(clicked) }</span>
        </div>) }
      </div>
    );
  }
}
