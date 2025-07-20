// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type GroupedIconButtonProps = {
  className?: string;
  label: string;
  onClick: () => void;
};

/** Renders an icon button as part of a ButtonGroup */
export const GroupedIconButton = props => {
  const {className, label, onClick} = props;
  return (
    <button
      className={`deck-widget-icon-button ${className || ''}`}
      type="button"
      onClick={onClick}
      title={label}
    >
      <div className="deck-widget-icon" />
    </button>
  );
};
