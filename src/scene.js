import { AmbientLight, BoxGeometry, Clock, DirectionalLight, Group, IcosahedronGeometry, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three';

const THREE = { AmbientLight, BoxGeometry, Clock, DirectionalLight, Group, IcosahedronGeometry, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer };

// Fundo em three.js renderizado em baixa resolução e ampliado com nearest-neighbor:
// aurora estilo Windows 7 com dithering, bolhas do protetor de tela e blocos voxel.

// tamanho do "pixel" na tela: cresce em telas grandes para limitar o custo de GPU
const pixSize = () => Math.max(3, Math.ceil(Math.max(innerWidth, innerHeight) / 640));
let FRAME = 1 / 30; // 30 fps bastam para pixel art (cai para 15 em máquina lenta)

const bgVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`;

const bgFrag = /* glsl */ `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
varying vec2 vUv;

float bayer(vec2 p){
  int x = int(mod(p.x, 4.0)); int y = int(mod(p.y, 4.0));
  int i = x + y * 4;
  float m[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return m[i] / 16.0;
}

void main(){
  vec2 uv = vUv;
  float t = uTime;
  float aspect = uRes.x / uRes.y;
  vec3 top = vec3(0.01, 0.07, 0.20);
  vec3 mid = vec3(0.03, 0.25, 0.55);
  vec3 bot = vec3(0.10, 0.55, 0.85);
  vec3 col = mix(bot, mid, smoothstep(0.0, 0.45, uv.y));
  col = mix(col, top, smoothstep(0.45, 1.0, uv.y));

  // feixes de luz (Aurora)
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float y = 0.50 - fi * 0.055
      + 0.10 * sin(uv.x * 2.6 + t * 0.30 + fi * 1.3)
      + 0.04 * sin(uv.x * 6.5 - t * 0.45 + fi * 2.1)
      + (uMouse.y - 0.5) * 0.04;
    float d = uv.y - y;
    float core = exp(-d * d * 2200.0);
    float halo = exp(-d * d * 90.0) * 0.22;
    vec3 c = mix(vec3(0.45, 0.85, 1.0), vec3(0.55, 1.0, 0.85), fi / 4.0);
    float fade = smoothstep(0.0, 0.25, uv.x) * smoothstep(1.0, 0.7, uv.x * 0.9 + 0.1 * sin(t * 0.2 + fi));
    col += c * (core * 0.85 + halo) * fade * (0.9 - fi * 0.12);
  }

  // clarão inferior
  vec2 q = (uv - vec2(0.5 + (uMouse.x - 0.5) * 0.05, -0.05)) * vec2(aspect, 1.0);
  col += vec3(0.25, 0.65, 1.0) * exp(-length(q) * 2.0) * 0.55;

  // vinheta
  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 0.7;

  // quantização com dithering ordenado (cara de pixel art)
  float levels = 9.0;
  float b = bayer(gl_FragCoord.xy) - 0.5;
  col = floor(col * levels + b + 0.5) / levels;
  gl_FragColor = vec4(col, 1.0);
}`;

const bubbleVert = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const bubbleFrag = /* glsl */ `
uniform float uHue;
varying vec3 vN;
varying vec3 vV;
vec3 hue(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main(){
  float f = 1.0 - max(dot(vN, vV), 0.0);
  float rim = pow(f, 2.2);
  vec3 film = hue(uHue + f * 0.9);
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float spec = pow(max(dot(reflect(-L, vN), vV), 0.0), 40.0);
  vec3 col = film * rim * 1.1 + vec3(1.0) * spec * 1.2;
  float a = clamp(rim * 0.9 + spec, 0.04, 1.0);
  col = floor(col * 6.0 + 0.5) / 6.0;
  gl_FragColor = vec4(col, a);
}`;

const TETROS = [
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [1, 1], [2, 1]],
];
const TCOL = [0x46c04a, 0xffd95a, 0x2f7fe0, 0xe5483b, 0xa66bff, 0x2bd1a6];

export function startScene(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
  } catch (e) {
    canvas.classList.add('no-webgl');
    return { setFocus() {} };
  }
  renderer.setPixelRatio(1);
  // WebGL por software (sem GPU) deixa tudo lento: nesse caso nem tenta, o main.js usa a versão estática
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) {
      renderer.dispose();
      return { setFocus() {}, hold() {}, slow: true };
    }
  } catch { /* segue */ }
  let mult = 1;
  let onSlow = () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const bgMat = new THREE.ShaderMaterial({
    vertexShader: bgVert,
    fragmentShader: bgFrag,
    uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) } },
    depthWrite: false,
    depthTest: false,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  scene.add(new THREE.AmbientLight(0x9cc8ff, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-4, 6, 8);
  scene.add(sun);

  // Blocos voxel (aceno ao jogo de blocos do GitHub e a "dados em blocos")
  const box = new THREE.BoxGeometry(0.9, 0.9, 0.9);
  const pieces = [];
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    const shape = TETROS[i % TETROS.length];
    const mat = new THREE.MeshLambertMaterial({ color: TCOL[i % TCOL.length], flatShading: true });
    shape.forEach(([x, y]) => {
      const m = new THREE.Mesh(box, mat);
      m.position.set(x - 1, y - 0.5, 0);
      g.add(m);
    });
    g.scale.setScalar(0.55 + Math.random() * 0.35);
    g.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12, -4 - Math.random() * 6);
    g.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    g.userData = {
      vy: 0.25 + Math.random() * 0.35,
      rx: (Math.random() - 0.5) * 0.6,
      ry: (Math.random() - 0.5) * 0.6,
    };
    scene.add(g);
    pieces.push(g);
  }

  // Bolhas (protetor de tela clássico)
  const sphere = new THREE.IcosahedronGeometry(1, 2);
  const bubbles = [];
  for (let i = 0; i < 6; i++) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: bubbleVert,
      fragmentShader: bubbleFrag,
      uniforms: { uHue: { value: Math.random() } },
      transparent: true,
      depthWrite: false,
    });
    const m = new THREE.Mesh(sphere, mat);
    const s = 0.9 + Math.random() * 1.3;
    m.scale.setScalar(s);
    m.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4);
    m.userData = { v: new THREE.Vector3((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.2, 0), r: s };
    scene.add(m);
    bubbles.push(m);
  }

  const mouse = new THREE.Vector2(0.5, 0.5);
  window.addEventListener('pointermove', (e) => {
    mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
  });

  let bounds = { x: 10, y: 6 };
  function resize() {
    const px = Math.ceil(pixSize() * mult);
    const w = Math.max(1, Math.ceil(innerWidth / px));
    const h = Math.max(1, Math.ceil(innerHeight / px));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bgMat.uniforms.uRes.value.set(w, h);
    const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    bounds = { x: (vh * camera.aspect) / 2, y: vh / 2 };
  }
  window.addEventListener('resize', resize);
  resize();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  let raf = 0, acc = 0, calm = false;

  function step(dt) {
    bgMat.uniforms.uTime.value = clock.elapsedTime;
    bgMat.uniforms.uMouse.value.lerp(mouse, 0.08);

    pieces.forEach((g) => {
      const u = g.userData;
      g.position.y += u.vy * dt;
      g.rotation.x += u.rx * dt;
      g.rotation.y += u.ry * dt;
      if (g.position.y > bounds.y + 4) {
        g.position.y = -bounds.y - 4;
        g.position.x = (Math.random() - 0.5) * bounds.x * 2.2;
      }
    });

    bubbles.forEach((m, i) => {
      const u = m.userData;
      m.position.addScaledVector(u.v, dt);
      const bx = bounds.x - u.r, by = bounds.y - u.r;
      if (m.position.x > bx) { m.position.x = bx; u.v.x *= -1; }
      if (m.position.x < -bx) { m.position.x = -bx; u.v.x *= -1; }
      if (m.position.y > by) { m.position.y = by; u.v.y *= -1; }
      if (m.position.y < -by) { m.position.y = -by; u.v.y *= -1; }
      m.material.uniforms.uHue.value = (m.material.uniforms.uHue.value + dt * 0.03) % 1;
      for (let j = i + 1; j < bubbles.length; j++) {
        const o = bubbles[j];
        const d = m.position.distanceTo(o.position);
        const min = u.r + o.userData.r;
        if (d < min && d > 0.001) {
          tmp.copy(o.position).sub(m.position).normalize();
          const push = (min - d) / 2;
          m.position.addScaledVector(tmp, -push);
          o.position.addScaledVector(tmp, push);
          const a = u.v.dot(tmp), b = o.userData.v.dot(tmp);
          u.v.addScaledVector(tmp, b - a);
          o.userData.v.addScaledVector(tmp, a - b);
        }
      }
    });

    camera.position.x += ((mouse.x - 0.5) * 1.2 - camera.position.x) * 0.06;
    camera.position.y += ((mouse.y - 0.5) * 0.8 - camera.position.y) * 0.06;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  const tmp = new THREE.Vector3();

  // governador: mede quanto cada quadro custa e reduz a qualidade se a máquina sofrer
  let ema = 0;
  let frames = 0;
  let level = 0;
  let holdUntil = 0;
  function govern(ms) {
    ema = ema ? ema * 0.9 + ms * 0.1 : ms;
    if (++frames < 45) return;
    if (level === 0 && ema > 10) { level = 1; FRAME = 1 / 15; mult = 1.6; resize(); frames = 0; ema = 0; return; }
    if (level === 1 && ema > 18) { level = 2; calm = true; onSlow(); }
  }

  function loop() {
    raf = 0;
    if (document.hidden || calm) return; // parado: nada de GPU enquanto não aparece
    const now = performance.now();
    if (now < holdUntil) { raf = requestAnimationFrame(loop); return; } // janela abrindo: prioridade para ela
    acc += Math.min(clock.getDelta(), 0.1);
    if (acc >= FRAME) {
      step(Math.min(acc, 0.05));
      acc = 0;
      govern(performance.now() - now);
    }
    raf = requestAnimationFrame(loop);
  }
  const wake = () => { if (!raf && !reduce && !document.hidden && !calm && level < 2) { clock.getDelta(); raf = requestAnimationFrame(loop); } };

  clock.getDelta();
  step(0);
  wake();
  document.addEventListener('visibilitychange', wake);

  return {
    // com janela maximizada a cena congela (menos distração, zero GPU)
    setFocus(c) { if (level < 2) { calm = c; wake(); } },
    // pausa curta enquanto uma janela abre (a animação dela fica lisa)
    hold(ms = 600) { holdUntil = performance.now() + ms; },
    // chamado se a máquina não aguentar nem a versão leve
    onSlow(fn) { onSlow = fn; },
  };
}
