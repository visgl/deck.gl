// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren, JSX} from 'preact';
import {useMemo} from 'preact/hooks';
import {getCSSMask} from '../data-url';

export type IconButtonProps = {
  className?: string;
  icon?: string;
  label?: string;
  color?: string;
  style?: JSX.CSSProperties;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  children?: ComponentChildren;
};

/** Renders a button component with widget CSS */
export const IconButton = (props: IconButtonProps) => {
  const {className = '', style, color, icon, label, onClick, children} = props;

  const iconStyle = useMemo(() => {
    const css: JSX.CSSProperties | undefined = getCSSMask(icon);
    if (!color) return css;
    return {...css, backgroundColor: color};
  }, [color, icon]);

  return (
    <div className="deck-widget-button" style={style}>
      <button
        className={`deck-widget-icon-button ${className}`}
        type="button"
        onClick={onClick}
        title={label}
      >
        {children ? children : <div className="deck-widget-icon" style={iconStyle} />}
      </button>
    </div>
  );
};
