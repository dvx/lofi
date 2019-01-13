import * as React from 'react';
import { remote, ipcRenderer } from 'electron'

class Cover extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  closeApp() {
    let w = remote.getCurrentWindow()
    w.close()
  }

  render() {
    return (
      <div className='cover' style={{ backgroundImage: 'url(' + this.props.art + ')' }}>
        <ul className='not-draggable top-menu'>
          <li><a><i className="fa fa-cube"></i></a></li>
          <li><a><span style={{fontWeight:'bold'}}>lo</span>fi</a></li>
          <li className='pull-right'><a onClick={this.closeApp} className='danger'><i className="fa fa-times-circle"></i></a></li>
        </ul>
      </div>
    );
  }
}

export default Cover;
