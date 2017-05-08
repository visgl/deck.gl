import {PointerEventInput} from 'hammerjs';

const POINTER_MOVE = 'pointermove';

// Copied from Hammer.js' pointerevent.js
const IE10_POINTER_TYPE_ENUM = {
  2: 'touch',
  3: 'pen',
  4: 'mouse',
  5: 'kinect' // see https://twitter.com/jacobrossi/status/480596438489890816
};

export default class PointerMoveEventInput extends PointerEventInput {

  constructor(...opts) {
    super(...opts);
  }

  handler(event) {
    // let 'pointermove' events through when the pointer is not down.
    // all other cases (including 'pointermove' while pointer is down)
    // are handled by PointerEventInput.
    const {store} = this;
    if (event.type === POINTER_MOVE) {
      const storeIndex = store.findIndex(i =>
        i.pointerId == event.pointerId);  // eslint-disable-line eqeqeq
      if (storeIndex < 0) {
        this.callback(this.manager, POINTER_MOVE, {
          pointers: store,
          changedPointers: [event],
          pointerType: IE10_POINTER_TYPE_ENUM[event.pointerType] || event.pointerType,
          srcEvent: event
        });
        return;
      }
    }

    super.handler(event);
  }
}
