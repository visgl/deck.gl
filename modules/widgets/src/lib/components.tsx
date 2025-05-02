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

/** Renders a button component with widget CSS */
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

export type ButtonGroupProps = {
  children;
  orientation;
};

/** Renders a group of buttons with Widget CSS */
export const ButtonGroup = (props: ButtonGroupProps) => {
  const {children, orientation} = props;
  return <div className={`deck-widget-button-group ${orientation}`}>{children}</div>;
};

export type GroupedIconButtonProps = {
  className;
  label;
  onClick;
};

/** Renders an icon button as part of a ButtonGroup */
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
