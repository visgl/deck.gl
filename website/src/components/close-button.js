import { withPrefix } from "gatsby"
import React, { PureComponent } from "react"
import styled from 'styled-components'

const Button = styled.button`
  background-color: transparent;
  background-image: url(${withPrefix('/images/icon-close.svg')});
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: #FFF;
    cursor:pointer;
  }
`

export default class CloseButton extends PureComponent {
  render() {
    return <Button onClick={(this.props.onClick)} aria-label="close announce" />
  }
}
