import styled from 'styled-components';
import {isMobile} from '../common';

export const ExampleHeader = styled.div`
  font: bold 20px/28px;
  color: #485668;
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
    transition-duration: 0.4s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  &:hover {
    box-shadow: 0 4px 16px hsla(0, 0%, 0%, 0.16);
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
  color: #FFFFFF;
  font: normal 14px/20px;
  font-size: 1.5em;
  text-align: center;
  line-height: initial;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
  border: solid 1px #FFFFFF;
  opacity: 0;
  transition-property: opacity;
  transition-duration: 0.4s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    opacity: 1;
  }
`;
