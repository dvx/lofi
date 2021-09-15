/*
    Rainbow Road
    Based on: http://glslsandbox.com/e#49166.0
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
  name: 'Rainbow Road',
  visualize,
};
