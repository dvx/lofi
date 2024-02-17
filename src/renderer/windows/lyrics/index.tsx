/* eslint-disable no-console */
import React, { FunctionComponent, useMemo } from 'react';
import styled from 'styled-components';

import { DEFAULT_SETTINGS } from '../../../models/settings';
import { Line, LyricsData } from '../../api/lyrics-api';
import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';
import { useSettings } from '../../contexts/settings.context';

const LyricsWrapper = styled.div`
  position: fixed;
  transition: 0.1s;
  padding: 0.5em;
  max-width: 30ch;

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

const FocusedText = styled.div`
  margin-top: 5px;
  margin-bottom: 5px;
`;

const FocusedTextWrapper = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

function breakTextIntoLines(text: string, maxLength: number): string[] {
  const isCJK = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
  const segments = isCJK ? Array.from(text) : text.split(' ');
  const lines: string[] = [''];
  let currentLine = 0;

  for (let i = 0; i < segments.length; i += 1) {
    if ((lines[currentLine] + segments[i]).length > (isCJK ? 0.5 * maxLength : maxLength)) {
      currentLine += 1;
      lines[currentLine] = '';
    }

    lines[currentLine] += isCJK ? segments[i] : `${segments[i]} `;
  }

  return lines;
}

interface LyricTextProps {
  lyrics?: LyricsData;
  loggedIn?: boolean;
  isTokenEmpty?: boolean;
  maxLength?: number;
  nextLyricsColor?: string;
  isLyricsBlur?: boolean;
}

function generateRandomLightColor(opacity: number): string {
  const h = Math.floor(Math.random() * 360);
  const s = 69;
  const l = 69;

  return `hsl(${h}, ${s}%, ${l}%, ${opacity / 255})`;
}

const LyricsText: FunctionComponent<LyricTextProps> = ({
  lyrics,
  loggedIn,
  isTokenEmpty,
  maxLength,
  nextLyricsColor,
  isLyricsBlur,
}) => {
  const { state } = useCurrentlyPlaying();
  if (!loggedIn) {
    return (
      <div>
        {isTokenEmpty && <FocusedText>Add sp_dc token</FocusedText>}
        {!isTokenEmpty && <FocusedText>Not a valid sp_dc token</FocusedText>}
      </div>
    );
  }
  if (lyrics === null || lyrics === undefined || lyrics.lyrics === undefined || lyrics.lyrics.lines === undefined) {
    return (
      <div>
        <FocusedText>No Lyrics found</FocusedText>
      </div>
    );
  }
  let closestLineIndex = -1;
  lyrics.lyrics.lines.forEach((line: Line, index: number) => {
    if (Number(line.startTimeMs) < state.progress) {
      closestLineIndex = index;
    }
  });

  const prevLyric = closestLineIndex > 0 ? lyrics.lyrics.lines[closestLineIndex - 1] : null;
  let lyric = lyrics.lyrics.lines[closestLineIndex];
  const nextLyric =
    closestLineIndex < lyrics.lyrics.lines.length - 1 ? lyrics.lyrics.lines[closestLineIndex + 1] : null;

  if (lyric === undefined) {
    nextLyric.words = lyrics.lyrics.lines[0].words;
    lyric = { ...nextLyric };
    lyric.words = '';
  }

  const blurStyle = isLyricsBlur ? `blur(${0.55}px)` : 'none';

  return (
    <div>
      {prevLyric &&
        breakTextIntoLines(prevLyric.words, maxLength).map((line) => (
          <FocusedText style={{ filter: blurStyle }} key={line}>
            {line}
          </FocusedText>
        ))}
      <FocusedTextWrapper>
        {breakTextIntoLines(lyric.words, maxLength).map((line) => (
          <FocusedText key={line}>{line}</FocusedText>
        ))}
      </FocusedTextWrapper>
      {nextLyric &&
        breakTextIntoLines(nextLyric.words, maxLength).map((line) => (
          <FocusedText style={{ color: nextLyricsColor, filter: blurStyle }} key={line}>
            {line}
          </FocusedText>
        ))}
    </div>
  );
};

interface LyricsProps {
  lyrics?: LyricsData;
  loggedIn?: boolean;
  isOnLeft?: boolean;
}

export const Lyrics: FunctionComponent<LyricsProps> = ({ lyrics, loggedIn, isOnLeft }) => {
  const { state } = useSettings();
  const backgroundColor = useMemo(() => {
    const normalizedOpacity = Math.floor((state.lyricsBackgroundOpacity / 100) * 255);
    const isLyricsRandomBackground = state.isLyricsRandomBackground && DEFAULT_SETTINGS.isLyricsRandomBackground;
    const color = isLyricsRandomBackground
      ? generateRandomLightColor(normalizedOpacity)
      : state.lyricsBackgroundColor || DEFAULT_SETTINGS.lyricsBackgroundColor;

    return isLyricsRandomBackground ? color : `${color}${normalizedOpacity.toString(16)}`;
  }, [state]);
  const maxLength = state.lyricMaxLength || DEFAULT_SETTINGS.lyricMaxLength;
  const nextLyricsColor = state.nextLyricsColor || DEFAULT_SETTINGS.nextLyricsColor;
  const isLyricsBlur = state.isLyricsBlur && DEFAULT_SETTINGS.isLyricsBlur;
  const lyricsCornerRadius = state.lyricsCornerRadius || DEFAULT_SETTINGS.lyricsCornerRadius;

  return (
    <LyricsWrapper
      style={{
        right: !isOnLeft && 0,
        left: isOnLeft && 0,
        fontFamily: state.lyricsFont || DEFAULT_SETTINGS.lyricsFont,
        fontSize: state.lyricsFontSize || DEFAULT_SETTINGS.lyricsFontSize,
        color: state.lyricsColor || DEFAULT_SETTINGS.lyricsColor,
        backgroundColor,
        maxWidth: `${maxLength}ch`,
        borderRadius: lyricsCornerRadius,
      }}>
      <LyricsText
        lyrics={lyrics}
        loggedIn={loggedIn}
        isTokenEmpty={state.SPDCToken === ''}
        maxLength={maxLength}
        nextLyricsColor={nextLyricsColor}
        isLyricsBlur={isLyricsBlur}
      />
    </LyricsWrapper>
  );
};
