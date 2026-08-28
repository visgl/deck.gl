export function applyStyles(element, style) {
    if (style) {
        Object.entries(style).map(([key, value]) => {
            if (key.startsWith('--')) {
                // Assume CSS variable
                element.style.setProperty(key, value);
            }
            else {
                // Assume camelCase
                element.style[key] = value;
            }
        });
    }
}
export function removeStyles(element, style) {
    if (style) {
        Object.keys(style).map(key => {
            if (key.startsWith('--')) {
                // Assume CSS variable
                element.style.removeProperty(key);
            }
            else {
                // Assume camelCase
                element.style[key] = '';
            }
        });
    }
}
//# sourceMappingURL=apply-styles.js.map