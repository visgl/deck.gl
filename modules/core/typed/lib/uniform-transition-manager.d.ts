export default class UniformTransitionManager {
  transitions: Map<any, any>;
  timeline: any;
  constructor(timeline: any);
  get active(): boolean;
  add(key: any, fromValue: any, toValue: any, settings: any): void;
  remove(key: any): void;
  update(): {};
  clear(): void;
}
// # sourceMappingURL=uniform-transition-manager.d.ts.map
