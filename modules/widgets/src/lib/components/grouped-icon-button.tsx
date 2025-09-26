// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren, JSX} from 'preact';

export type GroupedIconButtonProps = {
  className?: string;
  label?: string;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  children?: ComponentChildren;
};

/** Renders an icon button as part of a ButtonGroup */
export const GroupedIconButton = (props: GroupedIconButtonProps) => {
  const {className = '', label, onClick, children} = props;
  return (
    <button
      className={`deck-widget-icon-button ${className}`}
      type="button"
      onClick={onClick}
      title={label}
    >
      {children ? children : <div className="deck-widget-icon" />}
    </button>
  );
};
