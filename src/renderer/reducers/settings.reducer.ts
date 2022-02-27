import { AuthData } from '../../main/auth';
import { Settings, VisualizationType } from '../../models/settings';

export enum SettingsActionType {
  SetDebug = 'setDebug',
  SetUseHardwareAcceleration = 'setUseHardwareAcceleration',
  SetVisualization = 'setVisualization',
  SetVisualizationType = 'setVisualizationType',
  SetAlwaysOnTop = 'setAlwaysOnTop',
  SetShowInTaskbar = 'setShowInTaskBar',
  SetWindowPos = 'setWindowPos',
  SetAlwaysShowTrackInfo = 'setAlwaysShowTrackInfo',
  SetAlwaysShowProgress = 'setAlwaysShowProgress',
  SetBarThickness = 'setBarThickness',
  SetIsOnLeft = 'setIsOnLeft',
  SetSize = 'setSize',
  SetVolumeIncrement = 'setVolumeIncrement',
  SetTokens = 'setTokens',
  ResetTokens = 'resetTokens',
  UpdateSettings = 'updateSettings',
}

export type SettingsAction =
  | {
      type: SettingsActionType.SetDebug;
      payload: boolean;
    }
  | {
      type: SettingsActionType.SetUseHardwareAcceleration;
      payload: boolean;
    }
  | {
      type: SettingsActionType.SetVisualization;
      payload: number;
    }
  | {
      type: SettingsActionType.SetVisualizationType;
      payload: VisualizationType;
    }
  | {
      type: SettingsActionType.SetAlwaysOnTop;
      payload: boolean;
    }
  | {
      type: SettingsActionType.SetShowInTaskbar;
      payload: boolean;
    }
  | {
      type: SettingsActionType.SetWindowPos;
      payload: { x: number; y: number };
    }
  | {
      type: SettingsActionType.SetAlwaysShowTrackInfo;
      payload: boolean;
    }
  | {
      type: SettingsActionType.SetAlwaysShowProgress;
      payload: boolean;
    }
  | {
      type: SettingsActionType.SetBarThickness;
      payload: number;
    }
  | {
      type: SettingsActionType.SetIsOnLeft;
      payload: boolean;
    }
  | {
      type: SettingsActionType.SetSize;
      payload: number;
    }
  | {
      type: SettingsActionType.SetVolumeIncrement;
      payload: number;
    }
  | {
      type: SettingsActionType.SetTokens;
      payload: AuthData;
    }
  | {
      type: SettingsActionType.ResetTokens;
    }
  | {
      type: SettingsActionType.UpdateSettings;
      payload: Settings;
    };

export const useSettingsReducer = (state: Settings, action: SettingsAction): Settings => {
  switch (action.type) {
    case SettingsActionType.SetDebug: {
      return {
        ...state,
        isDebug: action.payload,
      };
    }

    case SettingsActionType.SetUseHardwareAcceleration: {
      return {
        ...state,
        isUsingHardwareAcceleration: action.payload,
      };
    }

    case SettingsActionType.SetVisualization: {
      return {
        ...state,
        visualizationId: action.payload,
      };
    }

    case SettingsActionType.SetVisualizationType: {
      return {
        ...state,
        visualizationType: action.payload,
      };
    }

    case SettingsActionType.SetAlwaysOnTop: {
      return {
        ...state,
        isAlwaysOnTop: action.payload,
      };
    }

    case SettingsActionType.SetShowInTaskbar: {
      return {
        ...state,
        isVisibleInTaskbar: action.payload,
      };
    }

    case SettingsActionType.SetWindowPos: {
      return {
        ...state,
        x: action.payload.x,
        y: action.payload.y,
      };
    }

    case SettingsActionType.SetAlwaysShowTrackInfo: {
      return {
        ...state,
        isAlwaysShowTrackInfo: action.payload,
      };
    }

    case SettingsActionType.SetAlwaysShowProgress: {
      return {
        ...state,
        isAlwaysShowSongProgress: action.payload,
      };
    }

    case SettingsActionType.SetBarThickness: {
      return {
        ...state,
        barThickness: action.payload,
      };
    }

    case SettingsActionType.SetSize: {
      return {
        ...state,
        size: action.payload,
      };
    }

    case SettingsActionType.SetIsOnLeft: {
      return {
        ...state,
        isOnLeft: action.payload,
      };
    }

    case SettingsActionType.SetVolumeIncrement: {
      return {
        ...state,
        volumeIncrement: action.payload,
      };
    }

    case SettingsActionType.SetTokens: {
      return {
        ...state,
        accessToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
      };
    }

    case SettingsActionType.ResetTokens: {
      return {
        ...state,
        accessToken: '',
        refreshToken: '',
      };
    }

    case SettingsActionType.UpdateSettings: {
      return {
        ...state,
        ...action.payload,
      };
    }

    default: {
      return state;
    }
  }
};
