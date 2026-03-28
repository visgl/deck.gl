// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Children, useState} from 'react';
import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  flex-direction: row;

  & > * + * {
    margin-left: 2px;
  }
`;

const HeaderItem = styled.div(
  props => `
  cursor: pointer;
  padding: 10px 20px;
  font-weight: bold;
  &:hover {
    background-color: #eeefef;
  }
  ${
    props.isSelected
      ? `
    color: #276EF1;
    border-bottom: 4px solid #276EF1;
  `
      : ''
  }
`
);

const Body = styled.div`
  background-color: rgb(250, 248, 245);
`;

export const Tabs = props => {
  const {children} = props;
  const tabs = Children.toArray(children);
  const [selectedItem, setSelectedItem] = useState(tabs[0]?.props.tag || tabs[0]?.props.title);
  let selected = props.selectedItem !== undefined ? props.selectedItem : selectedItem;
  const setSelected = props.setSelectedItem !== undefined ? props.setSelectedItem : setSelectedItem;
  // check if the selected tab even exists in the list
  if (!tabs.some(e => (e.props.tag || e.props.title) === selected)) {
    selected = selectedItem;
  }
  return (
    <>
      <Header>
        {tabs.map(tab => (
          <HeaderItem
            key={tab.props.title}
            isSelected={(tab.props.tag || tab.props.title) === selected}
            onClick={() => setSelected(tab.props.tag || tab.props.title)}
          >
            {tab.props.title}
          </HeaderItem>
        ))}
      </Header>
      <Body>{tabs.find(tab => (tab.props.tag || tab.props.title) === selected)}</Body>
    </>
  );
};

export const Tab = props => {
  const {children} = props;
  return <>{children}</>;
};
