import React, {memo} from 'react';

// The memo() here is ultimately not necessary even though this component is
// rendering anytime the viewState changes (e.g. expected React behavior).
// Since we have a static dataset Deck will take over and properly diff the
// layer to determine if it needs to rerender or not.
function _BasemapLayer() {
  return (
    <geoJsonLayer
      id="basemap"
      data="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson"
      stroked={true}
      filled={true}
      getFillColor={[30, 80, 120]}
      getLineColor={[0, 255, 255]}
      lineWidthMinPixels={1}
    />
  );
}

export const BasemapLayer = memo(_BasemapLayer);
