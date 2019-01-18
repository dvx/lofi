import * as React from 'react';
import { ipcRenderer, remote } from 'electron'
import * as path from 'path';
import * as url from 'url';
import * as _ from 'lodash';
import Menu from './../Menu';
import Controls from './Controls';
import TrackInfo from './TrackInfo';
import Visualizer from './Visualizer';
import './style.scss';

class Cover extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      cover_art: '',
      vis_window: null,
      // TODO: grab this from settings
      visualization: false,
      bigVisualization: false
    }
  }

  componentDidMount() {
    const intervalId = setInterval(() => this.listeningTo(), 5000);
    this.setState({ intervalId });
    this.listeningTo();
  }

  async listeningTo() {
    let res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer '+ this.props.token
      })
    });
    const currently_playing = await res.json();
    console.log(currently_playing);
    this.setState({
      cover_art: currently_playing.item.album.images[0].url,
      track: currently_playing.item.name,
      artist: _.map(currently_playing.item.artists, 'name').join(", ")
    });

    if (this.state.bigVisualization) {
      this.state.vis_window.webContents.send('currently-playing', currently_playing);
    }
  }

  toggleVisualization() {
    this.setState({
      visualization: !this.state.visualization
    });
  }

  toggleBigVisualization() {
    if (!this.state.bigVisualization) {
      const BrowserWindow = remote.BrowserWindow;
      const visWindow = new BrowserWindow({ width: 800, height: 600 });
      visWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, './visualization.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
      visWindow.webContents.openDevTools();
      this.setState({
        vis_window: visWindow,
        bigVisualization: true
      })
    } else {
      this.setState({
        vis_window: null,
        bigVisualization: false
      })
    }
  }

  render() {
    return (
      <>
        <Menu parent={this} />
        <TrackInfo track={this.state.track} artist={this.state.artist} />
        <div className='cover full' style={{ backgroundImage: 'url(' + this.state.cover_art + ')' }} />
        <Visualizer show={this.state.visualization} data={ this.state } />
        <Controls token={this.props.token} />
      </>
    );
  }
}

export default Cover;
