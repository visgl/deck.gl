// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, type WidgetPlacement, type WidgetProps} from '@deck.gl/core';
import {luma} from '@luma.gl/core';
import {render} from 'preact';
import type {Stats, Stat} from '@probe.gl/stats';

const RIGHT_ARROW = '\u25b6';
const DOWN_ARROW = '\u2b07';

const DEFAULT_COUNT_FORMATTER = (stat: Stat): string => `${stat.name}: ${stat.count}`;

function formatTime(time: number): string {
  return time < 1000 ? `${time.toFixed(2)}ms` : `${(time / 1000).toFixed(2)}s`;
}

function formatMemory(bytes: number): string {
  const mb = bytes / 1e6;
  return `${mb.toFixed(1)} MB`;
}

export const DEFAULT_FORMATTERS: Record<string, (stat: Stat) => string> = {
  count: DEFAULT_COUNT_FORMATTER,
  averageTime: (stat: Stat) => `${stat.name}: ${formatTime(stat.getAverageTime())}`,
  totalTime: (stat: Stat) => `${stat.name}: ${formatTime(stat.time)}`,
  fps: (stat: Stat) => `${stat.name}: ${Math.round(stat.getHz())}fps`,
  memory: (stat: Stat) => `${stat.name}: ${formatMemory(stat.count)}`
};

export type StatsWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Type of stats to display. */
  type?: 'deck' | 'luma' | 'device' | 'custom';
  /** Stats object to visualize. */
  stats?: Stats;
  /** Title shown in the header of the pop-up. Defaults to stats.id. */
  title?: string;
  /** How many redraws to wait between updates. */
  framesPerUpdate?: number;
  /** Custom formatters for stat values. */
  formatters?: Record<string, string | ((stat: Stat) => string)>;
  /** Whether to reset particular stats after each update. */
  resetOnUpdate?: Record<string, boolean>;
  /**
   * Controlled collapsed state. When provided, the widget is in controlled mode.
   */
  collapsed?: boolean;
  /**
   * Callback when the collapsed state changes (user clicks header).
   * In controlled mode, use this to update the collapsed prop.
   */
  onCollapsedChange?: (collapsed: boolean) => void;
};

/** Displays probe.gl stats in a floating pop-up. */
export class StatsWidget extends Widget<StatsWidgetProps> {
  static defaultProps: Required<StatsWidgetProps> = {
    ...Widget.defaultProps,
    type: 'deck',
    placement: 'top-left',
    viewId: null,
    stats: undefined!,
    title: 'Stats',
    framesPerUpdate: 1,
    formatters: {},
    resetOnUpdate: {},
    id: 'stats',
    collapsed: undefined!,
    onCollapsedChange: () => {}
  };

  className = 'deck-widget-stats';
  placement = 'top-left' as WidgetPlacement;

  private _counter = 0;
  private _formatters: Record<string, (stat: Stat) => string>;
  private _resetOnUpdate: Record<string, boolean>;
  private _collapsed: boolean = true;

  /**
   * Returns the current collapsed state.
   * In controlled mode, returns the collapsed prop.
   * In uncontrolled mode, returns the internal state.
   */
  getCollapsed(): boolean {
    return this.props.collapsed ?? this._collapsed;
  }

  constructor(props: StatsWidgetProps = {}) {
    super(props);
    this._formatters = {...DEFAULT_FORMATTERS};
    this._resetOnUpdate = {...this.props.resetOnUpdate};
    this.setProps(props);
  }

  setProps(props: Partial<StatsWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    if (props.formatters) {
      for (const name in props.formatters) {
        const f = props.formatters[name];
        this._formatters[name] =
          typeof f === 'string' ? DEFAULT_FORMATTERS[f] || DEFAULT_COUNT_FORMATTER : f;
      }
    }
    if (props.resetOnUpdate) {
      this._resetOnUpdate = {...props.resetOnUpdate};
    }
    super.setProps(props);
  }

  onAdd(): void {
    this.updateHTML();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const stats = this._getStats();
    const isCollapsed = this.getCollapsed();
    const title = this.props.title || ('id' in stats ? stats.id : null) || 'Stats';
    const items: JSX.Element[] = [];

    if (!isCollapsed && stats) {
      stats.forEach(stat => {
        const lines = this._getLines(stat).split('\n');
        if (this._resetOnUpdate && this._resetOnUpdate[stat.name]) {
          stat.reset();
        }
        lines.forEach((line, i) => {
          items.push(
            <div key={`${stat.name}-${i}`} style={{whiteSpace: 'pre'}}>
              {line}
            </div>
          );
        });
      });
    }

    render(
      <div className="deck-widget-stats-container" style={{cursor: 'default'}}>
        <div
          className="deck-widget-stats-header"
          style={{cursor: 'pointer', pointerEvents: 'auto'}}
          onClick={this._toggleCollapsed}
        >
          {isCollapsed ? RIGHT_ARROW : DOWN_ARROW} {title}
        </div>
        {!isCollapsed && <div className="deck-widget-stats-content">{items}</div>}
      </div>,
      rootElement
    );
  }

  onRedraw(): void {
    const framesPerUpdate = Math.max(1, this.props.framesPerUpdate || 1);
    if (this._counter++ % framesPerUpdate === 0) {
      this.updateHTML();
    }
  }

  protected _getStats(): Stats | [key: string, value: number][] {
    switch (this.props.type) {
      case 'deck':
        // @ts-expect-error metrics is protected
        const metrics = this.deck?.metrics ?? {};
        return Object.entries(metrics);
      case 'luma':
        return Array.from(luma.stats.stats.values())[0];
      case 'device':
        // @ts-expect-error is protected
        const device = this.deck?.device;
        const stats = device?.statsManager.stats.values();
        return stats ? Array.from(stats)[0] : [];
      case 'custom':
        return this.props.stats;
      default:
        throw new Error(`Unknown stats type: ${this.props.type}`);
    }
  }

  protected _toggleCollapsed = (): void => {
    const nextCollapsed = !this.getCollapsed();

    // Always call callback if provided
    this.props.onCollapsedChange?.(nextCollapsed);

    // Only update internal state if uncontrolled
    if (this.props.collapsed === undefined) {
      this._collapsed = nextCollapsed;
      this.updateHTML();
    }
    // In controlled mode, parent will update collapsed prop which triggers updateHTML via setProps
  };

  protected _getLines(stat: Stat | [key: string, value: number]): string {
    if ('count' in stat) {
      const formatter =
        this._formatters[stat.name] || this._formatters[stat.type || ''] || DEFAULT_COUNT_FORMATTER;
      return formatter(stat);
    }
    const [key, value] = stat;
    const formattedValue = key.endsWith('Memory')
      ? formatMemory(value)
      : key.includes('Time')
        ? formatTime(value)
        : `${value.toFixed(2)}`;

    return `${key}: ${formattedValue}`;
  }
}
