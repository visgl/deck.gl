const properties = {
  layers: {},
  layerFilter: {},
  parameters: {},
  effects: {},
  pickingRadius: {},
  onBeforeRender: {},
  onAfterRender: {},
  onClick: {},
  onHover: {},
  onDragStart: {},
  onDrag: {},
  onDragEnd: {},
  onError: {},
  debug: {},
  drawPickingColors: {}
};

export default function loadDeckProps(Accessor) {
  const DeckProps = Accessor.createSubclass({
    properties,

    toJSON() {
      const result = {};
      for (const key in this.properties) {
        if (this[key] !== undefined) {
          result[key] = this[key];
        }
      }
      return result;
    }
  });

  return DeckProps;
}
