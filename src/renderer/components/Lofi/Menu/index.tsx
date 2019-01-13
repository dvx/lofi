import * as React from 'react';
import { remote } from 'electron'

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
        <ul className='not-draggable top-menu'>
            <li><a><i className="fa fa-cube"></i></a></li>
            <li><a><span style={{fontWeight:'bold'}}>lo</span>fi</a></li>
            <li className='pull-right'><a onClick={this.closeApp} className='danger'><i className="fa fa-times-circle"></i></a></li>
        </ul>
    );
  }
}

export default Menu;
