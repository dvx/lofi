import { AuthData } from '../../main/auth';
import { Settings, VisualizationType } from '../../models/settings';

export enum SettingsActionType {
  SetVisualization = 'setVisualization',
  SetVisualizationType = 'setVisualizationType',
  SetWindowPos = 'setWindowPos',
  SetIsOnLeft = 'setIsOnLeft',
  SetSize = 'setSize',
  SetTokens = 'setTokens',
  ResetTokens = 'resetTokens',
  UpdateSettings = 'updateSettings',
}

export type SettingsAction =
  | {
      type: SettingsActionType.SetVisualization;
      payload: number;
    }
  | {
      type: SettingsActionType.SetVisualizationType;
      payload: VisualizationType;
    }
  | {
      type: SettingsActionType.SetWindowPos;
      payload: { x: number; y: number };
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

    case SettingsActionType.SetWindowPos: {
      return {
        ...state,
        x: action.payload.x,
        y: action.payload.y,
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
