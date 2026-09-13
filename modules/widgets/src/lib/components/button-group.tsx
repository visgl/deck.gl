// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren} from 'preact';

export type ButtonGroupProps = {
  children: ComponentChildren;
  orientation: 'vertical' | 'horizontal';
};

/** Renders a group of buttons with Widget CSS */
export const ButtonGroup = (props: ButtonGroupProps) => {
  const {children, orientation = 'horizontal'} = props;
  return <div className={`deck-widget-button-group ${orientation}`}>{children}</div>;
};
