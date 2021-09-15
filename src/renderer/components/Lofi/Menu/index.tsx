import * as React from 'react';
import { MACOS } from '../../../../constants';
import './style.scss';

class Menu extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  closeApp() {
    this.props.parent.closeApp();
  }

  cycleVis() {
    if (!MACOS) {
      this.props.parent.cycleVisualizationType();
    }
  }

  showSettingsWindow() {
    this.props.parent.props.lofi.showSettingsWindow();
  }

  toggleShuffle() {
    this.props.parent.shuffleAndPlay();
  }

  render() {
    return (
      <>
        <ul className="menu top">
          <li>
            <a onClick={this.showSettingsWindow.bind(this)} className="settings not-draggable">
              <i className="fa fa-cog not-draggable"></i>
            </a>
            <a className="logo-typo">
              <span style={{ fontWeight: 'bold' }}>lo</span>fi
            </a>
          </li>
          <li className="pull-right">
            <a onClick={this.closeApp.bind(this)} className="danger not-draggable">
              <i className="fa fa-times-circle not-draggable"></i>
            </a>
          </li>
        </ul>
        {this.props.parent.constructor.name !== 'Welcome' ? (
          <ul className="menu bottom">
            <li>
              <a onClick={this.cycleVis.bind(this)} className={`vis not-draggable ${MACOS ? `disabled` : ``}`}>
                <i className={'fa not-draggable ' + this.props.visIcon}></i>
              </a>
            </li>
            {/* <li className='pull-right'><a data-tooltip="Shuffle playlist" className='shuffle not-draggable'><i onClick={this.toggleShuffle.bind(this)} className="fa fa-random not-draggable"></i></a></li> */}
            {this.props.parent.state?.spotifyError ? (
              <li className="pull-right">
                <a className="warning not-draggable tooltip">
                  <i className="fa fa-exclamation-triangle not-draggable"></i>
                  <span>{this.props.parent.state.spotifyError}</span>
                </a>
              </li>
            ) : null}
            <li className="pull-right">
              <a target="_blank" href="http://lofi.rocks/help" className="help not-draggable">
                <i className="fa fa-question-circle not-draggable"></i>
              </a>
            </li>
          </ul>
        ) : null}
      </>
    );
  }
}

export default Menu;
