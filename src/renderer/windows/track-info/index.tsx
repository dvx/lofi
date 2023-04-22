import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const TrackInfoWrapper = styled.div`
  position: fixed;
  font-size: 90%;
  color: white;
  background-color: #000000a8;
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
  font-size: 80%;
  color: #ddd;
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  color: #888;
`;

const Message = styled(Track)`
  font-size: 75%;
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

export const TrackInfo: FunctionComponent<TrackInfoProps> = ({ track, artist, message, isOnLeft }) => (
  <TrackInfoWrapper
    style={{
      right: !isOnLeft && 0,
      left: isOnLeft && 0,
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
