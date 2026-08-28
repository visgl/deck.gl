// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
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
export function normalizeTransitionSettings(userSettings, layerSettings) {
    if (!userSettings) {
        return null;
    }
    if (Number.isFinite(userSettings)) {
        userSettings = { type: 'interpolation', duration: userSettings };
    }
    const type = userSettings.type || 'interpolation';
    return {
        ...DEFAULT_TRANSITION_SETTINGS[type],
        ...layerSettings,
        ...userSettings,
        type
    };
}
//# sourceMappingURL=transition-settings.js.map