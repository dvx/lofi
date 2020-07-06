import * as React from 'react';
import './style.scss';

class TrackInfo extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div style={{right: this.props.side ? `calc(50% + ${this.props.offset / 2}px + 1.5em)` : ``, left: this.props.side ? `` : `calc(50% + ${this.props.offset / 2}px + 1.5em)`}} className={`not-draggable track-info ${this.props.side ? 'track-info-left' : 'track-info-right'} ${this.props.persistent ? 'always-show' : ''}` }>
        <div className='track not-draggable'>
          { this.props.track }
        </div>
        <div className='artist not-draggable'>
          { this.props.artist }
        </div>
      </div>
    );
  }
}

export default TrackInfo;
