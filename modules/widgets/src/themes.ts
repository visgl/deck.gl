// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * A Deck Theme is a set of CSS variables that control CSS styling of the official widgets.
 */
export type DeckWidgetTheme = {
  // layout
  '--widget-margin'?: string;
  // button and button group
  '--button-size'?: string;
  '--button-corner-radius'?: string;
  '--button-background'?: string;
  '--button-stroke'?: string;
  '--button-inner-stroke'?: string;
  '--button-shadow'?: string;
  '--button-backdrop-filter'?: string;
  '--button-icon-idle'?: string;
  '--button-icon-hover'?: string;
  '--button-text'?: string;
  // inter-icon color
  '--icon-compass-north-color'?: string;
  '--icon-compass-south-color'?: string;
  // menu
  '--menu-gap'?: string;
};

export const LightTheme = {
  '--widget-margin': '12px',
  '--button-size': '28px',
  '--button-corner-radius': '8px',
  '--button-background': '#fff',
  '--button-stroke': 'rgba(255, 255, 255, 0.3)',
  '--button-inner-stroke': 'unset',
  '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25)',
  '--button-backdrop-filter': 'unset',
  '--button-icon-idle': 'rgba(97, 97, 102, 1)',
  '--button-icon-hover': 'rgba(24, 24, 26, 1)',
  '--button-text': 'rgb(24, 24, 26, 1)',
  '--icon-compass-north-color': 'rgb(240, 92, 68)',
  '--icon-compass-south-color': 'rgb(204, 204, 204)',
  '--menu-gap': '4px'
} as const satisfies Required<DeckWidgetTheme>;

export const DarkTheme = {
  '--widget-margin': '12px',
  '--button-size': '28px',
  '--button-corner-radius': '8px',
  '--button-background': 'rgba(18, 18, 20, 1)',
  '--button-stroke': 'rgba(18, 18, 20, 0.30)',
  '--button-inner-stroke': 'unset',
  '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25)',
  '--button-backdrop-filter': 'unset',
  '--button-icon-idle': 'rgba(158, 157, 168, 1)',
  '--button-icon-hover': 'rgba(215, 214, 229, 1)',
  '--button-text': 'rgb(215, 214, 229, 1)',
  '--icon-compass-north-color': 'rgb(240, 92, 68)',
  '--icon-compass-south-color': 'rgb(200, 199, 209)',
  '--menu-gap': '4px'
} as const satisfies Required<DeckWidgetTheme>;

export const LightGlassTheme = {
  '--widget-margin': '12px',
  '--button-size': '28px',
  '--button-corner-radius': '8px',
  '--button-background': 'rgba(255, 255, 255, 0.6)',
  '--button-stroke': 'rgba(255, 255, 255, 0.3)',
  '--button-inner-stroke': '1px solid rgba(255, 255, 255, 0.6)',
  '--button-shadow':
    '0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset',
  '--button-backdrop-filter': 'blur(4px)',
  '--button-icon-idle': 'rgba(97, 97, 102, 1)',
  '--button-icon-hover': 'rgba(24, 24, 26, 1)',
  '--button-text': 'rgb(24, 24, 26, 1)',
  '--icon-compass-north-color': 'rgb(240, 92, 68)',
  '--icon-compass-south-color': 'rgb(204, 204, 204)',
  '--menu-gap': '4px'
} as const satisfies Required<DeckWidgetTheme>;

export const DarkGlassTheme = {
  '--widget-margin': '12px',
  '--button-size': '28px',
  '--button-corner-radius': '8px',
  '--button-background': 'rgba(18, 18, 20, 0.75)',
  '--button-stroke': 'rgba(18, 18, 20, 0.30)',
  '--button-inner-stroke': '1px solid rgba(18, 18, 20, 0.75)',
  '--button-shadow':
    '0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset',
  '--button-backdrop-filter': 'blur(4px)',
  '--button-icon-idle': 'rgba(158, 157, 168, 1)',
  '--button-icon-hover': 'rgba(215, 214, 229, 1)',
  '--button-text': 'rgb(215, 214, 229, 1)',
  '--icon-compass-north-color': 'rgb(240, 92, 68)',
  '--icon-compass-south-color': 'rgb(200, 199, 209)',
  '--menu-gap': '4px'
} as const satisfies Required<DeckWidgetTheme>;
