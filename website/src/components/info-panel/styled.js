import styled from 'styled-components';
import {isMobile} from '../common';

export const PanelContainer = styled.div`
  font-size: 14px;
  position: absolute;
  top: 0;
  right: 0;
  width: 344px;
  background: var(--ifm-background-surface-color);
  box-shadow: var(--ifm-global-shadow-lw);
  margin: 24px;
  padding: 10px 24px;
  max-height: 96%;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-y: overlay;
  outline: none;
  z-index: 1;

  ${isMobile} {
    width: auto;
    left: 0;
  }
`;

export const PanelExpander = styled.div`
  display: none;
  width: 16px;
  height: 16px;
  font-family: serif;
  font-size: 0.8em;
  text-align: center;
  line-height: 16px;
  border-radius: 50%;
  background: ${props => (props.$expanded ? 'none' : 'var(--ifm-color-gray-900)')};
  color: ${props => (props.$expanded ? 'var(--ifm-color-black)' : 'var(--ifm-color-white)')};
  ${isMobile} {
    display: block;
  }
`;

export const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: bold 1.25em var(--ifm-font-family-base);
  margin: 8px 0;
  ${isMobile} {
    cursor: pointer;
  }
`;

export const PanelContent = styled.div`
  div > * {
    vertical-align: middle;
    white-space: nowrap;
  }
  div > label {
    display: inline-block;
    width: 40%;
    margin-right: 10%;
    color: var(--ifm-color-content-secondary);
    margin-top: 2px;
    margin-bottom: 2px;
  }
  div > input,
  div > a,
  div > button,
  div > select {
    font: normal 11px/16px var(--ifm-font-family-base);
    line-height: 20px;
    text-transform: none;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
    padding: 0 4px;
    width: 50%;
    height: 20px;
    text-align: left;
  }
  div > button {
    color: initial;
  }
  div > button:disabled {
    color: var(--ifm-color-gray-300);
    cursor: default;
    background: var(--ifm-color-gray-300);
  }
  div > input {
    border: solid 1px var(--ifm-color-gray-300);
    &:disabled {
      background: var(--ifm-color-white);
    }
    &[type='checkbox'] {
      height: auto;
    }
  }
  p {
    margin-bottom: 12px;
    white-space: initial;
  }
  ${isMobile} {
    display: ${props => (props.$expanded ? 'block' : 'none')};
  }
`;

export const SourceLink = styled.a`
  display: block;
  text-align: right;
  margin-top: 8px;
  font: bold 12px/20px var(--ifm-font-family-base);
  color: var(--ifm-color-content-secondary);
  ${isMobile} {
    display: ${props => (props.$expanded ? 'block' : 'none')};
  }
`;
