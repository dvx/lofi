import * as React from 'react';
import './style.scss';

class Controls extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  async pausePlay() {
    let player = await (await fetch('https://api.spotify.com/v1/me/player', {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer '+ this.props.token
      })
    })).json();

    if (player.is_playing) {
      fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: new Headers({
          'Authorization': 'Bearer '+ this.props.token
        })
      });
    } else {
      fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: new Headers({
          'Authorization': 'Bearer '+ this.props.token
        })
      });
    }
  }

  async forward() {
    fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: new Headers({
        'Authorization': 'Bearer '+ this.props.token
      })
    });
  }

  async backward() {
    fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: new Headers({
        'Authorization': 'Bearer '+ this.props.token
      })
    });
  }

  render() {
    return (
      <div className='controls centered'>
        <p>
        <a onClick={this.backward.bind(this)} className='control-btn secondary-control not-draggable'><i className="fa fa-step-backward not-draggable"></i></a>
        <a onClick={this.pausePlay.bind(this)} className='control-btn not-draggable' ><i className="fa fa-play not-draggable pause-play"></i></a>
        <a onClick={this.forward.bind(this)} className='control-btn secondary-control not-draggable'><i className="fa fa-step-forward not-draggable"></i></a>
        </p>
      </div>
    );
  }
}

export default Controls;
