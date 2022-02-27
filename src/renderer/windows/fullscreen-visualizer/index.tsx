import { ipcRenderer } from 'electron';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { IpcMessage } from '../../../constants';
import { Visualizer } from '../../app/cover/visualizer';
import { useSettings } from '../../contexts/settings.context';
import { Size } from '../../models';

interface Props {
  onClose?: () => void;
}

export const FullscreenVisualizer: FunctionComponent<Props> = () => {
  const {
    state: { visualizationId },
  } = useSettings();
  const [size, setSize] = useState<Size>();

  useEffect(() => {
    ipcRenderer.send(IpcMessage.ScreenSize);

    ipcRenderer.on(IpcMessage.ScreenSize, (_: Event, displaySize: Size) => {
      setSize(() => displaySize);
    });
  }, []);

  return <Visualizer key={visualizationId} visualizationId={visualizationId} visualizerOpacity={100} size={size} />;
};
