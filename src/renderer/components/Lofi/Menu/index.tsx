import * as React from 'react';
import './style.scss'

class Menu extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  closeApp() {
    this.props.parent.closeApp();
  }

  cycleVis() {
    this.props.parent.cycleVisualizationType();
  }

  showSettings() {
    this.props.parent.props.lofi.showSettings();
  }

  toggleShuffle() {
    this.props.parent.shuffleAndPlay();
  }

  render() {
    return (
      <>
        <ul className='menu top-menu'>
            <li><a style={{float:'left'}} onClick={this.showSettings.bind(this)} className='settings not-draggable'><i className="fa fa-cog not-draggable"></i></a><a style={{float:'left'}}className='logo-typo'><span style={{fontWeight:'bold'}}>Lo</span>fi</a></li>
            <li className='pull-right'><a onClick={this.closeApp.bind(this)} className='danger not-draggable'><i className="fa fa-times-circle not-draggable"></i></a></li>
        </ul>
        {
          this.props.parent.constructor.name !== 'Welcome' ?
          <ul className='menu bottom-menu'>
            <li><a onClick={this.cycleVis.bind(this)} className='vis not-draggable'><i className={'fa not-draggable ' + this.props.visIcon }></i></a></li>
            <li className='pull-right'><a data-tooltip="Shuffle playlist" className='shuffle not-draggable'><i onClick={this.toggleShuffle.bind(this)} className="fa fa-random not-draggable"></i></a></li>
          </ul> : null
        }
      </>
    );
  }
}

export default Menu;
