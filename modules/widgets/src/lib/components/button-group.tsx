// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren} from 'preact';

export type ButtonGroupProps = {
  children: ComponentChildren;
  orientation;
};

/** Renders a group of buttons with Widget CSS */
export const ButtonGroup = (props: ButtonGroupProps) => {
  const {children, orientation} = props;
  return <div className={`deck-widget-button-group ${orientation}`}>{children}</div>;
};
