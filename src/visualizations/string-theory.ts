import { VisualizeConfiguration } from './models';
import { VisualizationProgram, visualize } from './visualization';

export const stringTheory = ({ canvas, timeFactor = 1000, peakFactor = 1 }: VisualizeConfiguration): void => {
  const program: VisualizationProgram = {
    fragmentShaderSource: `
    #ifdef GL_ES
    precision mediump float;
    #endif
    
    uniform float time;
    uniform vec2 resolution;
    uniform float volume;
    
    #define PI 3.141593
    
    float atan2(in float y, in float x)
    {
        return x == 0.0 ? sign(y)*PI/2. : atan(y, x);
    }
    
    void main( void ) {
        vec2 p = ( gl_FragCoord.xy / resolution.xy ) - 0.5; 
        p.x *= resolution.x / resolution.y;
        p *= 4.;
        float a = atan2(p.y, p.x);
        float r = 2.0;
        float wr = 3. * volume;
        float ws = 1.;
        float wn = 5.;
    
        float c = length(p) - r - wr * sin(wn * a - ws * time) + wr * sin(20. * a - 10.*time);
        c = 0.1 / abs(c);
        gl_FragColor = vec4(c*(p.x+r),1.*c,c,1.);
    }
    `,
    timeFactor,
    peakFactor,
  };
  visualize(canvas, program);
};
