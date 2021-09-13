import * as React from 'react';
import { remote } from 'electron';
import Menu from './../Menu';
import './style.scss';
import { startAuthServer } from '../../../../main/auth';

class Welcome extends React.Component<any, any> {
  closeApp() {
    let mainWindow = remote.getCurrentWindow();
    mainWindow.close();
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
              target="auth"
              href={authUrl}
              onClick={(e) => startAuthServer()}
            >
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
