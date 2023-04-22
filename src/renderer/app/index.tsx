/* eslint-disable no-console */
import { Display, ipcRenderer } from 'electron';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { IpcMessage, WindowName } from '../../constants';
import { AuthData, refreshAccessToken, setTokenRetrievedCallback } from '../../main/auth';
import { DEFAULT_SETTINGS, Settings, VisualizationType } from '../../models/settings';
import { visualizations } from '../../visualizations';
import { AccountType, SpotifyApiInstance } from '../api/spotify-api';
import { WindowPortal } from '../components/window-portal';
import { useCurrentlyPlaying } from '../contexts/currently-playing.context';
import { useSettings } from '../contexts/settings.context';
import { DisplayData } from '../models';
import { CurrentlyPlayingActions } from '../reducers/currently-playing.reducer';
import { SettingsActionType } from '../reducers/settings.reducer';
import { About } from '../windows/about';
import { FullscreenVisualizer } from '../windows/fullscreen-visualizer';
import { SettingsWindow } from '../windows/settings';
import { Cover } from './cover';
import { Welcome } from './welcome';

const LEFT_MOUSE_BUTTON = 0;

const VisibleUi = styled.div`
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%);
  position: relative;

  &:hover {
    .cover {
      filter: blur(0.125rem);
      transform: scale(1.1);
    }

    .bar,
    .controls,
    .menu {
      transition: 0.1s;
      opacity: 1;
    }

    .welcome-content {
      filter: blur(0.5rem);
    }

    .menu .logo-typo {
      background-position: left center;
      color: #ef9671;
      transition: background-position 2000ms ease-out;
    }
  }

  .top {
    top: 0;
  }

  .right {
    right: 0;
  }

  .bottom {
    bottom: 0;
  }

  .left {
    left: 0;
  }
`;

export const App: FunctionComponent = () => {
  const [shouldShowAbout, setShouldShowAbout] = useState(false);
  const [shouldShowSettings, setShouldShowSettings] = useState(false);
  const [shouldShowFullscreenViz, setShouldShowFullscreenViz] = useState(false);
  const [message, setMessage] = useState('');
  const [displays, setDisplays] = useState<DisplayData[]>([]);

  const { state, dispatch } = useSettings();
  const { dispatch: currentlyPlayingDispatch } = useCurrentlyPlaying();
  const { accessToken, refreshToken, visualizationId, visualizationType } = state || DEFAULT_SETTINGS;

  const updateTokens = useCallback(
    async (data: AuthData) => {
      if (!data || !data.access_token || !data.refresh_token) {
        dispatch({ type: SettingsActionType.ResetTokens });
      } else {
        dispatch({ type: SettingsActionType.SetTokens, payload: data });
      }

      try {
        const userProfile = await SpotifyApiInstance.updateTokens(data);
        if (userProfile?.accountType !== AccountType.Premium) {
          const playbackDisabledMessage = 'Account is not premium, playback controls disabled.';
          console.warn(playbackDisabledMessage);
          setMessage(playbackDisabledMessage);
        }

        currentlyPlayingDispatch({
          type: CurrentlyPlayingActions.SetUserProfile,
          payload: userProfile,
        });

        console.log(`User '${userProfile.name}' successfully authenticated.`);
      } catch (error) {
        console.error(error);
      }
    },
    [currentlyPlayingDispatch, dispatch]
  );

  useEffect(() => {
    setTokenRetrievedCallback(updateTokens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (visualizationType === VisualizationType.Big) {
      setShouldShowFullscreenViz(true);
    }
  }, [shouldShowFullscreenViz, visualizationType]);

  const handleAuth = useCallback(async () => {
    try {
      if (refreshToken) {
        await refreshAccessToken(refreshToken);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      await updateTokens(null);
    }
  }, [refreshToken, updateTokens]);

  useEffect(() => {
    ipcRenderer.on(IpcMessage.ShowAbout, () => setShouldShowAbout(true));
    ipcRenderer.on(IpcMessage.ShowFullscreenVizualizer, () => setShouldShowFullscreenViz(true));
    ipcRenderer.on(IpcMessage.ShowSettings, () => setShouldShowSettings(true));

    ipcRenderer.on(IpcMessage.WindowReady, async (_, { displays: displayData }: { displays: Display[] }) => {
      let animationId = 0;
      let mouseX = 0;
      let mouseY = 0;

      setDisplays(() => displayData.map(({ label, bounds: { height, width } }) => ({ label, height, width })));

      const moveWindow = (): void => {
        ipcRenderer.send(IpcMessage.WindowMoving, { mouseX, mouseY });
        animationId = requestAnimationFrame(moveWindow);
      };

      const onMouseUp = ({ button }: { button: number }): void => {
        if (button !== LEFT_MOUSE_BUTTON) {
          return;
        }

        ipcRenderer.send(IpcMessage.WindowMoved);
        document.removeEventListener('mouseup', onMouseUp);
        cancelAnimationFrame(animationId);
      };

      const onMouseDown = (event: MouseEvent): void => {
        const { button, clientX, clientY, target } = event;
        const targetElement = target as unknown as Element;

        const isDraggable = targetElement.classList?.contains('draggable');
        if (button !== LEFT_MOUSE_BUTTON || !isDraggable) {
          return;
        }

        cancelAnimationFrame(animationId);
        mouseX = clientX;
        mouseY = clientY;
        document.addEventListener('mouseup', onMouseUp);

        requestAnimationFrame(moveWindow);
      };

      document.getElementById('app-body').addEventListener('mousedown', onMouseDown);
    });

    ipcRenderer.on(IpcMessage.WindowMoved, (_: Event, data: { x: number; y: number }) => {
      dispatch({
        type: SettingsActionType.SetWindowPos,
        payload: data,
      });
    });

    ipcRenderer.on(IpcMessage.WindowResized, (_: Event, size: number) => {
      dispatch({
        type: SettingsActionType.SetSize,
        payload: size,
      });
    });

    ipcRenderer.on(IpcMessage.SideChanged, (_: Event, { isOnLeft }: { isOnLeft: boolean }) => {
      dispatch({
        type: SettingsActionType.SetIsOnLeft,
        payload: isOnLeft,
      });
    });
  }, [dispatch]);

  useEffect(() => {
    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSettingsSave = useCallback(
    (data?: Settings) => {
      dispatch({
        type: SettingsActionType.UpdateSettings,
        payload: data,
      });
      ipcRenderer.send(IpcMessage.SettingsChanged, data);
    },
    [dispatch]
  );

  const handleVisualizationChange = useCallback(() => {
    switch (visualizationType) {
      case VisualizationType.None: {
        dispatch({
          type: SettingsActionType.SetVisualizationType,
          payload: VisualizationType.Small,
        });
        break;
      }

      case VisualizationType.Small: {
        ipcRenderer.send(IpcMessage.ShowFullscreenVizualizer);

        dispatch({
          type: SettingsActionType.SetVisualizationType,
          payload: VisualizationType.Big,
        });
        break;
      }

      case VisualizationType.Big:
      default: {
        setShouldShowFullscreenViz(false);
        dispatch({
          type: SettingsActionType.SetVisualizationType,
          payload: VisualizationType.None,
        });
        break;
      }
    }
  }, [dispatch, visualizationType]);

  const handleVisualizationCycle = useCallback(
    (isPrevious: boolean) => {
      let id: number;
      if (isPrevious) {
        id = visualizationId === 0 ? visualizations.length - 1 : visualizationId - 1;
      } else {
        id = visualizationId === visualizations.length - 1 ? 0 : visualizationId + 1;
      }
      dispatch({
        type: SettingsActionType.SetVisualization,
        payload: id,
      });
    },
    [dispatch, visualizationId]
  );

  return (
    <VisibleUi id="visible-ui" className="click-on">
      {shouldShowSettings && (
        <WindowPortal onUnload={() => setShouldShowSettings(false)} name={WindowName.Settings}>
          <SettingsWindow
            initialValues={state}
            displays={displays}
            onSave={handleSettingsSave}
            onClose={() => setShouldShowSettings(false)}
            onLogout={() => updateTokens(null)}
          />
        </WindowPortal>
      )}

      {shouldShowAbout && (
        <WindowPortal onUnload={() => setShouldShowAbout(false)} name={WindowName.About}>
          <About onClose={() => setShouldShowAbout(false)} />
        </WindowPortal>
      )}

      {shouldShowFullscreenViz && (
        <WindowPortal
          onUnload={() => setShouldShowFullscreenViz(false)}
          name={WindowName.FullscreenViz}
          features={{ isFullscreen: true }}>
          <FullscreenVisualizer onClose={() => setShouldShowFullscreenViz(false)} />
        </WindowPortal>
      )}

      {accessToken ? (
        <Cover
          settings={state}
          message={message}
          onVisualizationChange={handleVisualizationChange}
          onVisualizationCycle={handleVisualizationCycle}
        />
      ) : (
        <Welcome />
      )}
    </VisibleUi>
  );
};
