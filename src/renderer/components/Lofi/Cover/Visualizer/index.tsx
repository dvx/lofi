import * as React from 'react';
import './style.scss';

import { volume } from '../../../../../../build/release/volume.node';
import visualize from '../../../../../visualizations/rainbow-road/rainbow-road.visualization'

class Visualizer extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    visualize(this.refs.canvas, this.getMusicData.bind(this));
  }

  getMusicData() {
    return {
      cover_art: this.props.data.cover_art,
      volume,
      track: this.props.data.track,
      artist: this.props.data.artist
    };
  }

  render() {
    return (
        <canvas ref='canvas' className={'cover full ' + (this.props.show ? 'show' : 'hide')} height='150' width='150' id='small-visualization'/>
    );
  }
}

export default Visualizer;
