import * as React from 'react';
import { remote } from 'electron';
import Menu from './../Menu';
import './style.scss';

class Welcome extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  closeApp() {
    let mainWindow = remote.getCurrentWindow();
    mainWindow.close();
  }

  promptForAuth(authUrl: string): void {
    const mainWindow = remote.getCurrentWindow();
    const authWindow = new remote.BrowserWindow({
      parent: mainWindow,
      modal: true,
      minimizable: false,
      maximizable: false,
      closable: true,
    });

    authWindow.setMenu(null);
    authWindow.loadURL(authUrl);

    authWindow.on('ready-to-show', () => {
      authWindow.show();
    });
  }

  render() {
    const authUrl = this.props.lofi.state.auth_url;

    return (
      <div className="welcome full">
        <Menu parent={this} />
        <div className="centered welcome-pane">
          <div style={{ margin: 'auto' }}>
            <h2 className="brand">
              lo<span className="brand-highlight">fi</span>
            </h2>
            <div className="brand-tagline">a tiny player</div>
          </div>
        </div>
        {authUrl ? (
          <div className="centered controls">
            <a
              className="login-btn not-draggable"
              onClick={(e) => this.promptForAuth(authUrl)}>
              <i className="fab fa-spotify not-draggable"></i>&nbsp;&nbsp;
              <span className="not-draggable">Log in</span>
            </a>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Welcome;
