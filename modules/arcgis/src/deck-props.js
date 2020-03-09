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

/* eslint-disable callback-return */
export default function loadDeckProps(Accessor) {
  const DeckProps = Accessor.createSubclass({
    properties,

    constructor() {
      this._callbacks = {};

      this.watch(Object.keys(properties), (newValue, oldValue, propName) => {
        this.emit('change', {[propName]: newValue});
      });
    },

    on(eventName, cb) {
      this._callbacks[eventName] = this._callbacks[eventName] || [];
      this._callbacks[eventName].push(cb);
    },

    emit(eventName, details) {
      const callbacks = this._callbacks[eventName];
      if (callbacks) {
        for (const cb of callbacks) {
          cb(details);
        }
      }
    },

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
