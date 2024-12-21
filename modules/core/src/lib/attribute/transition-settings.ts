// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {NumericArray} from '../../types/types';

export interface TransitionSettings {
  type: string;
  /** Callback to get the value that the entering vertices are transitioning from. */
  enter?: (toValue: NumericArray, chunk?: NumericArray) => NumericArray;
  /** Callback when the transition is started */
  onStart?: () => void;
  /** Callback when the transition is done */
  onEnd?: () => void;
  /** Callback when the transition is interrupted */
  onInterrupt?: () => void;
}

export type InterpolationTransitionSettings = TransitionSettings & {
  type?: 'interpolation';
  /** Duration of the transition animation, in milliseconds */
  duration: number;
  /** Easing function that maps a value from [0, 1] to [0, 1], see [http://easings.net/](http://easings.net/) */
  easing?: (t: number) => number;
};

export type SpringTransitionSettings = TransitionSettings & {
  type: 'spring';
  /** "Tension" factor for the spring */
  stiffness: number;
  /** "Friction" factor that counteracts the spring's acceleration */
  damping: number;
};

const DEFAULT_TRANSITION_SETTINGS = {
  interpolation: {
    duration: 0,
    easing: t => t
  },
  spring: {
    stiffness: 0.05,
    damping: 0.5
  }
};

export function normalizeTransitionSettings(
  userSettings: number | InterpolationTransitionSettings | SpringTransitionSettings,
  layerSettings?: boolean | Partial<TransitionSettings>
): TransitionSettings | null {
  if (!userSettings) {
    return null;
  }
  if (Number.isFinite(userSettings)) {
    userSettings = {type: 'interpolation', duration: userSettings as number};
  }
  const type = (userSettings as TransitionSettings).type || 'interpolation';
  return {
    ...DEFAULT_TRANSITION_SETTINGS[type],
    ...(layerSettings as TransitionSettings),
    ...(userSettings as TransitionSettings),
    type
  };
}
