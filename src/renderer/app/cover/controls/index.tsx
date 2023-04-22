/* eslint-disable no-console */
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';

import { DEFAULT_SETTINGS } from '../../../../models/settings';
import { AccountType, SpotifyApiInstance } from '../../../api/spotify-api';
import { useCurrentlyPlaying } from '../../../contexts/currently-playing.context';

const ControlsContainer = styled.div`
  overflow: hidden;
  background-color: #000000aa;
  position: absolute;
  top: 0;
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  border: 1px solid #5252524d;
  opacity: 0;
  transition: 0.1s;

  p {
    margin: auto;
    color: white;
    padding: 0;
  }
`;

const ControlsCluster = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
`;

const ControlIcon = styled.li<{ fontSize: string }>`
  vertical-align: middle;
  color: #6affb3bf;
  background-color: #00000080;
  padding: 0.5rem;
  border-radius: 50%;
  border: 1px solid #4c4c4c54;
  margin: 0.25em;
  transition: transform 0.2s;
  ${({ fontSize }) =>
    css`
      font-size: ${fontSize};
      height: ${fontSize};
      width: ${fontSize};
      line-height: ${fontSize};
    `};

  &:hover {
    background-color: #000000ed;
    transform: scale(1.25);
    color: #00ff7ebf;
  }

  &:active {
    background-color: #000000;
    border-color: rgb(59, 59, 59);
  }
`;

const LikeIcon = styled(ControlIcon)`
  color: #ffa9f4bb;

  &:hover {
    color: #ff00ddbb;
  }
`;

const moveSongProgress = async (isForward: boolean, distInSec: number): Promise<void> => {
  const currentlyPlaying = await SpotifyApiInstance.getCurrentlyPlaying();
  const currentProgress = Number(currentlyPlaying.progress_ms);
  const distInMs = distInSec * 1000;
  const newProgress = isForward ? currentProgress + distInMs : currentProgress - distInMs;

  await SpotifyApiInstance.seek(newProgress);
};

interface Props {
  skipSongDelay: number;
  onPlaybackChanged: () => void;
  onTrackLiked: () => void;
  onError: (error: string) => void;
}

export const Controls: FunctionComponent<Props> = ({
  skipSongDelay = DEFAULT_SETTINGS.skipSongDelay,
  onPlaybackChanged,
  onTrackLiked,
  onError,
}) => {
  const { state } = useCurrentlyPlaying();

  const handlePausePlay = useCallback(async (): Promise<void> => {
    try {
      SpotifyApiInstance.play(state.isPlaying);
      onPlaybackChanged();
      console.log(`Playback changed: ${state.isPlaying ? 'playing' : 'pause'}.`);
    } catch (error) {
      onError((error as Error).message);
      console.error(error);
    }
  }, [onError, onPlaybackChanged, state.isPlaying]);

  const handleSkip = useCallback(
    async (isForward: boolean, event: React.MouseEvent): Promise<void> => {
      try {
        const isMove = event.ctrlKey || event.metaKey;
        if (isMove) {
          moveSongProgress(isForward, skipSongDelay);
        } else {
          SpotifyApiInstance.skip(isForward);
        }
        onPlaybackChanged();
        console.log(`Playback changed: skipped ${isMove ? `${skipSongDelay} seconds` : 'song'}.`);
      } catch (error) {
        onError((error as Error).message);
        console.error(error);
      }
    },
    [onError, onPlaybackChanged, skipSongDelay]
  );

  const handleLike = useCallback(async (): Promise<void> => {
    try {
      await SpotifyApiInstance.like(!!state.isLiked, state.id);
      onTrackLiked();
      console.log(`Song ${state.isLiked ? 'unliked 💔' : 'liked 💜'}.`);
    } catch (error) {
      onError((error as Error).message);
      console.error(error);
    }
  }, [onError, onTrackLiked, state.id, state.isLiked]);

  const accountType = useMemo(() => state.userProfile?.accountType, [state.userProfile?.accountType]);

  return (
    <ControlsContainer className="controls centered draggable">
      {accountType ? (
        <ControlsCluster className="controls-cluster draggable">
          {accountType === AccountType.Premium ? (
            <p className="draggable">
              <button type="button" onClick={(event) => handleSkip(false, event)} className="skip unstyled-button">
                <ControlIcon fontSize="10px" className="fa fa-step-backward" />
              </button>
              <button type="button" onClick={handlePausePlay} className="pause-play unstyled-button">
                <ControlIcon fontSize="18px" className={`fa ${state.isPlaying ? 'fa-pause' : 'fa-play'}`} />
              </button>
              <button type="button" onClick={(event) => handleSkip(true, event)} className="skip unstyled-button">
                <ControlIcon fontSize="10px" className="fa fa-step-forward" />
              </button>
            </p>
          ) : null}
          <p className="draggable">
            <button type="button" onClick={handleLike} className="unstyled-button">
              <LikeIcon fontSize="8px" className={`${state.isLiked ? 'fa' : 'far'} fa-heart`} />
            </button>
          </p>
        </ControlsCluster>
      ) : null}
    </ControlsContainer>
  );
};
