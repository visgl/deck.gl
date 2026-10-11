// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  CustomPanel,
  PanelThemeScope,
  SettingsManager,
  SettingsPanel,
  TabbedPanel,
  type Panel,
  type SettingsChangeDescriptor,
  type SettingsManagerLocalStorageConfig,
  type SettingsManagerOnChange,
  type SettingsSchema,
  type SettingDescriptor,
  type SettingValue,
  type SettingsState,
  type TabbedPanelProps
} from '@deck.gl-community/panels';
import {Fragment, h, render, type JSX} from 'preact';
import {useEffect, useState} from 'preact/hooks';
import {applyExampleTheme, clearExampleTheme, EXAMPLE_THEME_TOKENS} from './example-theme';

const EXAMPLE_PANEL_HOST_ID = 'example-panel-host';
const EXAMPLE_PANEL_HOST_ATTRIBUTE = 'data-example-panel-host';
const EXAMPLE_SETTINGS_PANEL_ATTRIBUTE = 'data-example-settings-panel';
const EXAMPLE_SETTINGS_SECTIONS_ATTRIBUTE = 'data-example-settings-sections';
const EXAMPLE_SOURCE_PANEL_ID = 'example-source';
const EXAMPLES_PATH_PREFIX = '/examples/';
const MODEL_SETTING_NAMES = new Set(['modelKind', 'renderMode']);
const EXAMPLE_PANEL_APPEARANCE_ATTRIBUTE = 'data-example-panel-appearance';
const EXAMPLE_PANEL_STYLE = `
[data-example-panel-host] [aria-hidden='true'] {
  display: none !important;
}
[data-example-panel-host][${EXAMPLE_PANEL_APPEARANCE_ATTRIBUTE}='cinematic'] [data-panel-theme-mode] {
  --button-background: var(--luma-example-surface-raised, rgba(15, 23, 42, 0.72)) !important;
  --button-icon-hover: rgb(240, 249, 255) !important;
  --button-icon-idle: var(--luma-example-text-muted, rgb(148, 163, 184)) !important;
  --button-stroke: var(--luma-example-border, rgba(148, 163, 184, 0.24)) !important;
  --button-text: var(--luma-example-text, rgb(226, 232, 240)) !important;
  --menu-background: transparent !important;
  --menu-border-color: rgba(148, 163, 184, 0.2) !important;
  --menu-divider: rgba(148, 163, 184, 0.18) !important;
  --menu-item-hover: rgba(125, 211, 252, 0.12) !important;
  --menu-text: var(--luma-example-text, rgb(226, 232, 240)) !important;
  --menu-weak-background: rgba(15, 23, 42, 0.48) !important;
  --range-decoration-active-color: var(--luma-example-accent, rgb(56, 189, 248)) !important;
  --range-thumb-color: rgb(125, 211, 252) !important;
  --range-track-color: rgba(71, 85, 105, 0.8) !important;
  color: var(--luma-example-text, rgb(226, 232, 240));
  color-scheme: dark;
}
[${EXAMPLE_SETTINGS_PANEL_ATTRIBUTE}] [data-setting-row-for] > label,
[${EXAMPLE_SETTINGS_PANEL_ATTRIBUTE}] [data-setting-row-for] button,
[${EXAMPLE_SETTINGS_PANEL_ATTRIBUTE}] [data-setting-row-for] input[type='number'],
[${EXAMPLE_SETTINGS_PANEL_ATTRIBUTE}] [data-setting-row-for] input[type='text'],
[id^='settings-panel-input-'][role='listbox'] > button[role='option'] {
  font-size: 11px !important;
}
[${EXAMPLE_SETTINGS_PANEL_ATTRIBUTE}][${EXAMPLE_SETTINGS_SECTIONS_ATTRIBUTE}='accordion']
button[aria-expanded]:not([aria-haspopup='listbox']) {
  margin-top: 4px !important;
  padding: 8px !important;
  border-radius: 7px !important;
  background: rgba(70, 104, 159, 0.08) !important;
}
[${EXAMPLE_SETTINGS_PANEL_ATTRIBUTE}][${EXAMPLE_SETTINGS_SECTIONS_ATTRIBUTE}='accordion']
button[aria-expanded]:not([aria-haspopup='listbox']) > span:first-child > span:first-child {
  font-size: 11px !important;
  letter-spacing: 0.01em;
}
`;

export type ExamplePanelAppearance = 'inherit' | 'light' | 'cinematic';

export type ExampleCustomPanelRenderer = (rootElement: HTMLElement) => void | (() => void);

export type ExampleSettingsPanelProps = {
  id: string;
  label?: string;
  schema: SettingsSchema;
  settings: SettingsState;
  /** Keep sections visible as named accordion groups instead of flattening their controls. */
  sectionPresentation?: 'inline' | 'accordion';
  onSettingsChange?: SettingsManagerOnChange;
  localStorageConfig?: SettingsManagerLocalStorageConfig;
};

type ExampleSourceResult = {
  source?: string;
  error?: string;
};

/** Returns the InfoBox host used by panel-backed example content. */
export function makeExamplePanelHostHtml(hostId = EXAMPLE_PANEL_HOST_ID): string {
  return `<div id="${hostId}" ${EXAMPLE_PANEL_HOST_ATTRIBUTE}=""></div>`;
}

/** Renders panel content directly inside an existing InfoBox host. */
export function renderExamplePanel(hostElement: HTMLElement, panel: Panel | null): void {
  render(
    panel ? h(PanelThemeScope, {panel}, h('style', {}, EXAMPLE_PANEL_STYLE), panel.content) : null,
    hostElement
  );
}

export function makeHtmlCustomPanel({
  id,
  title,
  html,
  onRender
}: {
  id: string;
  title: string;
  html: string;
  onRender?: ExampleCustomPanelRenderer;
}): Panel {
  return new CustomPanel({
    id,
    title,
    onRenderHTML: rootElement => {
      rootElement.innerHTML = html;
      const cleanup = onRender?.(rootElement);
      return () => {
        if (cleanup) {
          cleanup();
        }
        rootElement.replaceChildren();
      };
    }
  });
}

/** Creates one simple panel from already-built Preact content. */
export function makeExampleContentPanel({
  id,
  title,
  content
}: {
  id: string;
  title: string;
  content: Panel['content'];
}): Panel {
  return new CustomPanel({
    id,
    title,
    onRenderHTML: rootElement => {
      render(h(Fragment, {}, content), rootElement);
      return () => render(null, rootElement);
    }
  });
}

/** Creates a community tabbed panel with the website source viewer appended when available. */
export function makeExampleTabbedPanel(props: TabbedPanelProps): Panel {
  const hasSourcePanel = props.panels.some(panel => panel.id === EXAMPLE_SOURCE_PANEL_ID);
  const panels =
    isWebsiteExample() && !hasSourcePanel
      ? [...props.panels, makeExampleSourcePanel()]
      : props.panels;
  return new TabbedPanel({...props, panels});
}

function makeExampleSourcePanel(): Panel {
  return makeExampleContentPanel({
    id: EXAMPLE_SOURCE_PANEL_ID,
    title: 'Source',
    content: h(ExampleSourcePanelContent, {})
  });
}

function ExampleSourcePanelContent() {
  const [sourceResult, setSourceResult] = useState<ExampleSourceResult>({});

  useEffect(() => {
    const sourcePaths = getCurrentExampleSourcePaths();
    if (sourcePaths.length === 0) {
      setSourceResult({error: 'Unable to determine source code path.'});
      return;
    }

    const abortController = new AbortController();
    void fetchCurrentExampleSource(sourcePaths, abortController.signal)
      .then(source => setSourceResult({source}))
      .catch(error => {
        if (!abortController.signal.aborted) {
          setSourceResult({
            error: error instanceof Error ? error.message : 'Unable to load source code.'
          });
        }
      });

    return () => abortController.abort();
  }, []);

  if (sourceResult.error) {
    return h(
      'p',
      {
        role: 'alert',
        style: {
          margin: 0,
          padding: '10px 12px',
          borderLeft: '3px solid #f87171',
          borderRadius: '0 6px 6px 0',
          background: 'var(--luma-example-surface-raised, rgba(15, 23, 42, 0.72))',
          color: 'var(--luma-example-text, rgb(226, 232, 240))',
          font: '12px/1.5 ui-sans-serif, system-ui, sans-serif'
        }
      },
      sourceResult.error
    );
  }

  return h(
    'pre',
    {
      'data-example-source-viewer': '',
      style: {
        margin: 0,
        padding: '13px 14px',
        maxWidth: '100%',
        overflow: 'auto',
        border: '1px solid var(--luma-example-border, rgba(148, 163, 184, 0.24))',
        borderRadius: '8px',
        background: 'var(--luma-example-surface, rgb(8, 15, 27))',
        color: 'var(--luma-example-text, rgb(226, 232, 240))',
        font: '12px/1.45 ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }
    },
    h('code', {}, sourceResult.source ?? '// Loading source…')
  );
}

function isWebsiteExample(): boolean {
  return typeof window !== 'undefined' && Boolean((window as Window & {website?: boolean}).website);
}

function getCurrentExampleSourcePaths(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const examplesPathIndex = window.location.pathname.indexOf(EXAMPLES_PATH_PREFIX);
  if (examplesPathIndex < 0) {
    return [];
  }

  const sourceDirectory = window.location.pathname
    .slice(examplesPathIndex + EXAMPLES_PATH_PREFIX.length)
    .replace(/\/+$/, '');
  if (!sourceDirectory) {
    return [];
  }

  return [`${sourceDirectory}/app.ts`, `${sourceDirectory}/app.tsx`];
}

async function fetchCurrentExampleSource(
  sourcePaths: readonly string[],
  signal: AbortSignal
): Promise<string> {
  const examplesPathIndex = window.location.pathname.indexOf(EXAMPLES_PATH_PREFIX);
  const websiteBasePath = window.location.pathname.slice(0, examplesPathIndex + 1);

  for (const sourcePath of sourcePaths) {
    const response = await fetch(`${websiteBasePath}example-assets/${sourcePath}`, {signal});
    if (response.ok) {
      return response.text();
    }
  }

  throw new Error('Unable to load source code.');
}

/** Owns one panel-backed InfoBox surface for an example. */
export class ExamplePanelManager {
  private readonly hostId: string;
  private panel: Panel;
  private hostElement: HTMLElement | null = null;

  constructor({
    panel,
    hostId = EXAMPLE_PANEL_HOST_ID
  }: {
    panel: Panel;
    hostId?: string;
  }) {
    this.panel = panel;
    this.hostId = hostId;
  }

  mount(): void {
    if (this.hostElement || typeof document === 'undefined') {
      return;
    }

    const hostElement = document.getElementById(this.hostId);
    if (!(hostElement instanceof HTMLElement)) {
      return;
    }

    this.hostElement = hostElement;
    configurePanelHostElement(hostElement);
    this.render();
  }

  setPanel(panel: Panel): void {
    this.panel = panel;
    this.render();
  }

  refresh(): void {
    this.render();
  }

  finalize(): void {
    if (this.hostElement) {
      renderExamplePanel(this.hostElement, null);
    }
    this.hostElement = null;
  }

  private render(): void {
    if (!this.hostElement) {
      return;
    }
    renderExamplePanel(this.hostElement, this.panel);
  }
}

/** Owns one schema-driven settings surface and its structured change manager. */
export class ExampleSettingsPanelManager {
  private readonly id: string;
  private readonly label: string;
  private readonly sectionPresentation: 'inline' | 'accordion';
  private readonly settingsManager = new SettingsManager();
  private readonly unsubscribe: () => void;
  private schema: SettingsSchema;
  private settings: SettingsState;

  constructor({
    id,
    label = 'Settings',
    schema,
    settings,
    sectionPresentation = 'inline',
    onSettingsChange,
    localStorageConfig
  }: ExampleSettingsPanelProps) {
    this.id = id;
    this.label = label;
    this.sectionPresentation = sectionPresentation;
    this.schema = schema;
    this.settings = settings;
    this.settingsManager.setLocalStoragePersistence(localStorageConfig);
    this.setSchemaAndSettings(schema, settings);
    this.unsubscribe = this.settingsManager.setOnSettingsChange((nextSettings, changedSettings) => {
      this.settings = nextSettings;
      onSettingsChange?.(nextSettings, changedSettings);
    });
  }

  getSettingsWithLocalStorage(settings: SettingsState): SettingsState {
    return this.settingsManager.getSettingsWithLocalStorage(settings);
  }

  setSchemaAndSettings(schema: SettingsSchema, settings: SettingsState): void {
    this.schema = schema;
    this.settings = settings;
    this.settingsManager.setSettingDefinitions(getSettingDefinitions(schema));
    this.settingsManager.setCurrentSettings(settings);
  }

  setSettings(settings: SettingsState): void {
    this.settings = settings;
    this.settingsManager.setCurrentSettings(settings);
  }

  setSettingsFromPanel(settings: SettingsState): void {
    this.settingsManager.setSettings(settings);
  }

  setSettingValue(settingName: string, settingValue: SettingValue): void {
    this.settingsManager.setSettingValue(settingName, settingValue);
  }

  makePanel(): Panel {
    if (this.sectionPresentation === 'accordion') {
      return makeExampleSettingsPanel(
        new SettingsPanel({
          id: this.id,
          label: this.label,
          schema: this.schema,
          settings: this.settings,
          onSettingsChange: nextSettings => this.setSettingsFromPanel(nextSettings)
        }),
        this.sectionPresentation
      );
    }

    const [settingsPanel] = SettingsPanel.createSectionPanels({
      label: this.label,
      schema: makeInlineSettingsSchema(this.schema),
      settings: this.settings,
      onSettingsChange: nextSettings => this.setSettingsFromPanel(nextSettings)
    });
    if (!settingsPanel) {
      return makeExampleSettingsPanel(
        new SettingsPanel({
          id: this.id,
          label: this.label,
          schema: makeInlineSettingsSchema(this.schema),
          settings: this.settings,
          onSettingsChange: nextSettings => this.setSettingsFromPanel(nextSettings)
        })
      );
    }
    settingsPanel.setProps({id: this.id, title: this.schema.title ?? this.label});
    return makeExampleSettingsPanel(settingsPanel);
  }

  finalize(): void {
    this.unsubscribe();
  }
}

export function getSettingDefinitions(schema: SettingsSchema): Map<string, SettingDescriptor> {
  const settingDefinitions = new Map<string, SettingDescriptor>();
  for (const section of schema.sections) {
    for (const setting of section.settings) {
      settingDefinitions.set(setting.name, setting);
    }
  }
  return settingDefinitions;
}

export function makeInlineSettingsSchema(schema: SettingsSchema): SettingsSchema {
  const settings = schema.sections.flatMap(section => section.settings);
  return {
    title: schema.title,
    sections: [
      {
        id: 'settings',
        name: '',
        initiallyCollapsed: false,
        settings: [
          ...settings.filter(setting => MODEL_SETTING_NAMES.has(setting.name)),
          ...settings.filter(setting => !MODEL_SETTING_NAMES.has(setting.name))
        ]
      }
    ]
  };
}

function makeExampleSettingsPanel(
  panel: Panel,
  sectionPresentation: 'inline' | 'accordion' = 'inline'
): Panel {
  panel.setProps({
    content: h(
      'div',
      {
        [EXAMPLE_SETTINGS_PANEL_ATTRIBUTE]: '',
        [EXAMPLE_SETTINGS_SECTIONS_ATTRIBUTE]: sectionPresentation
      } as JSX.HTMLAttributes<HTMLDivElement>,
      panel.content
    )
  });
  return panel;
}

export function getChangedSetting(
  changedSettings: readonly SettingsChangeDescriptor[] | undefined,
  settingName: string
): SettingsChangeDescriptor | undefined {
  return changedSettings?.find(changedSetting => changedSetting.name === settingName);
}

export function configurePanelHostElement(
  hostElement: HTMLElement,
  appearance: ExamplePanelAppearance = 'inherit'
): void {
  const inheritedAppearance = hostElement
    .closest<HTMLElement>('[data-info-box-appearance]')
    ?.getAttribute('data-info-box-appearance');
  const resolvedAppearance =
    appearance === 'inherit' &&
    (inheritedAppearance === 'cinematic' || inheritedAppearance === 'light')
      ? inheritedAppearance
      : appearance;

  hostElement.setAttribute(EXAMPLE_PANEL_HOST_ATTRIBUTE, '');
  hostElement.style.minWidth = '0';
  hostElement.style.width = '100%';
  hostElement.setAttribute(EXAMPLE_PANEL_APPEARANCE_ATTRIBUTE, resolvedAppearance);
  if (resolvedAppearance === 'cinematic' || resolvedAppearance === 'light') {
    applyExampleTheme(hostElement, resolvedAppearance);
  } else {
    clearExampleTheme(hostElement);
  }
  hostElement.style.setProperty('--menu-backdrop-filter', 'unset');
  hostElement.style.setProperty(
    '--menu-background',
    resolvedAppearance === 'cinematic' || resolvedAppearance === 'light'
      ? EXAMPLE_THEME_TOKENS[resolvedAppearance].surface
      : 'transparent'
  );
  hostElement.style.setProperty('--menu-border', 'none');
  hostElement.style.setProperty('--menu-shadow', 'none');
}
