import React from 'react';

export default function LayerInfo({
  hoveredItem,
  clickedItem
}) {
  return (
    <div id="layer-info">
      { hoveredItem && hoveredItem.index >= 0 && (<div>
        <h4>Hover</h4>
        <span>Layer: { hoveredItem.layer.id } Index: { hoveredItem.index }</span>
      </div>) }
      { clickedItem && clickedItem.index >= 0 && (<div>
        <h4>Click</h4>
        <span>Layer: { clickedItem.layer.id } Index: { clickedItem.index }</span>
      </div>) }
    </div>
  );
}
