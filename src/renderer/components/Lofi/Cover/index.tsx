import * as React from 'react';
import { remote, screen, ipcMain, ipcRenderer } from 'electron'
import NewWindow from 'react-new-window';
import { MACOS } from '../../../../constants'
import * as path from 'path';
import * as url from 'url';
import * as _ from 'lodash';
import Menu from './../Menu';
import Controls from './Controls';
import TrackInfo from './TrackInfo';
import Visualizer from './Visualizer';
import Waiting from './Waiting';
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
      showSettings: false,
      visualizationType: VISUALIZATION_TYPE.NONE,
      visualizationId: 0,
      volume: 0,
      stateChange: new Date(1900, 1, 1),
      shuffle: null
    }

    const that = this;

    ipcRenderer.on('next-visualization', function (event:Event, data:any) {
      that.setState({ visualizationId: nextVisualization(that.state.visualizationId) });
      if (that.state.visWindow) {
        that.state.visWindow.send('set-visualization', that.state.visualizationId);
      }
    });

    ipcRenderer.on('prev-visualization', function (event:Event, data:any) {
      that.setState({ visualizationId: prevVisualization(that.state.visualizationId) });
      if (that.state.visWindow) {
        that.state.visWindow.send('set-visualization', that.state.visualizationId);
      }
    });
  }

  componentDidMount() {
    const that = this;
    // Polling Spotify every 1 second, probably a bad idea
    const intervalId = setInterval(() => this.listeningTo(), 1000);
    this.setState({ intervalId });

    function onMouseWheel(e: WheelEvent) {
      // console.log('delta: ' + e.deltaY * 0.1);
      if (e.deltaY > 0 && that.state.volume > 0) {
        that.setVolume(that.state.volume - e.deltaY * 0.1);
      } else if (e.deltaY < 0 && that.state.volume < 100) {
        that.setVolume(that.state.volume + Math.abs(e.deltaY * 0.1));
      }
    }

    document.getElementById('visible-ui').addEventListener("mousewheel", onMouseWheel);    
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

  getVolume() {
    return this.state.volume;
  }

  async setVolume(percent: number) {
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    this.setState({volume: percent, stateChange: new Date() });
    let res = await fetch('https://api.spotify.com/v1/me/player/volume?volume_percent=' + Math.round(percent), {
      method: 'PUT',
      headers: new Headers({
        'Authorization': 'Bearer '+ this.props.token
      })
    });    
  }

  getTrackProgress() {
    if (this.state.currently_playing) {
      // dodge division by zero
      if (this.state.currently_playing.item.duration_ms == 0) {
        return 100
      } else {
        return (this.state.currently_playing.progress_ms / this.state.currently_playing.item.duration_ms) * 100
      }
    }
    return 0
  }

  async listeningTo() {
      let res = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'GET',
        headers: new Headers({
          'Authorization': 'Bearer '+ this.props.token
        })
      });
      if (res.status === 204) {
        // 204 is the "Nothing playing" Spotify response
        // See: https://github.com/zmb3/spotify/issues/56
      } else if (res.status !== 200) {
        await this.props.lofi.refreshAccessToken();
        await this.listeningTo();
      } else {
        const currently_playing = await res.json();
        // Fixes https://github.com/dvx/lofi/issues/31
        // The solution is a bit ugly: seek to current position so Spotify doesn't kill our current active_device
        if (!currently_playing.is_playing) {
          await fetch('https://api.spotify.com/v1/me/player/seek?position_ms=' + currently_playing.progress_ms, {
            method: 'PUT',
            headers: new Headers({
              'Authorization': 'Bearer '+ this.props.token
            })
          });
        }

        // NOTE: debugging purposes
        //console.log(currently_playing);

        if (currently_playing.context && currently_playing.context.type === "playlist") {
          console.log("playing a playlist; we can potentially shuffle");
        } else {
          console.log("shuffle unavailable for this track")
        }

        this.setState({
          currently_playing
        });

        // trust UI while scroll wheel level, e.g. volume, stabilizes (10 second leeway)
        if (((new Date()).getTime() - this.state.stateChange.getTime()) > 10000) {
          this.setState( {
            volume: currently_playing.device.volume_percent
          })
        }

        if (this.state.bigVisualization) {
          this.state.visWindow.webContents.send('currently-playing', currently_playing);
        }
      }

  }

  showSettings() {
    console.log(this.refs.wnd);
    if (!this.state.showSettings) {
      this.setState({showSettings: true})
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
        const visWindow = new BrowserWindow();
        visWindow.on('close', () => {
          this.cycleVisualizationType();
        });
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
          visWindow.setPosition(remote.screen.getCursorScreenPoint().x - 400, remote.screen.getCursorScreenPoint().y);
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
      if(this.state.currently_playing.currently_playing_type == 'track') {
        return this.state.currently_playing.item.album.images[0].url;
      } else if (this.state.currently_playing.currently_playing_type == 'ad') {
        // TODO: Cover art for ads?
        return '';
      } else if (this.state.currently_playing.currently_playing_type == 'episode') {
        // TODO: Cover art for music videos?
        return '';
      }
    } else {
      return '';
    }
  }

  getTrack() {
    if (this.state.currently_playing) {
      if(this.state.currently_playing.currently_playing_type == 'track') {
        return this.state.currently_playing.item.name;
      } else if (this.state.currently_playing.currently_playing_type == 'ad') {
        return 'Advertisement';
      } else if (this.state.currently_playing.currently_playing_type == 'episode') {
        return 'Music Video';
      }
    }
    return 'n/a';
  }

  getArtist() {
    if (this.state.currently_playing) {
      if(this.state.currently_playing.currently_playing_type == 'track') {
        return _.map(this.state.currently_playing.item.artists, 'name').join(", ");
      } else if (this.state.currently_playing.currently_playing_type == 'ad') {
        return 'Spotify';
      } else if (this.state.currently_playing.currently_playing_type == 'episode') {
        return 'Spotify';
      }
    }
    return 'n/a';
  }

  getPlayState() {
    if (this.state.currently_playing) {
      return this.state.currently_playing.is_playing;
    }
  }

  render() {
    return (
      <>
        { this.state.showSettings ? <NewWindow ref='wnd' center='screen' title="asd"><h1>Hi 👋</h1></NewWindow> : null }
        <Menu parent={this} visIcon={this.visIconFromType()}/>
        { this.state.currently_playing ? <TrackInfo side={this.props.side} track={this.getTrack()} artist={this.getArtist()} /> : null }
        <div className={'cover full ' +  (this.getPlayState() ? '' : 'pause') } style={ this.getCoverArt() ? { backgroundImage: 'url(' + this.getCoverArt() + ')' } : { }} />
        <RecreateChildOnPropsChange visType={this.state.visualizationType} visId={this.state.visualizationId}>
          <Visualizer visId={this.state.visualizationId} currentlyPlaying={this.state.currently_playing} show={this.state.visualizationType === VISUALIZATION_TYPE.SMALL} />
        </RecreateChildOnPropsChange>
        { this.state.currently_playing ? <Controls parent={this} token={this.props.token} /> : <Waiting /> }
      </>
    );
  }
}

export default Cover;
