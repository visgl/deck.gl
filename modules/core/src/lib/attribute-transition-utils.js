const noop = () => {};
const DEFAULT_TRANSITION_SETTINGS = {
  type: 'interpolation',
  duration: 0,
  easing: t => t,
  onStart: noop,
  onEnd: noop,
  onInterrupt: noop
};

export function normalizeTransitionSettings(settings) {
  if (!settings) {
    return null;
  }
  if (Number.isFinite(settings)) {
    settings = {duration: settings};
  }
  if (!settings.duration) {
    return null;
  }
  return Object.assign({}, DEFAULT_TRANSITION_SETTINGS, settings);
}
