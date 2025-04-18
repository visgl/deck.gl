// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren} from 'preact';

export type IconButtonProps = {
  className: string;
  label: string;
  onClick: (event?) => unknown;
  /** Optional icon or element to render inside the button */
  children?: ComponentChildren;
};

export const IconButton = (props: IconButtonProps) => {
  const {className, label, onClick, children} = props;
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

export const ButtonGroup = props => {
  const {children, orientation} = props;
  return <div className={`deck-widget-button-group ${orientation}`}>{children}</div>;
};

export const GroupedIconButton = props => {
  const {className, label, onClick} = props;
  return (
    <button
      className={`deck-widget-icon-button ${className}`}
      type="button"
      onClick={onClick}
      title={label}
    >
      <div className="deck-widget-icon" />
    </button>
  );
};
