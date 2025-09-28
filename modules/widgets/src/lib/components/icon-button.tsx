// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren, JSX} from 'preact';

export type IconButtonProps = {
  className?: string;
  label?: string;
  onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
  children?: ComponentChildren;
};

/** Renders a button component with widget CSS */
export const IconButton = (props: IconButtonProps) => {
  const {className = '', label, onClick, children} = props;
  return (
    <div className="deck-widget-button">
      <button
        className={`deck-widget-icon-button ${className}`}
        type="button"
        onClick={onClick}
        title={label}
      >
        {children ? children : <div className="deck-widget-icon" />}
      </button>
    </div>
  );
};
