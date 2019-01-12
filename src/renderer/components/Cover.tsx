import * as React from 'react';
import { remote, ipcRenderer } from 'electron'

class Cover extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    // Move the window when dragging specific element without cannibalizing events
    // Credit goes out to @danielravina
    // See: https://github.com/electron/electron/issues/1354#issuecomment-404348957
    let animationId:any;
    let mouseX:any;
    let mouseY:any;
    function onMouseDown(e:any) {
        if (leftMousePressed(e)) {
            mouseX = e.clientX;  
            mouseY = e.clientY;
            document.addEventListener('mouseup', onMouseUp)
            requestAnimationFrame(moveWindow);
        }
    }

    function onMouseUp(e:any) {
        if (leftMousePressed(e)) {
            ipcRenderer.send('windowMoved');
            document.removeEventListener('mouseup', onMouseUp)
            cancelAnimationFrame(animationId)
        }
    }

    function moveWindow() {
        ipcRenderer.send('windowMoving', { mouseX, mouseY });
        animationId = requestAnimationFrame(moveWindow);
    }

    function leftMousePressed(e:any) {
        e = e || window.event;
        var button = e.which || e.button;
        return button == 1;
    }

    document.getElementById('main').addEventListener("mousedown", onMouseDown);
  }

  closeApp() {
    let w = remote.getCurrentWindow()
    w.close()
  }

  render() {
    return (
      <div id='main' className='draggable cover' style={{ backgroundImage: 'url(' + this.props.art + ')' }}>
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
