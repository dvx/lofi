import React, { FunctionComponent, useMemo } from 'react';
import styled, { css } from 'styled-components';

import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';

const BAR_OPACITY = 1;

interface BarProps {
  backgroundColor: string;
  height: string;
  opacity?: number;
}

const Bar = styled.div<BarProps>`
  position: absolute;
  opacity: 0;
  z-index: 4;
  bottom: 0;

  ${(props) => css`
    background-color: ${props.backgroundColor};
    height: ${props.height};
    opacity: ${props.opacity || 0};
  `}
`;

interface Props {
  barThickness: number;
  barColor: string;
  alwaysShowProgress: boolean;
}

export const Bars: FunctionComponent<Props> = ({ barColor, barThickness, alwaysShowProgress }) => {
  const { state } = useCurrentlyPlaying();

  const progressPercentage = useMemo(() => (state.progress / state.duration) * 100, [state.progress, state.duration]);

  return (
    <>
      <Bar
        height={`${barThickness}px`}
        backgroundColor={barColor}
        opacity={alwaysShowProgress ? BAR_OPACITY : 0}
        className="horizontal bar draggable"
        style={{ width: `${progressPercentage}%` }}
      />
      <Bar
        height={`${state.volume}%`}
        backgroundColor={barColor}
        className="vertical bar draggable"
        style={{ width: `${barThickness}px` }}
      />
    </>
  );
};
