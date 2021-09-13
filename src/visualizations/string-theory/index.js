/*
    String Theory
    Based on: http://glslsandbox.com/e#51235.0
*/
function visualize(canvas, getMusicData) {
  var peaks = [];
  var gl = canvas.getContext('experimental-webgl');

  var vertices = [-1, 1, 0.0, -1, -1, 0.0, 1, -1, 0.0, 1, 1, 0.0];

  var indices = [3, 2, 1, 3, 1, 0];

  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var index_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  var vertex_shader_prog = `
      attribute vec3 coordinates;
      void main(void) {
          gl_Position = vec4(coordinates, 1.0);
      }
    `;

  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertex_shader_prog);
  gl.compileShader(vertShader);

  var fragment_shader_prog = `
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
    `;

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragment_shader_prog);
  gl.compileShader(fragShader);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  var coord = gl.getAttribLocation(shaderProgram, 'coordinates');
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  var timeUniform = gl.getUniformLocation(shaderProgram, 'time');
  var volumeUniform = gl.getUniformLocation(shaderProgram, 'volume');
  var resolutionUniform = gl.getUniformLocation(shaderProgram, 'resolution');

  var animate = function (time) {
    if (peaks.length >= 10) {
      peaks.shift(1);
    }
    peaks.push(getMusicData().volume());

    // average over the last 5 peaks (~100ms)
    // should probably be done in the shader
    var avg = peaks.reduce((prev, curr) => prev + curr) / peaks.length;

    gl.uniform2fv(resolutionUniform, [canvas.width, canvas.height]);
    gl.uniform1f(timeUniform, time / 1000);
    gl.uniform1f(volumeUniform, avg);
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    window.requestAnimationFrame(animate);
  };
  animate(0);
}

export default {
  name: 'String Theory',
  visualize,
};
