import React, { FunctionComponent, useMemo } from 'react';
import styled from 'styled-components';

import { DEFAULT_SETTINGS } from '../../../models/settings';
import { useSettings } from '../../contexts/settings.context';

const TrackInfoWrapper = styled.div`
  position: fixed;
  transition: 0.1s;
  padding: 0.5em;
  max-width: 400px;

  div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .left {
      text-align: 'start';
    }

    .right {
      text-align: 'end';
    }
  }
`;

const Track = styled.div`
  font-weight: bold;
`;

const Artist = styled(Track)`
  font-weight: normal;
  font-size: 90%;
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
`;

const Message = styled(Track)`
  font-size: 80%;
  font-style: italic;
  font-weight: normal;
  padding-left: 0.25rem;
`;

interface TrackInfoProps {
  track?: string;
  artist?: string;
  message?: string;
  isOnLeft?: boolean;
}

export const TrackInfo: FunctionComponent<TrackInfoProps> = ({ track, artist, message, isOnLeft }) => {
  const { state } = useSettings();
  const backgroundColor = useMemo(() => {
    const normalizedOpacity = Math.floor((state.trackInfoBackgroundOpacity / 100) * 255);
    const color = state.trackInfoBackgroundColor || DEFAULT_SETTINGS.trackInfoBackgroundColor;

    return `${color}${normalizedOpacity.toString(16)}`;
  }, [state]);

  return (
    <TrackInfoWrapper
      style={{
        right: !isOnLeft && 0,
        left: isOnLeft && 0,
        fontFamily: state.font || DEFAULT_SETTINGS.font,
        fontSize: state.trackInfoFontSize || DEFAULT_SETTINGS.trackInfoFontSize,
        color: state.trackInfoColor || DEFAULT_SETTINGS.trackInfoColor,
        backgroundColor,
      }}>
      <Track
        style={{
          textAlign: isOnLeft ? 'start' : 'end',
          paddingLeft: !isOnLeft && '0.5rem',
          paddingRight: isOnLeft && '0.5rem',
        }}>
        {track}
      </Track>
      <Artist
        style={{
          textAlign: isOnLeft ? 'start' : 'end',
          paddingLeft: !isOnLeft && '0.5rem',
          paddingRight: isOnLeft && '0.5rem',
        }}>
        {artist}
      </Artist>
      <MessageWrapper
        style={{
          display: message ? 'flex' : 'none',
          justifyContent: isOnLeft ? 'start' : 'end',
          paddingLeft: !isOnLeft && '0.5rem',
          paddingRight: isOnLeft && '0.5rem',
        }}>
        <i className="fa fa-warning" />
        <Message>{message}</Message>
      </MessageWrapper>
    </TrackInfoWrapper>
  );
};
