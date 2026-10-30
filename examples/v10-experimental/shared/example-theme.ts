// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

export type ExampleThemeAppearance = 'cinematic' | 'light';

export type ExampleThemeTokens = {
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  radius: string;
  shadow: string;
  backdrop: string;
};

const EXAMPLE_THEME_CUSTOM_PROPERTIES: ReadonlyArray<readonly [keyof ExampleThemeTokens, string]> =
  [
    ['surface', '--luma-example-surface'],
    ['surfaceRaised', '--luma-example-surface-raised'],
    ['border', '--luma-example-border'],
    ['text', '--luma-example-text'],
    ['textMuted', '--luma-example-text-muted'],
    ['accent', '--luma-example-accent'],
    ['radius', '--luma-example-radius'],
    ['shadow', '--luma-example-shadow'],
    ['backdrop', '--luma-example-backdrop']
  ];

/** Framework-independent visual tokens shared by example cards, panels, and overlays. */
export const EXAMPLE_THEME_TOKENS = {
  cinematic: {
    surface: 'rgb(8, 15, 27)',
    surfaceRaised: 'rgba(15, 23, 42, 0.72)',
    border: 'rgba(148, 163, 184, 0.24)',
    text: 'rgb(226, 232, 240)',
    textMuted: 'rgb(148, 163, 184)',
    accent: 'rgb(56, 189, 248)',
    radius: '14px',
    shadow: '0 22px 58px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
    backdrop: 'blur(18px) saturate(135%)'
  },
  light: {
    surface: 'rgb(255, 255, 255)',
    surfaceRaised: 'rgb(248, 250, 252)',
    border: 'rgba(15, 23, 42, 0.1)',
    text: 'rgb(17, 17, 17)',
    textMuted: 'rgb(89, 101, 121)',
    accent: 'rgb(20, 110, 245)',
    radius: '14px',
    shadow: '0 12px 32px rgba(0, 0, 0, 0.28)',
    backdrop: 'none'
  }
} as const satisfies Record<ExampleThemeAppearance, ExampleThemeTokens>;

/** Applies inheritable semantic custom properties without depending on a UI framework. */
export function applyExampleTheme(
  hostElement: HTMLElement,
  appearance: ExampleThemeAppearance
): void {
  const theme = EXAMPLE_THEME_TOKENS[appearance];

  for (const [token, customProperty] of EXAMPLE_THEME_CUSTOM_PROPERTIES) {
    hostElement.style.setProperty(customProperty, theme[token]);
  }
}

/** Removes explicitly applied theme tokens so semantic values inherit from ancestors again. */
export function clearExampleTheme(hostElement: HTMLElement): void {
  for (const [, customProperty] of EXAMPLE_THEME_CUSTOM_PROPERTIES) {
    hostElement.style.removeProperty(customProperty);
  }
}
