import React, {PureComponent} from 'react';

export default class LayerInfo extends PureComponent {
  _infoToString(info) {
    const object = info.feature || info.object;
    if (!object) {
      return 'None';
    }
    const props = object.properties || object;
    return JSON.stringify(props);
  }

  render() {
    const {hovered, clicked, queried} = this.props;

    return (
      <div id="layer-info">
        {hovered &&
          hovered.object && (
            <div>
              <h4>Hover</h4>
              <span>
                Layer: {hovered.layer.id} Object: {this._infoToString(hovered)}
              </span>
            </div>
          )}
        {clicked &&
          clicked.object && (
            <div>
              <h4>Click</h4>
              <span>
                Layer: {clicked.layer.id} Object: {this._infoToString(clicked)}
              </span>
            </div>
          )}
        {queried && (
          <div>
            <h4>Pick Result</h4>
            <span>{queried.length} objects found (see console)</span>
          </div>
        )}
      </div>
    );
  }
}
