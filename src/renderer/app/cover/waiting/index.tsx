import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const WaitingWrapper = styled.div`
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;

  p {
    margin: auto;
    color: #84bd00;
    font-size: 300%;
    opacity: 0.5;
    animation: fader 1s infinite alternate;
  }

  @keyframes fader {
    from {
      opacity: 0;
    }
  }
`;

export const Waiting: FunctionComponent = () => (
  <WaitingWrapper className="centered draggable">
    <p className="draggable">
      <i className="fab fa-spotify draggable" />
    </p>
  </WaitingWrapper>
);
