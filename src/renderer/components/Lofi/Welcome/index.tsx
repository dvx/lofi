import * as React from 'react';
import { remote } from 'electron'
import Menu from './../Menu';
import './style.scss';

class Welcome extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  closeApp() {
    let mainWindow = remote.getCurrentWindow()
    mainWindow.close()
  }

  render() {
    return (
      <div className='welcome full'>
        <Menu parent={this} />
        <div className='centered welcome-pane'>
          <div style={{margin: 'auto'}}>
            <h2 className="brand">lo<span className="brand-highlight">fi</span></h2>
            <div className="brand-tagline">a tiny player</div>
          </div>
        </div>
        <div className="centered controls">
          <a className='login-btn not-draggable' target="_blank" href="http://auth.lofi.rocks/login"><i className="fab fa-spotify not-draggable"></i>&nbsp;&nbsp;<span className="not-draggable">Log in</span></a>
        </div>
      </div>
    );
  }
}

export default Welcome;
