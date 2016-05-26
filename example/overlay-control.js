/* eslint-disable no-unused-vars */
/* eslint-disable no-inline-comments */
import React from 'react';

function OverlayControl({hoverItem, clickItem}) {
  const hoverCoords = hoverItem && hoverItem.geoCoords;
  const clickCoords = clickItem && clickItem.geoCoords;

  return (
    <div id="overlay-control" style={ {
      position: 'absolute',
      bottom: 20,
      left: 20,
      zIndex: 99
    } }>

      <div style={ {
        background: 'white',
        padding: '1em',
        marginBottom: '1em',
        width: 300
      } }>
        <div>
          Hover
          { hoverItem && ` ${hoverItem.type}=${hoverItem.index}` }
          { hoverCoords &&
            ` (${hoverCoords.lat.toFixed(4)} ${hoverCoords.lon.toFixed(4)})` }
        </div>
        <div>
          Click
          { clickItem && ` ${clickItem.type}=${clickItem.index}` }
          { clickCoords &&
            ` (${clickCoords.lat.toFixed(4)} ${clickCoords.lon.toFixed(4)})` }
        </div>
      </div>
    </div>
  );
}

export default OverlayControl;
