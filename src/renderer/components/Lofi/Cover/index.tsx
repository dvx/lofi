import * as React from 'react';
import Menu from './../Menu';
import Controls from './Controls'
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
    this.setState({
      cover_art: currently_playing.item.album.images[0].url
    });
  }

  render() {
    return (
      <>
        <Menu />
        <div className='cover full' style={{ backgroundImage: 'url(' + this.state.cover_art + ')' }}>
          <Controls />
        </div>
      </>
    );
  }
}

export default Cover;
