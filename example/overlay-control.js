/* eslint-disable no-unused-vars */
/* eslint-disable no-inline-comments */
import React from 'react';

function OverlayControl({
  layers, activeLayer, onChange, hoveredItem, clickedItem
}) {

  const hoverCoords = hoveredItem && hoveredItem.geoCoords;

  return (
    <div id="overlay-control">
      <div style={ {
        background: 'white',
        padding: '1em',
        marginBottom: '1em',
        width: 200
      } }>
        <div>
          Hover { hoveredItem && hoveredItem.hexagonId || 'null' }
          { hoveredItem && hoveredItem.index !== -1 && ' *' }
          { hoverCoords &&
            ` ${hoverCoords.lat.toFixed(5)} ${hoverCoords.lon.toFixed(5)}` }
        </div>
        <div>
          Click { clickedItem && clickedItem.hexagonId || 'null' }
          { clickedItem && clickedItem.index !== -1 && ' *' }
        </div>
      </div>
      <div style={ {
        background: 'white',
        padding: '1em 1em 0 1em',
        width: 200
      } }>
      {  /* layers.map(layerId => (
        <div key={ layerId }>
          <input
            type="radio"
            id={ layerId }
            name="layerStatus"
            className="radio-input"
            value={ layerId }
            defaultChecked={ layerId === activeLayer }
            onChange={ e => onChange(layerId) }
          />
          <label className="radio" htmlFor={ layerId }>
            { layerId }
          </label>
        </div>
      )) */ }
      </div>
    </div>
  );
}

export default OverlayControl;
