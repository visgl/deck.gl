import styled from 'styled-components';
import {isMobile} from '../common';

export const ExampleHeader = styled.div`
  font: bold 20px/28px var(--ifm-font-family-base);
  color: var(--ifm-color-content-secondary);
  margin: 0 20px;
  border-bottom: 1px solid 20px;
  display: inline-block;
  padding: 20px 20px 4px 0;
`;

export const MainExamples = styled.main`
  padding: 16px 0;
`;

export const ExamplesGroup = styled.main`
  display: flex;
  flex-wrap: wrap;
  padding: 16px;
`;

export const ExampleCard = styled.a`
  cursor: pointer;
  text-decoration: none;
  width: 50%;
  max-width: 240px;
  line-height: 0;
  outline: none;
  padding: 4px;
  position: relative;
  img {
    transition-property: filter;
    transition-duration: var(--ifm-transition-slow);
    transition-timing-function: var(--ifm-transition-timing-default);
  }
  &:hover {
    box-shadow: var(--ifm-global-shadow-md);
  }
  &:hover img {
    filter: contrast(0.2);
  }
  ${isMobile} {
    width: 33%;
    min-width: 200px;
  }
  @media screen and (max-width: 632px) {
    width: 50%;
  }
`;

export const ExampleTitle = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  flex-direction: column;
  color: var(--ifm-color-white);
  font-size: 1.5em;
  text-align: center;
  line-height: initial;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
  border: solid 1px var(--ifm-color-white);
  opacity: 0;
  transition-property: opacity;
  transition-duration: var(--ifm-transition-slow);
  transition-timing-function: var(--ifm-transition-timing-default);
  &:hover {
    opacity: 1;
  }
`;
