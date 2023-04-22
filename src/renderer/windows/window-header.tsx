import React, { FunctionComponent, ReactNode } from 'react';
import styled from 'styled-components';

import { TitleBar } from '../components/title-bar';

export const WindowHeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export const WindowTitle = styled.h2`
  display: flex;
  width: 100%;
  margin-top: 0;
`;

interface Props {
  title: ReactNode;
  onClose: () => void;
}

export const WindowHeader: FunctionComponent<Props> = ({ title, onClose }) => (
  <WindowHeaderContent className="header">
    <WindowTitle className="title draggable-window">{title}</WindowTitle>
    <TitleBar onClose={onClose} />
  </WindowHeaderContent>
);
