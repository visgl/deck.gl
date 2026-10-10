// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {SettingsChangeDescriptor, SettingsSchema} from '@deck.gl-community/panels';
import * as arrow from 'apache-arrow';
import {
  ArrowExamplePanelManager,
  type ArrowExampleLoadedTableStream
} from '../arrow/arrow-example-panels';
import {ExampleSettingsPanelManager, makeHtmlCustomPanel} from '../example-panels';

type DeckArrowSourcePanelOptions<State extends Record<string, unknown>> = {
  id: string;
  description: string;
  schema: SettingsSchema;
  initialState: State;
  onSettingsChange: (state: State, changedSettings?: SettingsChangeDescriptor[]) => void;
};

/** Shared settings and Arrow-table inspector used by the deck.gl Arrow examples. */
export class DeckArrowSourcePanel<State extends Record<string, unknown>> {
  readonly panels: ArrowExamplePanelManager;
  private readonly settingsPanel: ExampleSettingsPanelManager;
  private readonly id: string;

  constructor({
    id,
    description,
    schema,
    initialState,
    onSettingsChange
  }: DeckArrowSourcePanelOptions<State>) {
    this.id = id;
    this.settingsPanel = new ExampleSettingsPanelManager({
      id: `${id}-settings`,
      schema,
      settings: initialState,
      onSettingsChange: (settings, changedSettings) =>
        onSettingsChange(settings as State, changedSettings)
    });
    this.panels = new ArrowExamplePanelManager({
      descriptionPanel: () =>
        makeHtmlCustomPanel({
          id: `${id}-description`,
          title: 'Description',
          html: `<p>${description}</p>`
        }),
      settingsPanel: () => this.settingsPanel.makePanel()
    });
  }

  initialize(): void {
    this.panels.mount();
  }

  setSettings(schema: SettingsSchema, settings: State): void {
    this.settingsPanel.setSchemaAndSettings(schema, settings);
    this.panels.refresh();
  }

  beginTableStream(recordBatches: readonly arrow.RecordBatch[]): ArrowExampleLoadedTableStream {
    return this.panels.beginLoadedTableStream({
      id: `${this.id}-source`,
      label: 'Loaded Arrow source',
      kind: 'source',
      recordBatches
    });
  }

  finalize(): void {
    this.settingsPanel.finalize();
    this.panels.finalize();
  }
}
