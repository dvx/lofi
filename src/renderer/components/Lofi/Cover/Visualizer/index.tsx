import * as React from 'react';
import './style.scss';

import visualize from '../../../../../visualizations/cube-test/cube-test.visualization'

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
      volume: this.props.data.volume,
      track: this.props.data.track,
      artist: this.props.data.artist
    };
  }

  render() {
    return (
        <canvas ref='canvas' height='150' width='150' id='small-visualization'/>
    );
  }
}

export default Visualizer;
