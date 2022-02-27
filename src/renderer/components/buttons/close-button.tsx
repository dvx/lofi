import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const CloseButtonStyle = styled.button`
  &:hover {
    color: #ff5858;
  }

  &:active {
    color: #a53e3e;
  }
`;

interface Props {
  onClose: () => void;
}

export const CloseButton: FunctionComponent<Props> = ({ onClose }) => (
  <CloseButtonStyle type="button" onClick={onClose} className="unstyled-button close-button">
    <i className="fa-sharp fa-solid fa-circle-xmark" />
  </CloseButtonStyle>
);
