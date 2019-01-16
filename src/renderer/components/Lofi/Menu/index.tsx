import * as React from 'react';
import { remote } from 'electron'
import './style.scss'

class Menu extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  closeApp() {
    let w = remote.getCurrentWindow()
    w.close()
  }

  render() {
    return (
        <ul className='top-menu'>
            <li><a><span style={{fontWeight:'bold'}}>lo</span>fi</a></li>
            <li className='pull-right'><a onClick={this.closeApp} className='danger not-draggable'><i className="fa fa-times-circle not-draggable"></i></a></li>
        </ul>
    );
  }
}

export default Menu;
