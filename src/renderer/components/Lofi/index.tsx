import * as React from 'react';
import * as settings from 'electron-settings';
import { ipcRenderer } from 'electron'
import Cover from './Cover';

class Lofi extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    console.log(settings.get('hello'));
    console.log(settings.set('hello','world'));
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

  render() {
    return (
      <div id='main' className='full'>
        <Cover art='https://i.scdn.co/image/07c323340e03e25a8e5dd5b9a8ec72b69c50089d' />
      </div>
    );
  }
}

export default Lofi;
