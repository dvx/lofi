/*
    Seascape
    Based on: http://glslsandbox.com/e#52888.0 
    By: Alexander Alekseev aka TDM <tdmaav@gmail.com>
    Adapted by: David Bradbury
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
    uniform vec2 mouse;
    uniform vec2 resolution;
    uniform float volume;

    /*
    * "Seascape" by Alexander Alekseev aka TDM - 2014
    * License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
    * Contact: tdmaav@gmail.com
    */

    const int NUM_STEPS = 8;
    const float PI	 	= 3.141592;
    const float EPSILON	= 1e-3;
    #define EPSILON_NRM (0.1 / resolution.x)

    // sea
    const int ITER_GEOMETRY = 3;
    const int ITER_FRAGMENT = 5;
    const float SEA_CHOPPY = 4.0;
    const float SEA_SPEED = 0.8;
    const float SEA_FREQ = 0.16;
    const vec3 SEA_BASE = vec3(0.1,0.19,0.22);
    const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
    #define SEA_TIME (1.0 + time * SEA_SPEED)
    const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);

    // Moved from constant for visualization
    float SEA_HEIGHT = 4.0;

    // math
    mat3 fromEuler(vec3 ang) {
        vec2 a1 = vec2(sin(ang.x),cos(ang.x));
        vec2 a2 = vec2(sin(ang.y),cos(ang.y));
        vec2 a3 = vec2(sin(ang.z),cos(ang.z));
        mat3 m;
        m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
        m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
        m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
        return m;
    }
    float hash( vec2 p ) {
        float h = dot(p,vec2(127.1,311.7));	
        return fract(sin(h)*43758.5453123);
    }
    float noise( in vec2 p ) {
        vec2 i = floor( p );
        vec2 f = fract( p );	
        vec2 u = f*f*(3.0-2.0*f);
        return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                        hash( i + vec2(1.0,0.0) ), u.x),
                    mix( hash( i + vec2(0.0,1.0) ), 
                        hash( i + vec2(1.0,1.0) ), u.x), u.y);
    }

    // lighting
    float diffuse(vec3 n,vec3 l,float p) {
        return pow(dot(n,l) * 0.4 + 0.6,p);
    }
    float specular(vec3 n,vec3 l,vec3 e,float s) {    
        float nrm = (s + 8.0) / (PI * 8.0);
        return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
    }

    // sky
    vec3 getSkyColor(vec3 e) {
        e.y = max(e.y,0.0);
        return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
    }

    // sea
    float sea_octave(vec2 uv, float choppy) {
        uv += noise(uv);        
        vec2 wv = 1.0-abs(sin(uv));
        vec2 swv = abs(cos(uv));    
        wv = mix(wv,swv,wv);
        return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
    }

    float map(vec3 p) {
        float freq = SEA_FREQ;
        float amp = SEA_HEIGHT;
        float choppy = SEA_CHOPPY;
        vec2 uv = p.xz; uv.x *= 0.75;
        
        float d, h = 0.0;    
        for(int i = 0; i < ITER_GEOMETRY; i++) {        
            d = sea_octave((uv+SEA_TIME)*freq,choppy);
            d += sea_octave((uv-SEA_TIME)*freq,choppy);
            h += d * amp;        
            uv *= octave_m; freq *= 1.9; amp *= 0.22;
            choppy = mix(choppy,1.0,0.2);
        }
        return p.y - h;
    }

    float map_detailed(vec3 p) {
        float freq = SEA_FREQ;
        float amp = SEA_HEIGHT;
        float choppy = SEA_CHOPPY;
        vec2 uv = p.xz; uv.x *= 0.75;
        
        float d, h = 0.0;    
        for(int i = 0; i < ITER_FRAGMENT; i++) {        
            d = sea_octave((uv+SEA_TIME)*freq,choppy);
            d += sea_octave((uv-SEA_TIME)*freq,choppy);
            h += d * amp;        
            uv *= octave_m; freq *= 1.9; amp *= 0.22;
            choppy = mix(choppy,1.0,0.2);
        }
        return p.y - h;
    }

    vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {  
        float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);
        fresnel = pow(fresnel,3.0) * 0.65;
            
        vec3 reflected = getSkyColor(reflect(eye,n));    
        vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12; 
        
        vec3 color = mix(refracted,reflected,fresnel);
        
        float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);
        color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
        
        color += vec3(specular(n,l,eye,60.0));
        
        return color;
    }

    // tracing
    vec3 getNormal(vec3 p, float eps) {
        vec3 n;
        n.y = map_detailed(p);    
        n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
        n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
        n.y = eps;
        return normalize(n);
    }

    float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {  
        float tm = 0.0;
        float tx = 1000.0;    
        float hx = map(ori + dir * tx);
        if(hx > 0.0) return tx;   
        float hm = map(ori + dir * tm);    
        float tmid = 0.0;
        for(int i = 0; i < NUM_STEPS; i++) {
            tmid = mix(tm,tx, hm/(hm-hx));                   
            p = ori + dir * tmid;                   
            float hmid = map(p);
            if(hmid < 0.0) {
                tx = tmid;
                hx = hmid;
            } else {
                tm = tmid;
                hm = hmid;
            }
        }
        return tmid;
    }

    // main
    void main( void ) {
        SEA_HEIGHT = volume;
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;    
        float time = time * 0.3 + mouse.x*0.01;
            
        // ray
        vec3 ang = vec3(sin(time*3.0)*0.1,sin(time)*0.2+0.3,time);    
        vec3 ori = vec3(0.0,3.5,time*5.0);
        vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.15;
        dir = normalize(dir) * fromEuler(ang);
        
        // tracing
        vec3 p;
        heightMapTracing(ori,dir,p);
        vec3 dist = p - ori;
        vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
        vec3 light = normalize(vec3(0.0,1.0,0.8)); 
                
        // color
        vec3 color = mix(
            getSkyColor(dir),
            getSeaColor(p,n,light,dir,dist),
            pow(smoothstep(0.0,-0.05,dir.y),0.3));
            
        // post
        gl_FragColor = vec4(pow(color,vec3(0.75)), 1.0);
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
  name: 'Seascape',
  visualize,
};
