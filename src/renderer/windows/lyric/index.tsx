/* eslint-disable no-console */
import React, { FunctionComponent, useMemo } from 'react';
import styled from 'styled-components';

import { DEFAULT_SETTINGS } from '../../../models/settings';
import { Line, LyricsData } from '../../api/lyrics-api';
import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';
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
    text-align: center;

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

interface LyricTextProps {
  lyrics?: LyricsData;
}

const LyricText: FunctionComponent<LyricTextProps> = ({ lyrics }) => {
  const { state } = useCurrentlyPlaying();
  if (lyrics === null || lyrics === undefined || lyrics.lyrics === undefined || lyrics.lyrics.lines === undefined) {
    return (
      <div>
        <Track>No Lyrics found</Track>
      </div>
    );
  }
  let closestLineIndex = -1;
  lyrics.lyrics.lines.forEach((line: Line, index: number) => {
    if (Number(line.startTimeMs) < state.progress) {
      closestLineIndex = index;
    }
  });

  const prevLine = closestLineIndex > 0 ? lyrics.lyrics.lines[closestLineIndex - 1] : null;
  let line = lyrics.lyrics.lines[closestLineIndex];
  const nextLine = closestLineIndex < lyrics.lyrics.lines.length - 1 ? lyrics.lyrics.lines[closestLineIndex + 1] : null;
  if (line === undefined) {
    line = nextLine;
    line.words = lyrics.lyrics.lines[0].words;
  }

  return (
    <div>
      {prevLine && <Artist>{prevLine.words}</Artist>}
      <Track>{line.words}</Track>
      {nextLine && <Artist>{nextLine.words}</Artist>}
    </div>
  );
};

interface TrackInfoProps {
  lyrics?: LyricsData;
  isOnLeft?: boolean;
}

export const Lyric: FunctionComponent<TrackInfoProps> = ({ lyrics, isOnLeft }) => {
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
      <LyricText lyrics={lyrics} />
    </TrackInfoWrapper>
  );
};
