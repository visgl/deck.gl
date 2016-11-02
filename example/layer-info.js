/* eslint-disable no-unused-vars */
/* eslint-disable no-inline-comments */
import React from 'react';

export default function LayerInfo({
  hoverChoropleth,
  hoverPoint,
  hoverArc,
  hoverLine,
  clickItem
}) {
  const clickCoords = clickItem && clickItem.geoCoords;

  const choroplethId = hoverChoropleth && hoverChoropleth.feature &&
    hoverChoropleth.feature.properties && hoverChoropleth.feature.properties.ID;

  return (
    <div id="overlay-control" style={ {
      position: 'absolute',
      bottom: 20,
      left: 20,
      zIndex: 99,
      pointerEvents: 'none'
    } }>

      <div style={ {
        padding: '1em',
        marginBottom: '1em',
        width: 300
      } }>
        <div>
          Point
          { hoverPoint && ` ${hoverPoint.type}=${hoverPoint.index}` }
        </div>
        <div>
          Arc
          { hoverArc && ` ${hoverArc.type}=${hoverArc.index}` }
        </div>
        <div>
          Line
          { hoverLine && ` ${hoverLine.type}=${hoverLine.index}` }
        </div>
        <div>
          Choropleth
          { hoverChoropleth && ` ${hoverChoropleth.type}=${choroplethId}` }
        </div>
        <div>
          - Click
          { clickItem && ` ${clickItem.type}=${clickItem.index}` }
          { clickCoords &&
            ` (${clickCoords.lat.toFixed(4)} ${clickCoords.lon.toFixed(4)})` }
        </div>
      </div>
    </div>
  );
}
