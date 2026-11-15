// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  ArrowBatchesPanel,
  ArrowSchemaPanel,
  ArrowTablePanel,
  CustomPanel,
  TabbedPanel,
  type Panel
} from '@deck.gl-community/panels';
import * as arrow from 'apache-arrow';
import {Fragment, h} from 'preact';
import {
  configurePanelHostElement,
  makeExampleContentPanel,
  makeHtmlCustomPanel,
  makeExamplePanelHostHtml,
  makeExampleTabbedPanel,
  renderExamplePanel
} from '../example-panels';

const ARROW_EXAMPLE_PANEL_HOST_ID = 'arrow-example-panel-host';
const ARROW_EXAMPLE_DESCRIPTION_PANEL_ID = 'arrow-example-description';
const ARROW_EXAMPLE_SETTINGS_PANEL_ID = 'arrow-example-settings';
const ARROW_EXAMPLE_TABLES_PANEL_ID = 'arrow-example-tables';
const ARROW_EXAMPLE_TABLE_PREVIEW_ROW_LIMIT = 50;
const ARROW_EXAMPLE_TABLE_PREVIEW_NESTED_ITEM_LIMIT = 6;

export type ArrowExampleTableKind = 'source' | 'derived';

export type ArrowExampleTableEntry = {
  id: string;
  label: string;
  kind: ArrowExampleTableKind;
  table: arrow.Table;
};

export type ArrowExampleLoadedTableStream = {
  setLoadedBatchCount: (loadedBatchCount: number) => void;
};

type BeginLoadedTableStreamProps = Omit<ArrowExampleTableEntry, 'table'> & {
  recordBatches: readonly arrow.RecordBatch[];
};

type ArrowExamplePanelFactory = Panel | (() => Panel);

/** Returns the InfoBox host used by panel-backed Arrow example content. */
export function makeArrowExamplePanelHostHtml(): string {
  return makeExamplePanelHostHtml(ARROW_EXAMPLE_PANEL_HOST_ID);
}

/** Owns panel-backed description, settings, and CPU Arrow table inspection for one Arrow example. */
export class ArrowExamplePanelManager {
  private readonly makeDescriptionPanel: () => Panel;
  private readonly makeSettingsPanel: () => Panel;
  private readonly tableEntries = new Map<string, ArrowExampleTableEntry>();
  private readonly activeStreamVersionByTableId = new Map<string, number>();
  private nextStreamVersion = 0;
  private hostElement: HTMLElement | null = null;

  constructor({
    descriptionHtml,
    descriptionPanel,
    settingsPanel
  }: {
    descriptionHtml?: string;
    descriptionPanel?: ArrowExamplePanelFactory;
    settingsPanel?: ArrowExamplePanelFactory;
  }) {
    const defaultDescriptionPanel = makeHtmlCustomPanel({
      id: ARROW_EXAMPLE_DESCRIPTION_PANEL_ID,
      title: 'Description',
      html: descriptionHtml ?? ''
    });
    const defaultSettingsPanel = makeEmptyArrowExampleSettingsPanel();
    this.makeDescriptionPanel = makeArrowExamplePanelFactory(
      descriptionPanel,
      () => defaultDescriptionPanel
    );
    this.makeSettingsPanel = makeArrowExamplePanelFactory(
      settingsPanel,
      () => defaultSettingsPanel
    );
  }

  mount(): void {
    if (this.hostElement || typeof document === 'undefined') {
      return;
    }

    const hostElement = document.getElementById(ARROW_EXAMPLE_PANEL_HOST_ID);
    if (!(hostElement instanceof HTMLElement)) {
      return;
    }

    this.hostElement = hostElement;
    configurePanelHostElement(hostElement);
    this.render();
  }

  finalize(): void {
    if (this.hostElement) {
      renderExamplePanel(this.hostElement, null);
    }
    this.hostElement = null;
  }

  setTableEntries(tableEntries: readonly ArrowExampleTableEntry[]): void {
    this.tableEntries.clear();
    for (const tableEntry of tableEntries) {
      this.tableEntries.set(tableEntry.id, tableEntry);
    }
    this.pruneTableState();
    this.render();
  }

  upsertTableEntry(tableEntry: ArrowExampleTableEntry): void {
    this.tableEntries.set(tableEntry.id, tableEntry);
    this.render();
  }

  removeTableEntry(tableId: string): void {
    if (!this.tableEntries.delete(tableId)) {
      return;
    }
    this.activeStreamVersionByTableId.delete(tableId);
    this.render();
  }

  beginLoadedTableStream({
    recordBatches,
    ...tableEntry
  }: BeginLoadedTableStreamProps): ArrowExampleLoadedTableStream {
    const streamVersion = ++this.nextStreamVersion;
    this.activeStreamVersionByTableId.set(tableEntry.id, streamVersion);
    const schema = recordBatches[0]?.schema ?? new arrow.Schema([]);
    const totalBatchCount = recordBatches.length;

    const setLoadedBatchCount = (loadedBatchCount: number): void => {
      if (this.activeStreamVersionByTableId.get(tableEntry.id) !== streamVersion) {
        return;
      }

      const effectiveLoadedBatchCount = Math.min(
        totalBatchCount,
        Math.max(0, Math.floor(loadedBatchCount))
      );
      this.upsertTableEntry({
        ...tableEntry,
        table: new arrow.Table(schema, recordBatches.slice(0, effectiveLoadedBatchCount))
      });
    };

    setLoadedBatchCount(0);
    return {setLoadedBatchCount};
  }

  refresh(): void {
    this.render();
  }

  private render(): void {
    if (!this.hostElement) {
      return;
    }

    renderExamplePanel(
      this.hostElement,
      makeExampleTabbedPanel({
        id: 'arrow-example-root-tabs',
        title: 'Arrow example',
        tabListLayout: 'wrap',
        panels: [this.makeDescriptionPanel(), this.makeSettingsPanel(), this.makeTablesPanel()]
      })
    );
  }

  private makeTablesPanel(): Panel {
    const tableEntries = Array.from(this.tableEntries.values());
    if (tableEntries.length === 0) {
      return new CustomPanel({
        id: ARROW_EXAMPLE_TABLES_PANEL_ID,
        title: 'Tables',
        onRenderHTML: rootElement => {
          rootElement.innerHTML =
            '<p style="margin: 0; color: #475569; font: 500 12px/1.45 system-ui, sans-serif;">Waiting for Arrow table data.</p>';
        }
      });
    }

    const tablePanels = tableEntries.map(tableEntry => this.makeTablePanel(tableEntry));
    const tablePanel =
      tablePanels.length === 1
        ? tablePanels[0]
        : new TabbedPanel({
            id: 'arrow-example-table-tabs',
            title: 'Tables',
            tabListLayout: 'wrap',
            panels: tablePanels
          });

    tablePanel.setProps({id: ARROW_EXAMPLE_TABLES_PANEL_ID, title: 'Tables'});
    return tablePanel;
  }

  private makeTablePanel(tableEntry: ArrowExampleTableEntry): Panel {
    const batchesPanel = new ArrowBatchesPanel({
      id: `${tableEntry.id}-batches`,
      title: 'Batches',
      table: tableEntry.table
    });
    const contentsPanel = new ArrowTablePanel({
      id: `${tableEntry.id}-contents`,
      title: 'Contents',
      table: tableEntry.table,
      batchIndex: 'all',
      showRowIndex: true,
      maxRows: ARROW_EXAMPLE_TABLE_PREVIEW_ROW_LIMIT,
      maxNestedItems: ARROW_EXAMPLE_TABLE_PREVIEW_NESTED_ITEM_LIMIT
    });
    const schemaPanel = new ArrowSchemaPanel({
      id: `${tableEntry.id}-schema`,
      title: 'Schema',
      schema: tableEntry.table.schema
    });

    return makeExampleContentPanel({
      id: `${tableEntry.id}-panel`,
      title: tableEntry.label,
      content: h(Fragment, {}, batchesPanel.content, contentsPanel.content, schemaPanel.content)
    });
  }

  private pruneTableState(): void {
    for (const tableId of this.activeStreamVersionByTableId.keys()) {
      if (!this.tableEntries.has(tableId)) {
        this.activeStreamVersionByTableId.delete(tableId);
      }
    }
  }
}

function makeArrowExamplePanelFactory(
  panel: ArrowExamplePanelFactory | undefined,
  fallback: () => Panel
): () => Panel {
  if (typeof panel === 'function') {
    return panel;
  }
  return panel ? () => panel : fallback;
}

function makeEmptyArrowExampleSettingsPanel(): Panel {
  return makeHtmlCustomPanel({
    id: ARROW_EXAMPLE_SETTINGS_PANEL_ID,
    title: 'Settings',
    html: '<p style="margin: 0; color: #475569; font: 500 12px/1.45 system-ui, sans-serif;">No settings for this example.</p>'
  });
}
