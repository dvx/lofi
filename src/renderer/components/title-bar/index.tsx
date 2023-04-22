import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import { CloseButton } from '../buttons/close-button';

const TitleBarWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  font-size: 125%;
`;

interface Props {
  onClose: () => void;
}

export const TitleBar: FunctionComponent<Props> = ({ onClose }) => (
  <TitleBarWrapper className="titlebar">
    <div className="full draggable-window">&nbsp;</div>
    <CloseButton onClose={onClose} />
  </TitleBarWrapper>
);
