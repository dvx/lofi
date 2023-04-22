import { volume } from '../../build/Release/volume.node';

export interface VisualizationProgram {
  fragmentShaderSource: string;
  timeFactor: number;
  peakFactor: number;
}

const VERTICES = [-1, 1, 0.0, -1, -1, 0.0, 1, -1, 0.0, 1, 1, 0.0];
const INDICES = [3, 2, 1, 3, 1, 0];
const VERTEX_SHADER_SOURCE = `
      attribute vec3 coordinates;
      void main(void) {
          gl_Position = vec4(coordinates, 1.0);
      }
    `;

const createShader = (gl: WebGLRenderingContext, sourceCode: string, type: number): WebGLShader => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw new Error(`Error compiling web gl shader. \n\n${info}`);
  }

  return shader;
};

export const visualize = (
  canvas: HTMLCanvasElement,
  { fragmentShaderSource, timeFactor, peakFactor }: VisualizationProgram
): void => {
  const gl = canvas.getContext('webgl');

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(INDICES), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  const vertexShader = createShader(gl, VERTEX_SHADER_SOURCE, gl.VERTEX_SHADER);
  const fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw new Error(`program failed to link:${gl.getProgramInfoLog(program)}`);
  }
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const coord = gl.getAttribLocation(program, 'coordinates');
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);

  const timeUniform = gl.getUniformLocation(program, 'time');
  const volumeUniform = gl.getUniformLocation(program, 'volume');
  const resolutionUniform = gl.getUniformLocation(program, 'resolution');

  const peaks: number[] = [];
  const animate = (time: number): void => {
    if (peaks.length >= 10) {
      peaks.shift();
    }
    peaks.push(volume());

    // average over the last 5 peaks (~100ms)
    // should probably be done in the shader
    const avg = peaks.reduce((prev, curr) => prev + curr) / peaks.length / peakFactor;

    gl.uniform2fv(resolutionUniform, [canvas.width, canvas.height]);
    gl.uniform1f(timeUniform, time / timeFactor);
    gl.uniform1f(volumeUniform, avg);
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, INDICES.length, gl.UNSIGNED_SHORT, 0);
    window.requestAnimationFrame(animate);
  };
  animate(0);
};
