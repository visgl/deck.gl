import View from './view';
import FirstPersonViewport from '../viewports/first-person-viewport';

export default class FirstPersonView extends View {
  constructor(props) {
    super(
      Object.assign({}, props, {
        type: FirstPersonViewport
      })
    );
  }
}
