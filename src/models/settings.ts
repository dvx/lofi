import { version } from '../../version.generated';

export enum VisualizationType {
  None,
  Small,
  Big,
}

export interface Settings {
  version: string;
  isDebug: boolean;
  isUsingHardwareAcceleration: boolean;
  accessToken: string;
  refreshToken: string;
  visualizationId: number;
  visualizationType: VisualizationType;
  visualizationScreenId: number;
  visualizerOpacity: number;
  isAlwaysOnTop: boolean;
  isVisibleInTaskbar: boolean;
  x: number;
  y: number;
  isOnLeft: boolean;
  isAlwaysShowTrackInfo: boolean;
  isAlwaysShowSongProgress: boolean;
  barThickness: number;
  barColor: string;
  size: number;
  volumeIncrement: number;
  skipSongDelay: number;
  font: string;
  trackInfoFontSize: number;
  trackInfoColor: string;
  trackInfoBackgroundColor: string;
  trackInfoBackgroundOpacity: number;
  showFreemiumWarning: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  version,
  x: -1,
  y: -1,
  isOnLeft: true,
  size: 150,
  isDebug: false,
  isUsingHardwareAcceleration: true,
  accessToken: '',
  refreshToken: '',
  visualizationId: 0,
  visualizationType: VisualizationType.None,
  visualizationScreenId: 0,
  visualizerOpacity: 100,
  isAlwaysOnTop: true,
  isVisibleInTaskbar: true,
  isAlwaysShowTrackInfo: false,
  isAlwaysShowSongProgress: false,
  barThickness: 2,
  barColor: '#74C999',
  volumeIncrement: 5,
  skipSongDelay: 15,
  font: 'Inter UI',
  trackInfoFontSize: 14,
  trackInfoColor: '#FFFFFF',
  trackInfoBackgroundColor: '#000000',
  trackInfoBackgroundOpacity: 50,
  showFreemiumWarning: true,
};
