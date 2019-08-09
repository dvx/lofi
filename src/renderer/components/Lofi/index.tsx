import * as React from 'react';
import * as settings from 'electron-settings';
import { ipcRenderer, screen, remote } from 'electron'
import { startAuthServer, stopAuthServer } from '../../../main/server';
import Cover from './Cover';
import Welcome from './Welcome';
import './style.scss'

enum SIDE {
  LEFT, RIGHT
}

class Lofi extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      access_token: settings.get('spotify.access_token'),
      refresh_token: settings.get('spotify.refresh_token'),
      window_side: SIDE.LEFT,
      auth: false,
    }
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
      // Something is very, very wrong -- nuke the settings
      settings.setAll({});
      this.setState({
        refresh_token: null,
        access_token: null,
        auth: false
      });
      this.handleAuth();
    }
  }

  async handleAuth() {
    startAuthServer();
    // No token data! Make sure we wait for authentication
    if (!this.state.refresh_token) {
      // FIXME: This observer needs to be disposed at some point
      let observer: SettingsObserver = settings.watch('spotify', (newValue, oldValue) => {
        this.setState({
          refresh_token: newValue.refresh_token,
          access_token: newValue.access_token
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
            mouseX = e.clientX;  
            mouseY = e.clientY;
            document.addEventListener('mouseup', onMouseUp)
            requestAnimationFrame(moveWindow);
        }
    }

    function onMouseUp(e: MouseEvent) {
        if (leftMousePressed(e)) {
            ipcRenderer.send('windowMoved');
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

  render() {
    return (
      <div id='visible-ui' className='click-on'>
        { this.state.auth ? <Cover side={this.state.window_side} lofi={this} token={this.state.access_token} /> : <Welcome /> }
      </div>
    );
  }
}

export default Lofi;
