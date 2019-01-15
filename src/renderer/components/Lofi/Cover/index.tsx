import * as React from 'react';
import * as _ from 'lodash';
import Menu from './../Menu';
import Controls from './Controls';
import TrackInfo from './TrackInfo';
import './style.scss';

class Cover extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      cover_art: ''
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
      track: currently_playing.item.album.name,
      artist: _.map(currently_playing.item.artists, 'name').join(", ")
    });
  }

  render() {
    return (
      <>
        <Menu />
        <TrackInfo track={this.state.track} artist={this.state.artist} />
        <div className='cover full' style={{ backgroundImage: 'url(' + this.state.cover_art + ')' }}>
        </div>
        <Controls />
      </>
    );
  }
}

export default Cover;
