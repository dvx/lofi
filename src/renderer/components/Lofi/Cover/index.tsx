import * as React from 'react';
import { remote, screen, ipcMain, ipcRenderer } from 'electron'
import { MACOS } from '../../../../constants'
import * as path from 'path';
import * as url from 'url';
import * as _ from 'lodash';
import Menu from './../Menu';
import Controls from './Controls';
import TrackInfo from './TrackInfo';
import Visualizer from './Visualizer';
import RecreateChildOnPropsChange from '../../util/RecreateChildOnPropsChange';
import { nextVisualization, prevVisualization } from '../../../../visualizations/visualizations.js';
import './style.scss';

enum VISUALIZATION_TYPE {
  NONE,
  SMALL,
  BIG
}

class Cover extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      currently_playing: null,
      visWindow: null,
      visualizationType: VISUALIZATION_TYPE.NONE,
      visualizationId: 0
    }

    const that = this;

    ipcRenderer.on('next-visualization', function (event:Event, data:any) {
      that.setState({ visualizationId: nextVisualization(that.state.visualizationId) });
      if (that.state.visWindow) {
        that.state.visWindow.send('next-visualization');
      }
    });

    ipcRenderer.on('prev-visualization', function (event:Event, data:any) {
      that.setState({ visualizationId: prevVisualization(that.state.visualizationId) });
      if (that.state.visWindow) {
        that.state.visWindow.send('prev-visualization');
      }
    });
  }

  componentDidMount() {
    const intervalId = setInterval(() => this.listeningTo(), 5000);
    this.setState({ intervalId });
    this.listeningTo();
  }

  togglePlayPause() {
    if (this.state.currently_playing) {
      // FIXME: Using nested state is bad in React, need to split up this awful Spotify object
      let currently_playing = this.state.currently_playing;
      currently_playing.is_playing = !currently_playing.is_playing;
      this.setState({
        currently_playing
      })
    }
  }

  setPlaying(playing:boolean) {
    if (this.state.currently_playing) {
      // FIXME: Using nested state is bad in React, need to split up this awful Spotify object
      let currently_playing = this.state.currently_playing;
      currently_playing.is_playing = playing;
      this.setState({
        currently_playing
      })
    }
  }

  async listeningTo() {
      let res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: new Headers({
          'Authorization': 'Bearer '+ this.props.token
        })
      });
      if (res.status === 204) {
        console.log('playing nothing ...');
        // TODO: handle this
      } else if (res.status !== 200) {
        await this.props.lofi.refreshAccessToken();
        await this.listeningTo();
      } else {
        const currently_playing = await res.json();
        console.log(currently_playing);
        this.setState({
          currently_playing,
        });
        if (this.state.bigVisualization) {
          this.state.visWindow.webContents.send('currently-playing', currently_playing);
        }
      }

  }

  closeApp() {
    if (this.state.visWindow) {
      this.state.visWindow.close();
      this.state.visWindow.destroy();
    }
    let mainWindow = remote.getCurrentWindow()
    mainWindow.close()
  }

  cycleVisualizationType() {
    switch (this.state.visualizationType) {
      case VISUALIZATION_TYPE.NONE:
        this.setState({
          visWindow: null,
          visualizationType: VISUALIZATION_TYPE.SMALL
        });
        break;
      case VISUALIZATION_TYPE.SMALL:
        const BrowserWindow = remote.BrowserWindow;
        const visWindow = new BrowserWindow({ closable: MACOS ? false : true });
        visWindow.setMenuBarVisibility(false);
        visWindow.loadURL(
          url.format({
            pathname: path.join(__dirname, './visualizer.html'),
            protocol: 'file:',
            slashes: true,
          })
        );

        // On MacOS, setSimpleFullScreen is buggy/slow 
        // We need slightly different logic for where the window pops up because Windows is full screen while MacOS isn't
        if (MACOS) {
          // Just show regular window instead
          visWindow.setPosition(screen.getCursorScreenPoint().x - 400, screen.getCursorScreenPoint().y);
          visWindow.setSize(800, 600);
        } else {
          visWindow.setPosition(remote.getCurrentWindow().getBounds().x, remote.getCurrentWindow().getBounds().y);
          visWindow.setSimpleFullScreen(true);
          // visWindow.webContents.openDevTools({mode:"detach"});
        }

        visWindow.webContents.once('dom-ready', () => {
          visWindow.webContents.send('set-visualization', this.state.visualizationId);
        });
       
        this.setState({
          visWindow,
          visualizationType: VISUALIZATION_TYPE.BIG
        });
        break;
      case VISUALIZATION_TYPE.BIG:
        // there are OS-y ways of closing the window, so make sure it still exists before we attempt to close
        if (this.state.visWindow) {
          this.state.visWindow.destroy()
        }
        this.setState({
          visWindow: null,
          visualizationType: VISUALIZATION_TYPE.NONE
        });
        break;
      default:
    }
  }

  visIconFromType() {
    switch (this.state.visualizationType) {
      case VISUALIZATION_TYPE.NONE:
        return 'fa-expand';
      case VISUALIZATION_TYPE.SMALL:
        return 'fa-expand-arrows-alt';
      case VISUALIZATION_TYPE.BIG:
        return 'fa-compress-arrows-alt';
      default:
        return '';
    }
  }

  getCoverArt() {
    if (this.state.currently_playing) {
      return this.state.currently_playing.item.album.images[0].url;
    }
  }

  getTrack() {
    if (this.state.currently_playing) {
      return this.state.currently_playing.item.name;
    }
  }

  getArtist() {
    if (this.state.currently_playing) {
      return _.map(this.state.currently_playing.item.artists, 'name').join(", ");
    }
  }

  getPlayState() {
    if (this.state.currently_playing) {
      return this.state.currently_playing.is_playing;
    }
  }

  render() {
    return (
      <>
        <Menu parent={this} visIcon={this.visIconFromType()}/>
        <TrackInfo side={this.props.side} track={this.getTrack()} artist={this.getArtist()} />
        <div className='cover full' style={ this.getCoverArt() ? { backgroundImage: 'url(' + this.getCoverArt() + ')' } : { }} />
        <RecreateChildOnPropsChange visType={this.state.visualizationType} visId={this.state.visualizationId}>
          <Visualizer visId={this.state.visualizationId} currentlyPlaying={this.state.currently_playing} show={this.state.visualizationType === VISUALIZATION_TYPE.SMALL} />
        </RecreateChildOnPropsChange>
        <Controls parent={this} token={this.props.token} />
      </>
    );
  }
}

export default Cover;
