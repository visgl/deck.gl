import View from './view';
import ThirdPersonViewport from '../viewports/third-person-viewport';

export default class ThirdPersonView extends View {
  constructor(props) {
    super(
      Object.assign({}, props, {
        type: ThirdPersonViewport
      })
    );
  }
}
