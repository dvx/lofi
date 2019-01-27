import * as React from 'react';
import './style.scss';

class TrackInfo extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={'not-draggable track-info ' + (this.props.side ? 'track-info-left' : 'track-info-right') }>
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
