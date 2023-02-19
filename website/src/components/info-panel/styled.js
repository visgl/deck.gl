import styled from 'styled-components';
import {isMobile} from '../common';

export const PanelContainer = styled.div`
  font: normal 14px/20px;
  position: absolute;
  top: 0;
  right: 0;
  width: 344px;
  background: #FFFFFF;
  box-shadow: 0 1px 4px hsla(0, 0%, 0%, 0.16);
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
  background: ${(props) => (props.$expanded ? 'none' : '#2B3848')};
  color: ${(props) => (props.$expanded ? '#19202C' : '#FFFFFF')};
  ${isMobile} {
    display: block;
  }
`;

export const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: bold 16px/24px;
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
    color: #485668;
    margin-top: 2px;
    margin-bottom: 2px;
  }
  div > input,
  div > a,
  div > button,
  div > select {
    background: #FFFFFF;
    font: normal 11px/16px;
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
    color: #ECF2F7;
    cursor: default;
    background: #ECF2F7;
  }
  div > input {
    border: solid 1px hsla(0, 0%, 0%, 0.12);
    &:disabled {
      background: #FFFFFF;
    }
    &[type='checkbox'] {
      height: auto;
    }
  }
  p {
    margin-bottom: 16px;
    white-space: initial;
  }
  ${isMobile} {
    display: ${(props) => (props.$expanded ? 'block' : 'none')};
  }
`;

export const SourceLink = styled.a`
  display: block;
  text-align: right;
  margin-top: 8px;
  font: bold 12px/20px;
  color: #485668;
  ${isMobile} {
    display: ${(props) => (props.$expanded ? 'block' : 'none')};
  }
`;
