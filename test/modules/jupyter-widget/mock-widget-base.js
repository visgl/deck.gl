/* eslint-disable */
class BlankClass {
  constructor(attributes = {}) {
    Object.assign(attributes, this.defaults());
    this.model = new Map(Object.entries(attributes));
    this.model.widget_manager = {};
    this.el = {appendChild: x => x};
  }

  defaults() {
    return {};
  }
}

class DOMWidgetModel extends BlankClass {}
class DOMWidgetView extends BlankClass {}
class ManagerBase extends BlankClass {}

export {DOMWidgetModel, DOMWidgetView, ManagerBase};

export function createTestModel(constructor, attributes) {
  const obj = new constructor(attributes);
  return obj.model;
}
