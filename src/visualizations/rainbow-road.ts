import { VisualizeConfiguration } from './models';
import { VisualizationProgram, visualize } from './visualization';

export const rainbowRoad = ({ canvas, timeFactor = 1000, peakFactor = 1 }: VisualizeConfiguration): void => {
  const program: VisualizationProgram = {
    fragmentShaderSource: `
    // - glslfan.com 
    //        <meta name="description" content="glslfan is a platform that can broadcast the live coding of GLSL shaders.">
    //        <meta name="keywords" content="GLSL,shader,WebGL,live coding,bloadcast">
    
    precision mediump float;
    uniform vec2  resolution;
    uniform float  volume;
    uniform float time;
    
    const float PI = 3.1415926;
    
    vec3 rgb2hsv(vec3 hsv){
        vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(vec3(hsv.x) + t.xyz) * 6.0 - vec3(t.w));
        return hsv.z * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), hsv.y);
    }
    
    float dist(vec3 pos)
    {
        pos.x += sin(pos.z * 0.2+ time * 10.0);
        pos.x = mod(pos.x, 4.0) - 2.0;
        return length(pos.yx) - 0.01;
    }
    
    vec3 calcNormal(vec3 pos)
    {
        vec2 ep = vec2(0.001, 0.0);
        return normalize(vec3(
            dist(pos + ep.xyy) - dist(pos - ep.xyy),
            dist(pos + ep.yxy) - dist(pos - ep.yxy),
            dist(pos + ep.yyx) - dist(pos - ep.yyx)
        ));
    }
    
    vec3 calcColor(vec3 pos)
    {
        return rgb2hsv(vec3(pos.x * 0.2, 1, 1));
    }
    
    void main(){
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / resolution.y;
        
        vec3 pos = vec3(0, 5.0, -5);
        vec3 dir = normalize(vec3(p, 1.0));
        
        vec3 color = vec3(0, 0, 0) * length(p.xy) * sin(time * 10.0);
        
        float depth = 0.0;
        for (int i = 0; i < 64; ++i)
        {
            float d = dist(pos);
            pos += dir * d * 0.5;
            color += .02 * (0.1 + volume) / d * calcColor(pos);
            
            depth = float(i);
        }
        // mix(color, vec3(1.0, 1.0, 1.0), depth / 64.0)
        
        gl_FragColor = vec4(color, 1.0);
    }
    `,
    timeFactor,
    peakFactor,
  };
  visualize(canvas, program);
};
