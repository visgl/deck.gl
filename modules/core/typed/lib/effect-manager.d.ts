import type {Effect} from './effect';
export default class EffectManager {
  effects: Effect[];
  _internalEffects: Effect[];
  _needsRedraw: false | string;
  constructor();
  setProps(props: any): void;
  needsRedraw(opts?: {clearRedrawFlags: boolean}): false | string;
  getEffects(): Effect[];
  finalize(): void;
  setEffects(effects?: Effect[]): void;
  cleanup(): void;
}
// # sourceMappingURL=effect-manager.d.ts.map
