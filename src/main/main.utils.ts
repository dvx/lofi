import { BrowserWindow, BrowserWindowConstructorOptions, Display, Rectangle, Screen } from 'electron';
import { z } from 'zod';

import {
  IpcMessage,
  LYRICS_GAP,
  MAX_BAR_THICKNESS,
  MAX_SIDE_LENGTH,
  MAX_SKIP_SONG_DELAY,
  MIN_SIDE_LENGTH,
  MIN_SKIP_SONG_DELAY,
  TRACK_INFO_GAP,
  WindowTitle,
} from '../constants';
import { VisualizationType } from '../models/settings';
import { visualizations } from '../visualizations';

export const getCommonWindowOptions = (): BrowserWindowConstructorOptions => ({
  frame: false,
  titleBarOverlay: false,
  titleBarStyle: 'hidden',
  roundedCorners: false,
  minimizable: false,
  maximizable: false,
  resizable: true,
  alwaysOnTop: true,
  fullscreenable: false,
  center: true,
});

export const getSettingsWindowOptions = (): BrowserWindowConstructorOptions => ({
  ...getCommonWindowOptions(),
  height: 540,
  minHeight: 540,
  width: 420,
  minWidth: 420,
  title: WindowTitle.Settings,
});

export const getAboutWindowOptions = (): BrowserWindowConstructorOptions => ({
  ...getCommonWindowOptions(),
  height: 540,
  width: 400,
  title: WindowTitle.About,
});

export const getFullscreenVisualizationWindowOptions = (displayBounds: Rectangle): BrowserWindowConstructorOptions => ({
  ...getCommonWindowOptions(),
  height: displayBounds.height,
  width: displayBounds.width,
  x: displayBounds.x,
  y: displayBounds.y,
  fullscreen: true,
  skipTaskbar: true,
  title: WindowTitle.FullscreenViz,
});

export const getTrackInfoWindowOptions = (
  mainWindow: BrowserWindow,
  isAlwaysOnTop: boolean
): BrowserWindowConstructorOptions => {
  const { x, y, width } = mainWindow.getBounds();
  return {
    ...getCommonWindowOptions(),
    parent: mainWindow,
    skipTaskbar: true,
    alwaysOnTop: isAlwaysOnTop,
    height: 200,
    width: 400,
    transparent: true,
    center: false,
    x: x + width + TRACK_INFO_GAP.X,
    y: y + TRACK_INFO_GAP.Y,
    title: WindowTitle.TrackInfo,
  };
};

export const getLyricsWindowOptions = (
  mainWindow: BrowserWindow,
  isAlwaysOnTop: boolean
): BrowserWindowConstructorOptions => {
  const { x, y, width, height } = mainWindow.getBounds();
  return {
    ...getCommonWindowOptions(),
    parent: mainWindow,
    skipTaskbar: true,
    alwaysOnTop: isAlwaysOnTop,
    height: 1000,
    width: 1000,
    transparent: true,
    center: false,
    x: x + LYRICS_GAP.X - width,
    y: y + height + LYRICS_GAP.Y,
    title: WindowTitle.Lyrics,
  };
};

export const showDevTool = (window: BrowserWindow, isShow: boolean): void => {
  if (isShow) {
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    window.webContents.closeDevTools();
  }
};

export const checkIfAppIsOnLeftSide = (display: Display, x: number, appWidth: number): boolean =>
  display.bounds.x + display.bounds.width / 2 > x + appWidth / 2;

export const setAlwaysOnTop = ({
  window,
  isAlwaysOnTop,
  level = 'screen-saver',
}: {
  window: BrowserWindow;
  isAlwaysOnTop: boolean;
  level?:
    | 'normal'
    | 'floating'
    | 'torn-off-menu'
    | 'modal-panel'
    | 'main-menu'
    | 'status'
    | 'pop-up-menu'
    | 'screen-saver';
  relativeLevel?: number;
}): void => window && window.setAlwaysOnTop(isAlwaysOnTop, level);

export const findWindow = (name: string): BrowserWindow | undefined =>
  BrowserWindow.getAllWindows().find(({ title }) => title === name);

export const moveTrackInfo = (mainWindow: BrowserWindow, screen: Screen): void => {
  const { x, y, width } = mainWindow.getBounds();
  const trackInfoWindow = findWindow(WindowTitle.TrackInfo);
  if (!trackInfoWindow) {
    return;
  }

  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  const isOnLeft = checkIfAppIsOnLeftSide(currentDisplay, x, width);

  const originalBounds = trackInfoWindow.getBounds();
  const newBounds = {
    ...originalBounds,
    x: isOnLeft ? x + width + TRACK_INFO_GAP.X : x - originalBounds.width - TRACK_INFO_GAP.X,
    y: y + TRACK_INFO_GAP.Y,
  };

  trackInfoWindow.setBounds(newBounds);
  mainWindow.webContents.send(IpcMessage.SideChanged, { isOnLeft });
};

export const moveLyric = (mainWindow: BrowserWindow, screen: Screen): void => {
  const { x, y, width, height } = mainWindow.getBounds();
  const LyricsWindow = findWindow(WindowTitle.Lyrics);
  if (!LyricsWindow) {
    return;
  }

  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  const isOnLeft = checkIfAppIsOnLeftSide(currentDisplay, x, width);

  const originalBounds = LyricsWindow.getBounds();
  const newBounds = {
    ...originalBounds,
    x: isOnLeft ? x + LYRICS_GAP.X : x - originalBounds.width - LYRICS_GAP.X + width,
    y: y + height + LYRICS_GAP.Y,
  };

  LyricsWindow.setBounds(newBounds);
  mainWindow.webContents.send(IpcMessage.SideChanged, { isOnLeft });
};

export const settingsSchema = z.object({
  x: z.number(),
  y: z.number(),
  visualizationId: z
    .number()
    .min(0)
    .max(visualizations.length - 1)
    .optional(),
  visualizationType: z.nativeEnum(VisualizationType).optional(),
  visualizerOpacity: z.number().min(1).max(100).optional(),
  barThickness: z.number().min(1).max(MAX_BAR_THICKNESS).optional(),
  size: z.number().min(MIN_SIDE_LENGTH).max(MAX_SIDE_LENGTH),
  volumeIncrement: z.number().min(1).max(100).optional(),
  skipSongDelay: z.number().min(MIN_SKIP_SONG_DELAY).max(MAX_SKIP_SONG_DELAY).optional(),
});

export const getFullscreenVizBounds = (mainWindowBounds: Rectangle, screen: Screen, screenId: number): Rectangle => {
  const displays = screen.getAllDisplays();
  const currentDisplay = screen.getDisplayMatching(mainWindowBounds);
  const fullscreenVizBounds = screenId < displays.length ? displays[screenId].bounds : currentDisplay.bounds;
  return fullscreenVizBounds;
};
