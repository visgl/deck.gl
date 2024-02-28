import React, {memo} from 'react';
import {randomPoint} from '@turf/random';
import sample from '@turf/sample';

const points = randomPoint(10000, {bbox: [-180, -90, 180, 90]});

function getPosition(feature) {
  return feature.geometry.coordinates;
}

// This component is rendering anytime the viewState changes (e.g. expected React behavior).
// Since we have a dataset we are deriving in the component this means that a new data value
// is being created every render and thus Deck will render the new dataset accordingly.
export function RandomPointLayer() {
  const data = sample(points, 1000);

  return (
    <scatterplotLayer
      id="random-point-1"
      data={data.features}
      getPosition={getPosition}
      radiusMinPixels={4}
      filled={true}
      stroked={false}
      getFillColor={[255, 0, 0]}
    />
  );
}

// Since this component is memo'd, you will not see it render new data when the viewState changes.
// This follows the principle of any other React component and allows you to always "think in React".
function _RandomPointLayerMemo() {
  const data = sample(points, 1000);

  return (
    <scatterplotLayer
      id="random-point-2"
      data={data.features}
      getPosition={getPosition}
      radiusMinPixels={4}
      filled={true}
      stroked={false}
      getFillColor={[0, 255, 0]}
    />
  );
}

export const RandomPointLayerMemo = memo(_RandomPointLayerMemo);
