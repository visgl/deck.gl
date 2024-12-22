export declare type TooltipContent =
  | null
  | string
  | {
      text?: string;
      html?: string;
      className?: string;
      style?: Partial<CSSStyleDeclaration>;
    };
export default class Tooltip {
  private el;
  isVisible: boolean;
  constructor(canvas: HTMLCanvasElement);
  setTooltip(displayInfo: TooltipContent, x?: number, y?: number): void;
  remove(): void;
}
// # sourceMappingURL=tooltip.d.ts.map
