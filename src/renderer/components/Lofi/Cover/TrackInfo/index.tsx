import * as React from 'react';
import './style.scss';

class TrackInfo extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
        <div className='track-info-left track-info'>
            <div className='track'>
                { this.props.track }
            </div>
            <div className='artist'>
                { this.props.artist }
            </div>
        </div>
    );
  }
}

export default TrackInfo;
