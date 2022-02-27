import { ipcRenderer } from 'electron';
import React, { FunctionComponent, useCallback } from 'react';

import { ApplicationUrl, IpcMessage } from '../../../constants';

interface Props {
  url: ApplicationUrl;
  icon: string;
}

export const AboutLink: FunctionComponent<Props> = ({ url, icon }) => {
  const openLink = useCallback((link: ApplicationUrl) => {
    ipcRenderer.send(IpcMessage.OpenLink, link);
  }, []);
  return (
    <button type="button" onClick={() => openLink(url)} className="unstyled-button">
      <i className={icon} aria-hidden="true" />
    </button>
  );
};
