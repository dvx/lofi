/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-console */
import { clamp } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { WindowName } from '../../../constants';
import { Settings, VisualizationType } from '../../../models/settings';
import { AccountType, SpotifyApiInstance } from '../../api/spotify-api';
import { WindowPortal } from '../../components';
import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';
import { CurrentlyPlayingActions, CurrentlyPlayingType } from '../../reducers/currently-playing.reducer';
import { TrackInfo } from '../../windows/track-info';
import { Bars } from '../bars';
import { Controls } from './controls';
import Menu from './menu';
import { Visualizer } from './visualizer';
import { Waiting } from './waiting';

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;

const TRUNCATE_REGEX = /(.*?)\s[-(•].*/g;
const truncateText = (text: string): string => text?.replace(TRUNCATE_REGEX, '$1');

const CoverContent = styled.div<{ isPlaying: boolean }>`
  background-size: cover;
  transition: 0.2s;
  display: flex;

  ${({ isPlaying }) =>
    !isPlaying &&
    css`
      transition: 0.1s;
      filter: blur(2px) grayscale(50%);
      transform: scale(1.05);
    `}
`;

interface Props {
  settings: Settings;
  message: string;
  onVisualizationChange: () => void;
  onVisualizationCycle?: (isPrevious: boolean) => void;
}

export const Cover: FunctionComponent<Props> = ({ settings, message, onVisualizationChange, onVisualizationCycle }) => {
  const { state, dispatch } = useCurrentlyPlaying();

  const {
    barThickness,
    barColor,
    isAlwaysShowSongProgress,
    isAlwaysShowTrackInfo,
    isOnLeft,
    size,
    skipSongDelay,
    volumeIncrement,
    visualizationId,
    visualizationType,
    visualizerOpacity,
  } = useMemo(() => settings, [settings]);

  const [currentSongId, setCurrentSongId] = useState('');
  const [shouldShowTrackInfo, setShouldShowTrackInfo] = useState(isAlwaysShowTrackInfo);
  const [errorToDisplay, setErrorToDisplay] = useState('');

  useEffect(() => setErrorToDisplay(message), [message]);

  useEffect(() => {
    setShouldShowTrackInfo(isAlwaysShowTrackInfo);
  }, [isAlwaysShowTrackInfo]);

  const artist = useMemo(() => truncateText(state.artist), [state.artist]);
  const songTitle = useMemo(() => truncateText(state.track), [state.track]);

  const handlePlaybackChanged = useCallback(async (): Promise<void> => {
    try {
      const currentlyPlaying = await SpotifyApiInstance.getCurrentlyPlaying();
      if (!currentlyPlaying) {
        return;
      }

      dispatch({ type: CurrentlyPlayingActions.SetCurrentlyPlaying, payload: currentlyPlaying });
      setErrorToDisplay('');
    } catch (error) {
      console.error(error);
      setErrorToDisplay((error as Error).message);
    }
  }, [dispatch]);

  useEffect(() => {
    if (state.isPlaying && state.id !== currentSongId) {
      setCurrentSongId(state.id);
      console.log(`New song '${songTitle}' by '${artist}.`);
    }
  }, [artist, currentSongId, songTitle, state.id, state.isPlaying]);

  const refreshTrackLiked = useCallback(async (): Promise<void> => {
    if (state.type === CurrentlyPlayingType.Track) {
      try {
        const isTrackLiked = await SpotifyApiInstance.isTrackLiked(state.id);

        dispatch({ type: CurrentlyPlayingActions.SetTrackLiked, payload: isTrackLiked });
        await handlePlaybackChanged();
      } catch (error) {
        console.error(error);
        setErrorToDisplay((error as Error).message);
      }
    }
  }, [dispatch, handlePlaybackChanged, state.id, state.type]);

  const keepAlive = useCallback(async (): Promise<void> => {
    if (state.isPlaying || state.userProfile?.accountType !== AccountType.Premium) {
      return;
    }

    try {
      await SpotifyApiInstance.seek(state.progress);
      console.debug('Keep-alive triggered.');
    } catch (error) {
      console.error(error);
      setErrorToDisplay((error as Error).message);
    }
  }, [state.isPlaying, state.progress, state.userProfile]);

  const changeVolume = useCallback(
    (newVolume: number) => {
      try {
        if (newVolume !== undefined && state.userProfile?.accountType === AccountType.Premium) {
          (async () => {
            await SpotifyApiInstance.setVolume(newVolume);
            await handlePlaybackChanged();

            console.log(`Volume set to ${newVolume}`);
          })();
        }
      } catch (error) {
        console.error(error);
        setErrorToDisplay((error as Error).message);
      }
    },
    [handlePlaybackChanged, state.userProfile?.accountType]
  );

  const handleTrackLiked = useCallback(() => {
    refreshTrackLiked();
  }, [refreshTrackLiked]);

  const onMouseWheel = useCallback(
    async ({ deltaY }: WheelEvent): Promise<void> => {
      const direction = Math.sign(deltaY);
      const newVolume = clamp(state.volume - direction * volumeIncrement, 0, 100);
      try {
        // TODO use a state variable to buffer the volume change
        if (newVolume !== state.volume) {
          changeVolume(newVolume);
        }
      } catch (error) {
        throw new Error(`Update volume error: ${error}`);
      }
    },
    [changeVolume, state.volume, volumeIncrement]
  );

  useEffect(() => {
    document.getElementById('visible-ui').addEventListener('mousewheel', onMouseWheel);
    return () => {
      document.getElementById('visible-ui').removeEventListener('mousewheel', onMouseWheel);
    };
  }, [onMouseWheel]);

  useEffect(() => {
    const listeningToIntervalId = setInterval(handlePlaybackChanged, ONE_SECOND);
    const refreshTrackLikedIntervalId = setInterval(refreshTrackLiked, 2 * ONE_SECOND);
    const keepAliveIntervalId = setInterval(keepAlive, ONE_MINUTE);

    return () => {
      if (listeningToIntervalId) {
        clearInterval(listeningToIntervalId);
      }

      if (refreshTrackLikedIntervalId) {
        clearInterval(refreshTrackLikedIntervalId);
      }

      if (keepAliveIntervalId) {
        clearInterval(keepAliveIntervalId);
      }
    };
  }, [keepAlive, handlePlaybackChanged, refreshTrackLiked]);

  const coverUrl = useMemo(() => state.cover, [state.cover]);

  return (
    <div
      className="transparent"
      onMouseEnter={() => !isAlwaysShowTrackInfo && setShouldShowTrackInfo(true)}
      onMouseLeave={() => !isAlwaysShowTrackInfo && setShouldShowTrackInfo(false)}>
      <Menu
        onVisualizationChange={onVisualizationChange}
        onVisualizationCycle={onVisualizationCycle}
        visualizationType={visualizationType}
      />
      {state.id ? (
        <>
          {shouldShowTrackInfo && (
            <WindowPortal name={WindowName.TrackInfo}>
              <TrackInfo track={songTitle} artist={artist} isOnLeft={isOnLeft} message={errorToDisplay || message} />
            </WindowPortal>
          )}
          <CoverContent
            className="full"
            isPlaying={state.isPlaying}
            style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}
          />
          {visualizationType === VisualizationType.Small && (
            <Visualizer
              key={visualizationId}
              visualizationId={visualizationId}
              visualizerOpacity={visualizerOpacity}
              size={{ height: size, width: size }}
            />
          )}
          <Bars barThickness={barThickness} barColor={barColor} alwaysShowProgress={isAlwaysShowSongProgress} />
          <Controls
            skipSongDelay={skipSongDelay}
            onTrackLiked={handleTrackLiked}
            onPlaybackChanged={handlePlaybackChanged}
            onError={setErrorToDisplay}
          />
        </>
      ) : (
        <Waiting />
      )}
    </div>
  );
};
