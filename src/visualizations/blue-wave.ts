import { VisualizeConfiguration } from './models';
import { VisualizationProgram, visualize } from './visualization';

export const blueWave = ({ canvas, timeFactor = 1000, peakFactor = 1 }: VisualizeConfiguration): void => {
  const program: VisualizationProgram = {
    fragmentShaderSource: `
        precision mediump float;
        uniform float time;
        uniform float volume;
        uniform vec2 resolution;
        
        void main() {
            vec2 p = (gl_FragCoord.xy / resolution.xy) - .5;
            float sx = (0.01 + volume) * (p.x * p.x * 3. - (0.01 + volume)) * sin(10. * p.x - 5. * time * 0.005);
            gl_FragColor = vec4(.05, .0, (5. / (420. * abs(p.y + sx))), 1);
        }
      `,
    timeFactor,
    peakFactor,
  };
  visualize(canvas, program);
};
