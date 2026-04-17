// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {ThemeWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ThemeWidget - uncontrolled: initialThemeMode sets starting state', () => {
  const widget = new ThemeWidget({initialThemeMode: 'light'});
  expect(widget.getThemeMode()).toBe('light');
});

test('ThemeWidget - uncontrolled: initialThemeMode dark', () => {
  const widget = new ThemeWidget({initialThemeMode: 'dark'});
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - controlled: getThemeMode returns themeMode prop', () => {
  const widget = new ThemeWidget({themeMode: 'light'});
  expect(widget.getThemeMode()).toBe('light');

  widget.setProps({themeMode: 'dark'});
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - controlled: _handleClick calls onThemeModeChange but does not update internal state', () => {
  const onThemeModeChange = vi.fn();
  const widget = new ThemeWidget({themeMode: 'dark', onThemeModeChange});
  const internalBefore = widget.themeMode;

  (widget as any)._handleClick();

  expect(onThemeModeChange).toHaveBeenCalledWith('light');
  expect(widget.themeMode).toBe(internalBefore);
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - uncontrolled: _handleClick updates internal state and calls callback', () => {
  const onThemeModeChange = vi.fn();
  const widget = new ThemeWidget({initialThemeMode: 'dark', onThemeModeChange});

  expect(widget.getThemeMode()).toBe('dark');
  (widget as any)._handleClick();

  expect(onThemeModeChange).toHaveBeenCalledWith('light');
  expect(widget.themeMode).toBe('light');
});

test('ThemeWidget - button label and icon reflect current mode', async () => {
  testInstance = new WidgetTester({
    widgets: [
      new ThemeWidget({
        themeMode: 'dark',
        darkModeLabel: 'Dark Mode',
        lightModeLabel: 'Light Mode'
      })
    ]
  });

  await testInstance.idle();
  let button = testInstance.findElements(
    '.deck-widget-theme .deck-widget-icon-button'
  )[0] as HTMLButtonElement;
  expect(button.title).toBe('Dark Mode');
  expect(button.className).toContain('deck-widget-moon');

  testInstance.setProps({
    widgets: [
      new ThemeWidget({
        themeMode: 'light',
        darkModeLabel: 'Dark Mode',
        lightModeLabel: 'Light Mode'
      })
    ]
  });
  await testInstance.idle();

  button = testInstance.findElements(
    '.deck-widget-theme .deck-widget-icon-button'
  )[0] as HTMLButtonElement;
  expect(button.title).toBe('Light Mode');
  expect(button.className).toContain('deck-widget-sun');
});

test('ThemeWidget - applies theme to widget container', async () => {
  const lightModeTheme = {
    '--button-background': 'rgb(250, 250, 250)',
    '--menu-background': 'rgb(240, 240, 240)'
  };
  const darkModeTheme = {
    '--button-background': 'rgb(10, 10, 10)',
    '--menu-background': 'rgb(20, 20, 20)'
  };

  testInstance = new WidgetTester({
    widgets: [
      new ThemeWidget({
        initialThemeMode: 'dark',
        lightModeTheme,
        darkModeTheme
      })
    ]
  });

  await testInstance.idle();
  const container = testInstance.findElements('')[0] as HTMLDivElement;
  expect(container).toBeTruthy();
  expect(container.style.getPropertyValue('--button-background')).toBe('rgb(10, 10, 10)');
  expect(container.style.getPropertyValue('--menu-background')).toBe('rgb(20, 20, 20)');

  testInstance.click('.deck-widget-theme .deck-widget-icon-button');
  await testInstance.idle();

  expect(container.style.getPropertyValue('--button-background')).toBe('rgb(250, 250, 250)');
  expect(container.style.getPropertyValue('--menu-background')).toBe('rgb(240, 240, 240)');
});
