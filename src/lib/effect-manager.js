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
    this._effects.sort((a, b) => {
      if (a.priority > b.priority) return -1;
      else if (a.priority < b.priority) return 1;
      else return a.count - b.count;
    });
  }
  
  addEffect(effect) {
		//this should really be made stable in the future...
    this._effects.push(effect);
    this._sortEffects();
  }
  
  removeEffect(effect) {
    this._effects.remove(effect);
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
