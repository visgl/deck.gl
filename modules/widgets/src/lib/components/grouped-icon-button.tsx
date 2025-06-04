// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type GroupedIconButtonProps = {
  label: string;
  /** Icons can be loaded from style sheet using class name */
  className: string;
  /** Alterhnatively an SVG icon element can be provided */
  icon?: () => JSX.Element;
  /** Action to take when button was clicked */
  onClick: () => void;
};

/** Renders an icon button as part of a ButtonGroup */
export const GroupedIconButton = props => {
  const {className, label, icon, onClick} = props;
  return (
    <button
      className={`deck-widget-icon-button ${className || ''}`}
      type="button"
      onClick={onClick}
      title={label}
    >
      <div className="deck-widget-icon">{icon && icon()}</div>
    </button>
  );
};
