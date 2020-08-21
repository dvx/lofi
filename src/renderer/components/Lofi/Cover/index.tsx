import * as React from 'react';
import { remote } from 'electron';
import settings from 'electron-settings';
import {
  MACOS,
  DEFAULT_SETTINGS,
  LOFI_SHUFFLED_PLAYLIST_NAME,
} from '../../../../constants';
import * as path from 'path';
import * as url from 'url';
import _ from 'lodash';
import Menu from './../Menu';
import Controls from './Controls';
import TrackInfo from './TrackInfo';
import Visualizer from './Visualizer';
import Waiting from './Waiting';
import RecreateChildOnPropsChange from '../../util/RecreateChildOnPropsChange';

import './style.scss';

enum VISUALIZATION_TYPE {
  NONE,
  SMALL,
  BIG,
}

class Cover extends React.Component<any, any> {
  volumeChangedTimeoutId: NodeJS.Timeout;

  constructor(props: any) {
    super(props);
    this.state = {
      currently_playing: null,
      visWindow: null,
      showSettings: false,
      visualizationType: VISUALIZATION_TYPE.NONE,
      volume: 0,
      volume_increment: DEFAULT_SETTINGS.lofi.audio.volume_increment,
      volume_changed: false,
      display_volume_change: DEFAULT_SETTINGS.lofi.audio.display_volume_change,
      stateChange: new Date(1900, 1, 1),
      shuffle: null,
    };

    this.volumeChangedTimeoutId = null;
  }

  componentDidMount() {
    const that = this;
    // Polling Spotify every 1 second, probably a bad idea
    const intervalId = setInterval(() => this.listeningTo(), 1000);
    this.setState({ intervalId });

    function onMouseWheel(e: WheelEvent) {
      const volume_increment = that.props.lofi.state.lofiSettings.audio
        ? that.props.lofi.state.lofiSettings.audio.volume_increment
        : DEFAULT_SETTINGS.lofi.audio.volume_increment;

      const volume_percent = volume_increment / 100;
      const new_volume = _.clamp(
        that.state.volume - e.deltaY * volume_percent,
        0,
        100
      );

      that.setVolume(new_volume);
    }

    document
      .getElementById('visible-ui')
      .addEventListener('mousewheel', onMouseWheel);
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      console.log('Clearing playing interval');
      clearInterval(this.state.intervalId);
    }
  }

  togglePlayPause() {
    if (this.state.currently_playing) {
      // FIXME: Using nested state is bad in React, need to split up this awful Spotify object
      let currently_playing = this.state.currently_playing;
      currently_playing.is_playing = !currently_playing.is_playing;
      this.setState({
        currently_playing,
      });
    }
  }

  setPlaying(playing: boolean) {
    if (this.state.currently_playing) {
      // FIXME: Using nested state is bad in React, need to split up this awful Spotify object
      let currently_playing = this.state.currently_playing;
      currently_playing.is_playing = playing;
      this.setState({
        currently_playing,
      });
    }
  }

  getVolume() {
    return this.state.volume;
  }

  volumeChanged() {
    if (this.volumeChangedTimeoutId) {
      clearTimeout(this.volumeChangedTimeoutId);
    }

    this.setState({ volume_changed: true });
    this.volumeChangedTimeoutId = setTimeout(() => {
      this.setState({ volume_changed: false });
    }, 1500);
  }

  async setVolume(percent: number) {
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    this.setState({ volume: percent, stateChange: new Date() }, () =>
      this.volumeChanged()
    );
    await fetch(
      'https://api.spotify.com/v1/me/player/volume?volume_percent=' +
        Math.round(percent),
      {
        method: 'PUT',
        headers: new Headers({
          Authorization: 'Bearer ' + this.props.token,
        }),
      }
    );
  }

  getTrackProgress() {
    // Sometimes `currently_playing.item` ends up being null, probably a Spotify quirk
    if (this.state.currently_playing && this.state.currently_playing.item) {
      // Dodge division by zero
      if (this.state.currently_playing.item.duration_ms == 0) {
        return 100;
      } else {
        return (
          (this.state.currently_playing.progress_ms /
            this.state.currently_playing.item.duration_ms) *
          100
        );
      }
    }
    return 0;
  }

  componentDidUpdate() {
    // Should we hide or show the window?
    if (this.state.currently_playing) {
      if (!remote.getCurrentWindow().isVisible()) {
        remote.getCurrentWindow().show();
      }
    } else {
      if (this.props.settings.hide && remote.getCurrentWindow().isVisible()) {
        remote.getCurrentWindow().hide();
      } else if (
        !this.props.settings.hide &&
        !remote.getCurrentWindow().isVisible()
      ) {
        remote.getCurrentWindow().show();
      }
    }
    if (this.state.visWindow) {
      this.state.visWindow.webContents.send(
        'set-visualization',
        this.props.visualizationId
      );
    }
  }

  async listeningTo() {
    let res = await fetch(
      'https://api.spotify.com/v1/me/player?type=episode,track',
      {
        method: 'GET',
        headers: new Headers({
          Authorization: 'Bearer ' + this.props.token,
        }),
      }
    );
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
        await fetch(
          'https://api.spotify.com/v1/me/player/seek?position_ms=' +
            currently_playing.progress_ms,
          {
            method: 'PUT',
            headers: new Headers({
              Authorization: 'Bearer ' + this.props.token,
            }),
          }
        );
      }

      // NOTE: debugging purposes
      // console.log(currently_playing);

      // if (currently_playing.context && currently_playing.context.type === "playlist") {
      //   console.log("playing a playlist; we can potentially shuffle");
      // } else {
      //   console.log("shuffle unavailable for this track")
      // }

      this.setState({
        currently_playing,
      });

      // trust UI while scroll wheel level, e.g. volume, stabilizes (10 second leeway)
      if (
        this.state.stateChange &&
        new Date().getTime() - this.state.stateChange.getTime() > 10000
      ) {
        this.setState({
          volume: currently_playing.device.volume_percent,
        });
      }

      if (this.state.bigVisualization) {
        this.state.visWindow.webContents.send(
          'currently-playing',
          currently_playing
        );
      }
    }
  }

  closeApp() {
    if (this.state.visWindow) {
      this.state.visWindow.close();
      this.state.visWindow.destroy();
    }
    let mainWindow = remote.getCurrentWindow();
    mainWindow.close();
  }

  async getAllTracksFromPlaylist(playlist_id: string): Promise<string[]> {
    const allTracks: string[] | PromiseLike<string[]> = [];

    let res = await fetch(
      'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
      {
        method: 'GET',
        headers: new Headers({
          Authorization: 'Bearer ' + this.props.token,
        }),
      }
    );
    let playlist = await res.json();

    playlist.items.map((item: any) => {
      if (item.track.type === 'track') {
        allTracks.push('spotify:track:' + item.track.id);
      }
    });

    // Paginate if we need to
    // TODO: Add response checking here, we can fail catastrophically
    while (playlist.next) {
      res = await fetch(playlist.next, {
        method: 'GET',
        headers: new Headers({
          Authorization: 'Bearer ' + this.props.token,
        }),
      });

      playlist = await res.json();

      playlist.items.map((item: any) => {
        if (item.track.type === 'track') {
          allTracks.push('spotify:track:' + item.track.id);
        }
      });
    }
    return allTracks;
  }

  async findLofiShuffledPlaylist(): Promise<string> {
    return null;
  }

  async shuffleAndPlay() {
    console.log('Shuffling and playing...');
    // How to shuffle a playlist:
    // 1) Get all playlists
    // 2) Does a "Shuffled by Lofi" playlist exist?
    //    - Yes: Delete it
    //    - No: Do nothing
    // 3) Create a "Shuffled by Lofi" playlist and get ID
    // 4) Shuffle the tracks
    // 5) Put them in the shuffled order in the playlist ID
    // 6) Play that playlist ID
    const playlist_id = this.state.currently_playing.context.uri
      .split(':')
      .reverse()[0];
    // const tracks = (await this.getAllTracksFromPlaylist(playlist_id));

    let res = await fetch(
      'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
      {
        method: 'GET',
        headers: new Headers({
          Authorization: 'Bearer ' + this.props.token,
        }),
      }
    );

    if (res.status === 200) {
      let tracks: string[] = [];
      const playlist = await res.json();
      console.log(playlist);
      playlist.items.map((item: any) => {
        if (item.track.type === 'track') {
          tracks.push('spotify:track:' + item.track.id);
        }
      });

      // One-line array shuffle
      // See: https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4#gistcomment-2271465
      // Also: http://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html
      let shuffled = tracks
        .map((a: any) => [Math.random(), a])
        .sort((a, b) => a[0] - b[0])
        .map((a) => a[1]);
      console.log(shuffled);

      const all_playlists = await this.getAllPlaylists();
      for (let playlist of all_playlists) {
        if (playlist.name === LOFI_SHUFFLED_PLAYLIST_NAME) {
        }
      }
      return;

      // // Play the generated playlist
      // fetch('https://api.spotify.com/v1/me/player/play', {
      //   method: 'PUT',
      //   headers: new Headers({
      //     'Authorization': 'Bearer '+ this.props.token
      //   }),
      //   body: JSON.stringify({ uris: shuffled})
      // })
    }
  }

  async createLofiPlaylist() {}

  async getAllPlaylists(limit = 50) {
    let playlists: any[] = [];
    let res = await fetch(
      'https://api.spotify.com/v1/me/playlists?limit=' + limit,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: 'Bearer ' + this.props.token,
        }),
      }
    );

    if (res.status === 200) {
      let playlist_object = await res.json();
      playlists = playlists.concat(playlist_object.items);
      while (playlist_object.next) {
        res = await fetch(playlist_object.next, {
          headers: new Headers({
            Authorization: 'Bearer ' + this.props.token,
          }),
        });

        if (res.status === 200) {
          playlist_object = await res.json();
          playlists = playlists.concat(playlist_object.items);
        }
      }
    }
    return playlists;
  }

  cycleVisualizationType() {
    switch (this.state.visualizationType) {
      case VISUALIZATION_TYPE.NONE:
        this.setState({
          visWindow: null,
          visualizationType: VISUALIZATION_TYPE.SMALL,
        });
        break;
      case VISUALIZATION_TYPE.SMALL:
        const BrowserWindow = remote.BrowserWindow;
        const visWindow = new BrowserWindow({
          webPreferences: { nodeIntegration: true },
        });
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
          visWindow.setPosition(
            remote.screen.getCursorScreenPoint().x - 400,
            remote.screen.getCursorScreenPoint().y
          );
          visWindow.setSize(800, 600);
        } else {
          visWindow.setPosition(
            remote.getCurrentWindow().getBounds().x,
            remote.getCurrentWindow().getBounds().y
          );
          visWindow.setSimpleFullScreen(true);
          if (Boolean(settings.getSync('debug')) === true) {
            visWindow.webContents.openDevTools({ mode: 'detach' });
          }
        }

        visWindow.webContents.once('dom-ready', () => {
          visWindow.webContents.send(
            'set-visualization',
            this.props.lofi.state.lofiSettings.visualizationId
          );
        });

        this.setState({
          visWindow,
          visualizationType: VISUALIZATION_TYPE.BIG,
        });
        break;
      case VISUALIZATION_TYPE.BIG:
        // there are OS-y ways of closing the window, so make sure it still exists before we attempt to close
        if (this.state.visWindow) {
          this.state.visWindow.destroy();
        }
        this.setState({
          visWindow: null,
          visualizationType: VISUALIZATION_TYPE.NONE,
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
      // Some tracks (notably, local ones) will not have album art provided via API
      if (
        this.state.currently_playing.currently_playing_type == 'track' &&
        this.state.currently_playing.item.album.images.length > 0
      ) {
        return this.state.currently_playing.item.album.images[0].url;
      } else if (this.state.currently_playing.currently_playing_type == 'ad') {
        // TODO: Cover art for ads?
        return '';
      } else if (
        this.state.currently_playing.currently_playing_type == 'episode'
      ) {
        // Podcasts fall into this category
        return this.state.currently_playing.item.images[0].url;
      }
    }
    return '';
  }

  getTrack() {
    if (this.state.currently_playing) {
      if (this.state.currently_playing.currently_playing_type == 'track') {
        return this.state.currently_playing.item.name;
      } else if (this.state.currently_playing.currently_playing_type == 'ad') {
        return 'Advertisement';
      } else if (
        this.state.currently_playing.currently_playing_type == 'episode'
      ) {
        // Podcasts fall into this category
        return this.state.currently_playing.item.name;
      }
    }
    return 'Nothing Playing';
  }

  getArtist() {
    if (this.state.currently_playing) {
      if (this.state.currently_playing.currently_playing_type == 'track') {
        return _.map(this.state.currently_playing.item.artists, 'name').join(
          ', '
        );
      } else if (this.state.currently_playing.currently_playing_type == 'ad') {
        return 'Spotify';
      } else if (
        this.state.currently_playing.currently_playing_type == 'episode'
      ) {
        // Podcasts fall into this category
        return this.state.currently_playing.item.description;
      }
    }
    return 'No artist information found...';
  }

  getPlayState() {
    if (this.state.currently_playing) {
      return this.state.currently_playing.is_playing;
    }
  }

  render() {
    return (
      <>
        <Menu parent={this} visIcon={this.visIconFromType()} />
        {this.state.currently_playing ? (
          <TrackInfo
            offset={this.props.lofi.state.side_length}
            persistent={this.props.settings.metadata}
            side={this.props.side}
            track={this.getTrack()}
            artist={this.getArtist()}
          />
        ) : null}
        <div
          className={'cover full ' + (this.getPlayState() ? '' : 'pause')}
          style={
            this.getCoverArt()
              ? { backgroundImage: 'url(' + this.getCoverArt() + ')' }
              : {}
          }
        />
        <RecreateChildOnPropsChange
          visType={this.state.visualizationType}
          visId={this.props.visualizationId}>
          <Visualizer
            visId={this.props.visualizationId}
            currentlyPlaying={this.state.currently_playing}
            show={this.state.visualizationType === VISUALIZATION_TYPE.SMALL}
          />
        </RecreateChildOnPropsChange>
        {this.state.currently_playing ? (
          <Controls parent={this} token={this.props.token} />
        ) : (
          <Waiting />
        )}
      </>
    );
  }
}

export default Cover;
