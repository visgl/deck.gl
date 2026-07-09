// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren, JSX} from 'preact';
import {useMemo} from 'preact/hooks';
import {getCSSMask} from '../data-url';
import {Tooltip} from './tooltip';

export type IconButtonProps = {
  className?: string;
  icon?: string;
  label?: string;
  /** Custom tooltip content. Overrides label for tooltip display. */
  tooltip?: string | ComponentChildren;
  color?: string;
  style?: JSX.CSSProperties;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  children?: ComponentChildren;
};

/** Renders a button component with widget CSS */
export const IconButton = (props: IconButtonProps) => {
  const {className = '', style, color, icon, label, tooltip, onClick, children} = props;
  const tooltipContent = tooltip ?? label;

  const iconStyle = useMemo(() => {
    const css: JSX.CSSProperties | undefined = getCSSMask(icon);
    if (!color) return css;
    return {...css, backgroundColor: color};
  }, [color, icon]);

  const button = (
    <button
      className={`deck-widget-icon-button ${className}`}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      {children ? children : <div className="deck-widget-icon" style={iconStyle} />}
    </button>
  );

  return (
    <div className="deck-widget-button" style={style}>
      {tooltipContent ? <Tooltip content={tooltipContent}>{button}</Tooltip> : button}
    </div>
  );
};
