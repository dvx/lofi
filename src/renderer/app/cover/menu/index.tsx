import { ipcRenderer } from 'electron';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { IpcMessage, WINDOWS } from '../../../../constants';
import { VisualizationType } from '../../../../models/settings';
import { CloseButton } from '../../../components';

const MenuList = styled.ul`
  display: flex;
  z-index: 3;
  list-style-type: none;
  margin: 0;
  padding: 4px;
  overflow: hidden;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.25s ease-in-out;
  -moz-transition: opacity 0.25s ease-in-out;
  -webkit-transition: opacity 0.25s ease-in-out;
  position: absolute;
  left: 0;
  width: calc(100% - 8px);

  .bottom {
    bottom: 0;
  }

  .top {
    top: 0;
  }

  li {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.25rem;

    &.pull-right {
      display: flex;
      flex-direction: row-reverse;
    }

    button {
      color: white;
      text-align: center;
      text-decoration: none;
      text-shadow: 1px 1px 0px black;

      &.settings:hover {
        color: #979eff;
      }

      &.settings:active {
        color: #50569e;
      }

      &.vis-change {
        margin: 0 0.25rem;
      }

      &.vis:hover {
        color: #61eb9a;
      }

      &.vis:active {
        color: #3d9963;
      }

      &.help:hover {
        color: #fadfa4;
      }

      &.help:active {
        color: #b47f2e;
      }
    }

    .logo-typo {
      background-image: linear-gradient(90deg, white 25%, #f871fd 35%, #9771ef, #7e6a99 65%, white 85%);
      background-position: right center;
      background-size: 600% auto;
      -webkit-background-clip: text;
      background-clip: text;
      color: white;
      margin-left: 0.25rem;
      -webkit-text-fill-color: transparent;
      transition: color 200ms linear;
      text-shadow: 0px 0px 16px #0000003d;
    }
  }
`;

interface Props {
  isWelcome?: boolean;
  visualizationType?: VisualizationType;
  onVisualizationChange?: () => void;
  onVisualizationCycle?: (isPrevious: boolean) => void;
}

const Menu: FunctionComponent<Props> = ({
  isWelcome = false,
  visualizationType = VisualizationType.None,
  onVisualizationChange = noop,
  onVisualizationCycle = noop,
}) => {
  const visIcon = useMemo((): string => {
    switch (visualizationType) {
      case VisualizationType.Small:
        return 'fa-expand-arrows-alt';

      case VisualizationType.Big:
        return 'fa-compress-arrows-alt';

      case VisualizationType.None:
      default:
        return 'fa-expand';
    }
  }, [visualizationType]);

  const handleCloseClick = useCallback(() => {
    ipcRenderer.send(IpcMessage.CloseApp);
  }, []);

  const handleSettingsClick = useCallback(() => {
    ipcRenderer.send(IpcMessage.ShowSettings);
  }, []);

  const handleAboutClick = useCallback(() => {
    ipcRenderer.send(IpcMessage.ShowAbout);
  }, []);

  return (
    <>
      <MenuList className="menu top draggable">
        <li className="draggable">
          <button type="button" onClick={handleSettingsClick} className="unstyled-button settings">
            <i className="fa fa-cog" />
          </button>
          <div className="logo-typo draggable">
            <span className="logo-typo draggable" style={{ fontWeight: 'bold' }}>
              lo
            </span>
            fi
          </div>
        </li>
        <li className="pull-right draggable">
          <CloseButton onClose={handleCloseClick} />
        </li>
      </MenuList>
      <MenuList className="menu bottom draggable">
        {!isWelcome && WINDOWS && (
          <li className="draggable">
            {visualizationType !== VisualizationType.None && (
              <button type="button" onClick={() => onVisualizationCycle(true)} className="unstyled-button vis">
                <i className="fa fa-caret-left" />
              </button>
            )}
            <button type="button" onClick={onVisualizationChange} className="unstyled-button vis vis-change">
              <i className={`fa ${visIcon}`} />
            </button>
            {visualizationType !== VisualizationType.None && (
              <button type="button" onClick={() => onVisualizationCycle(false)} className="unstyled-button vis">
                <i className="fa fa-caret-right" />
              </button>
            )}
          </li>
        )}
        <li className="pull-right draggable">
          <button type="button" onClick={handleAboutClick} className="unstyled-button help">
            <i className="fa-solid fa-circle-question" />
          </button>
        </li>
      </MenuList>
    </>
  );
};

export default Menu;
