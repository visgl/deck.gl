/* eslint-disable no-try-catch */
import {Effect} from './effect';
import {Viewport} from '../viewport';
import {log} from './utils';
import assert from 'assert';

export default class EffectManager {
  constructor({gl, deckgl}) {
    this.gl = gl;
    this.deckgl = deckgl;
    this._effects = []
  }
  
  _sortEffects() {
    //this should really be made stable in the future...
    this._effects.sort((a, b) => {
      if (a.priority > b.priority) return -1;
      else if (a.priority < b.priority) return 1;
      else return a.count - b.count;
    });
  }
  
  addEffect(effect) {
		this._effects.push(effect);
    this._sortEffects();
    effect.initialize({gl: this.gl, deckgl: this.deckgl});
  }
  
  removeEffect(effect) {
    if (this._effects.indexOf(effect) >= 0) {
      effect.finalize({gl: this.gl, deckgl: this.deckgl});
      this._effects.remove(effect);
    }
  }
  
  preDraw() {
    for (let effect of this._effects){
      if (effect.needsRedraw) {
        effect.preDraw({gl: this.gl, deckgl: this.deckgl});
      }
    }
  }
  
  draw() {
    for (let effect of this._effects){
      if (effect.needsRedraw) {
        effect.draw({gl: this.gl, deckgl: this.deckgl});
      }
    }
  }
  
}
