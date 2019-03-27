"use strict";module.export({default:()=>LayerState});var ComponentState;module.link('../lifecycle/component-state',{default(v){ComponentState=v}},0);

class LayerState extends ComponentState {
  constructor({attributeManager, layer}) {
    super(layer);
    this.attributeManager = attributeManager;
    this.model = null;
    this.needsRedraw = true;
    this.subLayers = null; // reference to sublayers rendered in a previous cycle
  }

  get layer() {
    return this.component;
  }

  set layer(layer) {
    this.component = layer;
  }
}
