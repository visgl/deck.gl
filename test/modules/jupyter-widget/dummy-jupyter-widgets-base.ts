// Dummy exports for node tests
import * as Backbone from 'backbone';

export class ManagerBase {}
export class DOMWidgetModel extends Backbone.Model {
  defaults() {
    return {};
  }
}
export class DOMWidgetView {}
export function uuid() {
  return 'uuid';
}
