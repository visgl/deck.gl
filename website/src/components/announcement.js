/* eslint-disable no-undef */
import React, { Component } from "react";
import styled from 'styled-components';
import CloseButton from "./close-button";

const AnnounceBanner = styled.div`
  display: flex;
  position: fixed;
  width: 100vw;
  height: 64px;
  bottom: 0;
  z-index: 3;
  background: ${props => props.theme.colors.primary};
  padding: 14px 24px;
  justify-content: space-between;

  @media screen and (max-width: ${props => props.theme.breakpoints.medium}px) {
    height: 200px;
    padding-top: 44px;

    button {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }
`

const AnnounceContent = styled.div`
  display: flex;
  align-items: center;

  @media screen and (max-width: ${props => props.theme.breakpoints.medium}px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`

const AnnounceTitleWrapper = styled.div`
  display: flex;

  @media screen and (max-width: ${props => props.theme.breakpoints.medium}px) {
    margin-bottom: 24px;
  }

  &:before {
    content: '';
    display: inline-block;
    height: 16px;
    width: 16px;
    background: #000;
    flex-shrink: 0;
    margin-right: 8px;
    margin-top: 8px;
  }
`

const AnnounceTitle = styled.span`
  font-weight: bold;
  font-size: 18px;
  line-height: 1.33;
  margin-right: 32px;

  strong {
    font-size: 24px;
  }

  small {
    font-size: 14px;
  }
`

const Button = styled.a`
  padding: 6px 26px;
  border: 2px solid #000;
  background: transparent;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: bold;
  color: #000;
  letter-spacing: 2px;

  &:hover {
    background: #FFF;
    border-color: #FFF;
  }
`
const localStorageKey = 'madridSummit2022'

const isSsr = typeof window === 'undefined'
const getLocalStorageItem = (item) => {
  return !isSsr && window.localStorage.getItem(item)
}

const setLocalStorageItem = (item, value) => {
  return !isSsr && window.localStorage.setItem(item, value)
}

export default class Announcement extends Component{
  constructor(props) {
    super(props)
    this.state = { announceShowed: isSsr ? true : getLocalStorageItem(localStorageKey) }
  }


  handleClick = () => {
    this.setState({ announceShowed: true })
    setLocalStorageItem(localStorageKey, 'closed')
  }

  render() {
    
    return (
      <div>
        {!this.state.announceShowed && <AnnounceBanner>
          <AnnounceContent>
            <AnnounceTitleWrapper>
              <AnnounceTitle>
                Open Visualization Collaborator
                <strong>{' Summit '}</strong>
                <small>{'(In person and Online). '}</small>
                September 22th 2022. Madrid.
              </AnnounceTitle>
            </AnnounceTitleWrapper>
            <Button href="https://deck.gl/events/madrid-summit-2022/" rel="noopener noreferrer" target="_blank">More info</Button>
          </AnnounceContent>
          <CloseButton onClick={this.handleClick}/>
        </AnnounceBanner>}
      </div>
    )
  }
}
