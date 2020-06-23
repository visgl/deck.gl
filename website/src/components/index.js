import React from 'react';

export {default as LayerDemo} from './layer-demo';

{/* <LayerDemo Layer={ArcLayer}
  dataUrl="bart-segments.json"
  getTooltip={({object}) => `${object.from.name} to ${object.to.name}`}
  layer={
    new ArcLayer({
      pickable: true,
      getWidth: 12,
      getSourcePosition: d => d.from.coordinates,
      getTargetPosition: d => d.to.coordinates,
      getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
      getTargetColor: d => [Math.sqrt(d.outbound), 140, 0]
    })
  } />
</LayerDemo> */}