export function applyStyles(element: HTMLElement, style?: Partial<CSSStyleDeclaration>): void {
  if (style) {
    Object.entries(style).map(([key, value]) => {
      if (key.startsWith('--')) {
        // Assume CSS variable
        element.style.setProperty(key, value as string);
      } else {
        // Assume camelCase
        element.style[key] = value;
      }
    });
  }
}
