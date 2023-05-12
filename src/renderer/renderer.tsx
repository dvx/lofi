import './style.css';

import { MantineProvider } from '@mantine/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './app';
import { CurrentlyPlayingProvider } from './contexts/currently-playing.context';
import { SettingsProvider } from './contexts/settings.context';

ReactDOM.render(
  <SettingsProvider>
    <CurrentlyPlayingProvider>
      <MantineProvider withNormalizeCSS>
        <App />
      </MantineProvider>
    </CurrentlyPlayingProvider>
  </SettingsProvider>,
  document.getElementById('app')
);
