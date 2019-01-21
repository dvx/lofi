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

  render() {
    return (
      <>
        <ul className='menu top-menu'>
            <li><a className='logo-typo'><span style={{fontWeight:'bold'}}>lo</span>fi</a></li>
            <li className='pull-right'><a onClick={this.closeApp.bind(this)} className='danger not-draggable'><i className="fa fa-times-circle not-draggable"></i></a></li>
        </ul>
        <ul className='menu bottom-menu'>
          <li><a onClick={this.cycleVis.bind(this)} className='vis not-draggable'><i className={'fa not-draggable ' + this.props.visIcon }></i></a></li>
          <li className='pull-right'><a target="_blank" href="http://lofi.rocks/help" className='help not-draggable'><i className="fa fa-question-circle not-draggable"></i></a></li>
        </ul>
      </>
    );
  }
}

export default Menu;
