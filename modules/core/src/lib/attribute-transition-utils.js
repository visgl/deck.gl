const noop = () => {};
const DEFAULT_TRANSITION_SETTINGS = {
  type: 'interpolation',
  duration: 0,
  easing: t => t,
  onStart: noop,
  onEnd: noop,
  onInterrupt: noop,
  enter: x => x
};

export function normalizeTransitionSettings(userSettings, layerSettings = {}) {
  if (!userSettings) {
    return null;
  }
  if (Number.isFinite(userSettings)) {
    userSettings = {
      type: 'interpolation',
      duration: userSettings
    };
  }
  return Object.assign({}, DEFAULT_TRANSITION_SETTINGS, layerSettings, userSettings);
}
