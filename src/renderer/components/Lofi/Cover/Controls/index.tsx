import * as React from 'react';
import * as settings from 'electron-settings';
import './style.scss';
import { SpotifyApiInstance } from '../../../../../api/spotify-api';

class Controls extends React.Component<any, any> {
  private accountType: string;
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    this.getUserAccountType();
  }

  async getUserAccountType() {
    const userProfile = await SpotifyApiInstance.fetch('/me', {
      method: 'GET',
    });

    this.accountType = userProfile.product;
  }

  async pausePlay() {
    if (this.props.parent.state.spotifyError) {
      return;
    }

    if (this.props.parent.getPlayState()) {
      SpotifyApiInstance.fetch('/me/player/pause', {
        method: 'PUT',
      });
    } else {
      SpotifyApiInstance.fetch('/me/player/play', {
        method: 'PUT',
      });
    }
    // Assume original state is correct and make UI a bit snappier
    this.props.parent.togglePlayPause();
  }

  async forward() {
    if (this.props.parent.state.spotifyError) {
      return;
    }

    SpotifyApiInstance.fetch('/me/player/next', {
      method: 'POST',
    }).then(() => {
      // Spotify API doesn't update fast enough sometimes, so give it some leeway
      setTimeout(this.props.parent.listeningTo.bind(this), 2000);
    });
    this.props.parent.setPlaying(true);
  }

  async backward() {
    if (this.props.parent.state.spotifyError) {
      return;
    }

    SpotifyApiInstance.fetch('/me/player/previous', {
      method: 'POST',
    }).then(() => {
      // Spotify API doesn't update fast enough sometimes, so give it some leeway
      setTimeout(this.props.parent.listeningTo.bind(this), 2000);
    });
    this.props.parent.setPlaying(true);
  }

  async like() {
    if (this.props.parent.state.spotifyError) {
      return;
    }

    const liked = this.props.parent.isTrackLiked();
    const id = this.props.parent.getTrackId();
    const verb = liked ? 'DELETE' : 'PUT';
    await SpotifyApiInstance.fetch('/me/tracks?ids=' + id, {
      method: verb,
    });

    this.props.parent.refreshTrackLiked();
  }

  renderVolumeLabel() {
    if (!this.props.parent.state.display_volume_change) {
      return;
    }

    const className = this.props.parent.state.volume_changed
      ? 'volume-number-show'
      : 'volume-number';

    return <label className={className}>{this.props.parent.getVolume()}</label>;
  }

  getBarThickness() {
    return (settings.getSync("lofi.window.bar_thickness") ?? 1) + 'px';
  }

  render() {
    let progressTop;
    if (settings.getSync("lofi.window.show_progress")) {
      progressTop = <div
        className="progress show"
        style={{ width: this.props.parent.getTrackProgress() + '%', height: this.getBarThickness() }}
      />;
    } else {
      progressTop = "";
    }
    return (
      <div className="controls-container">
        {progressTop}
        < div className="controls centered" >
          {
            this.accountType ? (
              <div className="controls-cluster">
                {this.accountType === 'premium' ? (
                  <p className="row">
                    <a
                      onClick={this.backward.bind(this)}
                      className="control-btn secondary-control not-draggable skip">
                      <i className="fa fa-step-backward not-draggable"></i>
                    </a>
                    <a
                      onClick={this.pausePlay.bind(this)}
                      className="control-btn not-draggable pause-play">
                      <i
                        className={
                          'fa not-draggable ' +
                          (this.props.parent.getPlayState()
                            ? 'fa-pause'
                            : 'fa-play')
                        }></i>
                    </a>
                    <a
                      onClick={this.forward.bind(this)}
                      className="control-btn secondary-control not-draggable skip">
                      <i className="fa fa-step-forward not-draggable"></i>
                    </a>
                    <a
                      onClick={this.like.bind(this)}
                      className="love-control-btn tertiary-control not-draggable">
                      <i
                        className={
                          (this.props.parent.isTrackLiked() ? 'fa' : 'far') +
                          ' fa-heart not-draggable'
                        }></i>
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null
          }
          <div
            className="progress"
            style={{ width: this.props.parent.getTrackProgress() + '%', height: this.getBarThickness() }}
          />
          < div
            className="volume"
            style={{ height: this.props.parent.getVolume() + '%', width: this.getBarThickness(), bottom: this.getBarThickness() }}>
            {this.renderVolumeLabel()}
          </div >
        </div >
      </div>
    );
  }
}

export default Controls;
