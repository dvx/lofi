import { platform } from 'os';

export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export const WINDOWS = platform() === 'win32';
export const LINUX = platform() === 'linux';
export const MACOS = platform() === 'darwin';

export const MIN_SIDE_LENGTH = 115;
export const MAX_SIDE_LENGTH = 1440;
export const MAX_BAR_THICKNESS = 20;
export const MIN_FONT_SIZE = 6;
export const MAX_FONT_SIZE = 32;
export const TRACK_INFO_GAP = { X: 10, Y: 10 };

export const MIN_SKIP_SONG_DELAY = 5;
export const MAX_SKIP_SONG_DELAY = 60;

export enum WindowTitle {
  About = 'About Lofi',
  FullscreenViz = 'fullscreen-visualization',
  Settings = 'Lofi Settings',
  TrackInfo = 'track-info',
}

export enum WindowName {
  About = 'about',
  Auth = 'auth',
  FullscreenViz = 'fullscreen-visualization',
  Settings = 'settings',
  TrackInfo = 'track-info',
}

export enum IpcMessage {
  CloseApp = 'closeApp',
  OpenLink = 'openLink',
  ScreenSize = 'screenSize',
  SettingsChanged = 'settingsChanged',
  ShowAbout = 'showAbout',
  ShowFullscreenVizualizer = 'showFullscreenVizualizer',
  ShowSettings = 'showSettings',
  SideChanged = 'sideChanged',
  WindowMoved = 'windowMoved',
  WindowMoving = 'windowMoving',
  WindowReady = 'windowReady',
  WindowResized = 'windowResized',
}

export enum ApplicationUrl {
  Home = 'https://www.lofi.rocks/',
  Help = 'https://www.lofi.rocks/help',
  Discord = 'https://discord.gg/YuH9UJk',
  GitHub = 'https://github.com/dvx/lofi',
}
