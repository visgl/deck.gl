import {Widget, WidgetPlacement, WidgetProps} from '@deck.gl/core';
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
  /** Stats object to visualize. */
  stats: Stats;
  /** Title shown in the header of the pop-up. Defaults to stats.id. */
  title?: string;
  /** How many redraws to wait between updates. */
  framesPerUpdate?: number;
  /** Custom formatters for stat values. */
  formatters?: Record<string, string | ((stat: Stat) => string)>;
  /** Whether to reset particular stats after each update. */
  resetOnUpdate?: Record<string, boolean>;
  /** Start collapsed. */
  collapsed?: boolean;
};

/** Displays probe.gl stats in a floating pop-up. */
export class StatsWidget extends Widget<StatsWidgetProps> {
  static defaultProps: Required<StatsWidgetProps> = {
    ...Widget.defaultProps,
    stats: undefined!,
    title: 'Stats',
    framesPerUpdate: 1,
    formatters: {},
    resetOnUpdate: {},
    collapsed: false,
    id: 'stats'
  };

  className = 'deck-widget-stats';
  placement = 'top-left' as WidgetPlacement;

  private _counter = 0;
  private _formatters: Record<string, (stat: Stat) => string>;
  private _resetOnUpdate: Record<string, boolean>;
  collapsed: boolean;
  _stats: Stats;

  constructor(props: StatsWidgetProps) {
    super(props, StatsWidget.defaultProps);
    this.collapsed = props.collapsed ?? StatsWidget.defaultProps.collapsed;
    this._formatters = {...DEFAULT_FORMATTERS};
    this.setProps(props);
    // if (props.formatters) {
    //   for (const name in props.formatters) {
    //     const f = props.formatters[name];
    //     this._formatters[name] =
    //       typeof f === 'string' ? DEFAULT_FORMATTERS[f] || DEFAULT_COUNT_FORMATTER : f;
    //   }
    // }
    this._resetOnUpdate = {...this.props.resetOnUpdate};
    this._stats = this.props.stats;
  }

  setProps(props: Partial<StatsWidgetProps>): void {
    if (props.collapsed !== undefined) {
      this.collapsed = props.collapsed;
    }
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
    // @ts-expect-error stats is protected
    this._stats = this.props.stats || this.deck?.stats;
    this.updateHTML();
  }

  onRedraw(): void {
    const framesPerUpdate = Math.max(1, this.props.framesPerUpdate || 1);
    if (this._counter++ % framesPerUpdate === 0) {
      this.updateHTML();
    }
  }

  private _toggleCollapsed = (): void => {
    this.collapsed = !this.collapsed;
    this.updateHTML();
  };

  onRenderHTML(rootElement: HTMLElement): void {
    const stats = this._stats;
    const collapsed = this.collapsed;
    const title = this.props.title || stats?.id || 'Stats';
    const items: JSX.Element[] = [];

    if (!collapsed && stats) {
      stats.forEach(stat => {
        const lines = this._getLines(stat);
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
          {collapsed ? RIGHT_ARROW : DOWN_ARROW} {title}
        </div>
        {!collapsed && <div className="deck-widget-stats-content">{items}</div>}
      </div>,
      rootElement
    );
  }

  private _getLines(stat: Stat): string[] {
    const formatter =
      this._formatters[stat.name] || this._formatters[stat.type || ''] || DEFAULT_COUNT_FORMATTER;
    return formatter(stat).split('\n');
  }
}
