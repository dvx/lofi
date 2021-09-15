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
  precision mediump float;
  uniform float time;
  uniform float volume;
  uniform vec2 resolution;
  
  void main() {
      vec2 p = (gl_FragCoord.xy / resolution.xy) - .5;
      float sx = (0.01 + volume) * (p.x * p.x * 3. - (0.01 + volume)) * sin(10. * p.x - 5. * time * 0.005);
      gl_FragColor = vec4(.05, .0, (5. / (420. * abs(p.y + sx))), 1);
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
    gl.uniform1f(timeUniform, time);
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
  name: 'Blue Wave',
  visualize,
};
