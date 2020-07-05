import * as React from 'react';
import * as settings from 'electron-settings';
import { ipcRenderer, screen, remote } from 'electron'
import { startAuthServer, stopAuthServer } from '../../../main/server';
import Cover from './Cover';
import Settings from './Settings';
import Welcome from './Welcome';
import WindowPortal from '../util/WindowPortal'
import { ChangeEvent } from 'electron-settings';

import './style.scss'

enum SIDE {
  LEFT, RIGHT
}

class Lofi extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      access_token: settings.getSync('spotify.access_token'),
      refresh_token: settings.getSync('spotify.refresh_token'),
      showSettings: false,
      lofiSettings: settings.getSync('lofi'),
      window_side: (() => {
        if (((remote.getCurrentWindow().getBounds().x + remote.getCurrentWindow().getBounds().width) / 2) - remote.screen.getDisplayMatching(remote.getCurrentWindow().getBounds()).bounds.x < remote.screen.getDisplayMatching(remote.getCurrentWindow().getBounds()).bounds.width / 2) {
          return SIDE.LEFT
        }
        return SIDE.RIGHT
      })(),
      auth: false,
    }

    // Allow to open settings via IPC channel (e.g. triggered by a taskbar click)
    ipcRenderer.on('show-settings', () => {
      this.showSettingsWindow();
    })

    // Allow to open settings via IPC channel (e.g. triggered by a taskbar click)
    ipcRenderer.on('show-about', () => {
      alert(`Lofi v${settings.getSync('version')}
A mini Spotify player with WebGL visualizations.
https://www.lofi.rocks

Copyright (c) 2019-2020 David Titarenco

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`)
    })
  }

  reloadSettings() {
    this.setState({lofiSettings: settings.getSync('lofi')})
  }
  
  async verifyAccessToken(observer?: SettingsObserver) {
    console.log('Verifying access token...')
    if (observer) {
      observer.dispose();
    }
    let res = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer '+ this.state.access_token
      })
    });
    if (res.status === 200) {
      this.setState({
        auth: true
      });
    } else {
      this.refreshAccessToken();
    }
  }

  async refreshAccessToken() {
    console.log('Access token was bad... renewing');
    let res = await fetch('http://auth.lofi.rocks/refresh_token?refresh_token=' + this.state.refresh_token);
    if (res.status === 200) {
      const access_token = (await res.json()).access_token;
      settings.set('spotify.access_token', access_token)
      this.setState({
        access_token,
        auth: true
      });
    } else {
      // Something is very, very wrong -- nuke auth settings
      settings.delete('spotify.access_token');
      settings.delete('spotify.refresh_token');
      this.setState({
        refresh_token: null,
        access_token: null,
        auth: false
      });
      this.handleAuth();
    }
  }

  async handleAuth() {
    console.log('Starting authentication process...');
    startAuthServer();
    // No token data! Make sure we wait for authentication
    if (!this.state.refresh_token) {
      let observer: SettingsObserver = settings.observe('spotify', (evt: ChangeEvent) => {
        this.setState({
          refresh_token: evt.newValue.refresh_token,
          access_token: evt.newValue.access_token
        });
        this.verifyAccessToken(observer);
        stopAuthServer();
      });
    } else {
      this.verifyAccessToken(null);
    }
  }

  componentDidMount() {
    this.handleAuth();

    // Move the window when dragging specific element without cannibalizing events
    // Credit goes out to @danielravina
    // See: https://github.com/electron/electron/issues/1354#issuecomment-404348957
    
    const that = this;
    let animationId: number;
    let mouseX: number;
    let mouseY: number;

    function onMouseDown(e: any) {
        if (leftMousePressed(e) && !e.target['classList'].contains('not-draggable')) {
          // Cancel old animation frame, fixes mouse getting "stuck" in the drag state
          cancelAnimationFrame(animationId);
          mouseX = e.clientX;  
          mouseY = e.clientY;
          document.addEventListener('mouseup', onMouseUp)
          requestAnimationFrame(moveWindow);
        }
    }

    function onMouseUp(e: MouseEvent) {
        if (leftMousePressed(e)) {
          console.log('a')
          ipcRenderer.send('windowMoved', { mouseX, mouseY });
          document.removeEventListener('mouseup', onMouseUp)
          cancelAnimationFrame(animationId)
        }
    }

    let moveWindow = (function() {
        ipcRenderer.send('windowMoving', { mouseX, mouseY });
        if (remote.screen.getCursorScreenPoint().x - remote.screen.getDisplayMatching(remote.getCurrentWindow().getBounds()).bounds.x < remote.screen.getDisplayMatching(remote.getCurrentWindow().getBounds()).bounds.width / 2) {
          that.setState({window_side: SIDE.LEFT});
        } else {
          that.setState({window_side: SIDE.RIGHT});
        }
        animationId = requestAnimationFrame(moveWindow);
    }).bind(that);

    function leftMousePressed(e: MouseEvent) {
        var button = e.which || e.button;
        return button === 1;
    }
    
    document.getElementById('visible-ui').addEventListener("mousedown", onMouseDown);
  }

  showSettingsWindow() {
    if (!this.state.showSettings) {
      this.setState({showSettings: true})
    }
  }

  hideSettingsWindow() {
    this.setState({showSettings: false});
  }

  render() {
    return (
      <div id='visible-ui' className='click-on'>
        { this.state.showSettings ? <WindowPortal fullscreen onUnload={this.hideSettingsWindow.bind(this)} name="settings"><Settings lofi={this} className="settings-wnd"/></WindowPortal> : null }
        { this.state.auth ? <Cover settings={this.state.lofiSettings.window} side={this.state.window_side} lofi={this} token={this.state.access_token} /> : <Welcome lofi={this} /> }
      </div>
    );
  }
}

export default Lofi;
