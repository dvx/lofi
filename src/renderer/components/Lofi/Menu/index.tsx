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

  toggleVis() {
    this.props.parent.toggleVisualization();
  }

  bigVis() {
    this.props.parent.toggleBigVisualization();
  }

  render() {
    return (
      <>
        <ul className='menu top-menu'>
            <li><a><span style={{fontWeight:'bold'}}>lo</span>fi</a></li>
            <li className='pull-right'><a onClick={this.closeApp} className='danger not-draggable'><i className="fa fa-times-circle not-draggable"></i></a></li>
        </ul>
        <ul className='menu bottom-menu'>
          <li><a onClick={this.toggleVis.bind(this)} className='not-draggable'><i className="fa fa-image not-draggable"></i></a></li>
          <li className='pull-right'><a onClick={this.bigVis.bind(this)} className='not-draggable'><i className="fa fa-expand-arrows-alt not-draggable"></i></a></li>
        </ul>        
      </>
    );
  }
}

export default Menu;
