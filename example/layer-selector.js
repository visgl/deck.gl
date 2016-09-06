/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

export default function LayerSelector({
  examples, activeLayers, onChange, hoveredItem, clickedItem, onVersionChange
}) {
  return (
    <div id="example-selector">
      <div style={ {
        background: 'white',
        padding: '1em 1em 0 1em',
        width: 200,
        height: 500,
        overflowX: 'hidden',
        overflowY: 'scroll'
      } }>
      { examples.map(exampleId => (
        <div key={ exampleId }>
          <input
            type="radio"
            id={ exampleId }
            name="layerStatus"
            className="radio-input"
            value={ exampleId }
            defaultChecked={ exampleId === activeExample }
            onChange={ e => onChange(exampleId) }
          />
          <label className="radio" htmlFor={ exampleId }>
            { exampleId }
          </label>
        </div>
      )) }
      </div>
    </div>
  );
}
