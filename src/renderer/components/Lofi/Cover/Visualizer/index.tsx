import * as React from 'react';
import './style.scss';

import { volume } from '../../../../../../build/Release/volume.node';
import { visualizations } from '../../../../../visualizations/visualizations.js';

class Visualizer extends React.Component<any, any> {
  private canvasRef: React.RefObject<HTMLCanvasElement>;
  constructor(props: any) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    visualizations[this.props.visId].visualize(this.canvasRef.current, this.getMusicData.bind(this));
  }

  componentWillUnmount() {
    // NOTE: "Properly" doing refs with Typescript/React is so ugly...
    let gl = this.canvasRef.current.getContext('experimental-webgl');
    gl.canvas.getContext('webgl').getExtension('WEBGL_lose_context').loseContext();
  }

  getMusicData() {
    return {
      volume,
      cover_art: () => this.props.currentlyPlaying.cover_art,
      track: () => this.props.currentlyPlaying.track,
      artist: () => this.props.currentlyPlaying.artist,
    };
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        className={'cover full ' + (this.props.show ? 'show' : 'hide')}
        height="150"
        width="150"
        id="small-visualization"
      />
    );
  }
}

export default Visualizer;
