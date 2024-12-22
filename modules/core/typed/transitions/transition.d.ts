import type {Timeline} from '@luma.gl/engine';
export declare type TransitionSettings = {
  duration: number;
  onStart?: (transition: Transition) => void;
  onUpdate?: (transition: Transition) => void;
  onInterrupt?: (transition: Transition) => void;
  onEnd?: (transition: Transition) => void;
};
export default class Transition {
  private _inProgress;
  private _handle;
  private _timeline;
  time: number;
  settings: TransitionSettings & {
    fromValue: any;
    toValue: any;
    duration: any;
    easing: any;
    damping: any;
    stiffness: any;
  };
  /**
   * @params timeline {Timeline}
   */
  constructor(timeline: Timeline);
  get inProgress(): boolean;
  /**
   * (re)start this transition.
   * @params props {object} - optional overriding props. see constructor
   */
  start(settings: TransitionSettings): void;
  /**
   * end this transition if it is in progress.
   */
  end(): void;
  /**
   * cancel this transition if it is in progress.
   */
  cancel(): void;
  /**
   * update this transition. Returns `true` if updated.
   */
  update(): boolean;
  protected _onUpdate(): void;
}
// # sourceMappingURL=transition.d.ts.map
