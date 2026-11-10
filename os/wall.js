// HD animated wallpaper: a flowing aurora drawn by a small WebGL shader at screen
// resolution. Falls back to the CSS gradient in os.css when WebGL is missing, and
// draws a single still frame when the visitor prefers reduced motion.
(() => {
  const host = document.getElementById("wall");
  if (!host) return;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) return;

  const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const fs = `precision highp float;
uniform vec2 r;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<6;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r.y;float T=t*.035;
  vec2 q=vec2(fbm(uv*1.3+T),fbm(uv*1.3+vec2(5.2,1.3)-T));
  vec2 w=vec2(fbm(uv*1.5+3.*q+vec2(1.7,9.2)+T*1.3),fbm(uv*1.5+3.*q+vec2(8.3,2.8)-T));
  float f=fbm(uv*1.7+3.4*w);
  vec3 c=mix(vec3(.015,.03,.09),vec3(.04,.17,.48),clamp(f*f*2.4,0.,1.));
  c=mix(c,vec3(.42,.22,.82),clamp(length(q)*.6-.25,0.,1.));
  c=mix(c,vec3(.2,.72,1.),clamp(pow(w.x,3.2)*1.5,0.,1.));
  c+=vec3(.55,.75,1.)*.10*smoothstep(.62,1.,f);
  vec2 v=gl_FragCoord.xy/r-.5;c*=1.-.6*dot(v,v);
  gl_FragColor=vec4(c,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t");

  host.append(canvas);
  host.classList.add("is-live");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    canvas.width = Math.round(innerWidth * scale);
    canvas.height = Math.round(innerHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uR, canvas.width, canvas.height);
    if (still) draw(40);
  }
  function draw(time) { gl.uniform1f(uT, time); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
  addEventListener("resize", resize);
  resize();
  if (still) return;
  const t0 = performance.now();
  (function frame(now) {
    if (!document.hidden) draw((now - t0) / 1000 + 40);
    requestAnimationFrame(frame);
  })(t0);
})();
