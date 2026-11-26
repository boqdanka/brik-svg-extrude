import * as THREE from 'https://esm.sh/three@0.170.0';
import { OrbitControls } from 'https://esm.sh/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import { SVGLoader } from 'https://esm.sh/three@0.170.0/examples/jsm/loaders/SVGLoader.js';
import { mergeVertices, toCreasedNormals, mergeGeometries } from 'https://esm.sh/three@0.170.0/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';
/* ============================================================================================
SVG EXTRUDE 3D: a flat SVG shape extruded and dressed in ten materials (standard, balloon,
clay, fur, light/dark stone with moss, metal, dither print, knit, glass). Drag to turn the
shape, right-drag or Shift-drag to move it, Ctrl/Shift + wheel to scale it.
State. Brik owns the controls. This file keeps its own working store (ST) for everything the
shape code reads (it also holds each material's remembered light settings and the internal
flags), and mirrors the controls that Brik shows to the user in both directions.
============================================================================================ */
const STONEKEYS = ['stoneColor', 'stoneColor2', 'stoneColor3', 'stoneRust', 'stonePatina', 'stoneTone', 'stoneDetail', 'stoneGrain', 'stoneGrainSize', 'stoneWear', 'stoneAO', 'stoneCracks', 'stoneIntensity', 'stoneScale', 'stoneSharp', 'stoneTilt', 'stoneEdge', 'stoneRough', 'stoneSeed', 'stonePores', 'stonePoreSize', 'stoneDirt', 'stoneBump', 'stoneTexScale', 'stoneMossOn', 'stoneMossAmt', 'stoneMossScale', 'stoneMossFuzz', 'stoneMossColor', 'stoneMossColor2', 'stoneMossTop', 'stoneMossBump', 'stoneMossDrip', 'stoneMossHeight', 'stoneMossBubble'];
const BRIK_KEYS = ["deformPreset","logo","depth","bevel","bevelSmooth","poseX","poseY","poseS","logoRotX","logoRotY","logoRotZ","motionEnabled","motion","loopTurns","loopDur","loopPause","rotAxis","speed","envPreset","lightPreset","envIntensity","lightIntensity","metalEnvRot","metalEnvSoft","shadow","colorStandard","glassLens","glassBend","glassLD","glassCA","glassIor","glassDisp","glassThick","glassTint","glassAbs","glassRainbow","glassFrost","glassScrA","glassScrS","glassEdge","glassBack","knitMode","knitCount","knitWeight","knitPlies","knitTwist","knitFuzz","knitHair","knitHairLen","knitHeather","knitIrreg","knitPattern","knitMistakes","knitUneven","knitSoft","knitInflate","knitSeed","knitPalette","knitImage","knitImgMode","knitImgScale","knitY1","knitY2","knitY3","knitY4","knitY5","knitY6","knitEmb","knitEAng","knitEDen","knitEH","knitThread","colorMetal","metalRough","metalAniso","metalBrushDir","metalBrushStrength","metalScratch","metalGrain","metalEdge","metalRound","metalInflate","colorBalloon","balloonGloss","colorBalloonShadow","balloonShadowAmt","balloonInflate","balloonZBulge","balloonXYGrow","balloonRoundness","balloonPinch","balloonWrinkleFreq","balloonWrinkleDepth","balloonFold","balloonFoldFreq","balloonStar","colorCrumpled","clayMatte","clayTex","clayColor2","clayMott","clayMottSize","clayGrain","clayGrainSize","clayLump","clayLumpSize","clayPits","clayPitSize","clayCrack","clayDust","clayBump","crumpleIntensity","crumpleScale","crumpleDetail","stoneMossOn","stoneMossHeight","stoneMossBubble","stoneMossAmt","stoneMossTop","stoneMossDrip","stoneMossScale","stoneMossFuzz","stoneMossBump","stoneMossColor","stoneMossColor2","stoneColor","stoneColor2","stoneColor3","stoneRust","stonePatina","stoneTone","stoneDetail","stoneGrain","stoneGrainSize","stoneWear","stoneAO","stoneCracks","stoneIntensity","stoneScale","stoneSharp","stoneTilt","stoneEdge","stoneRough","stoneSeed","stonePores","stonePoreSize","stoneDirt","stoneBump","stoneTexScale","furColor","furBevel","furBevelSmooth","furLength","furFluff","furGravity","furThickness","furBlur","furPattern","furPatMix","furPatScale","furVariation","furClump","furFlow","furLayers","ditherBase","ditherScope","ditherMode","ditherGrain","ditherAmt","ditherShadow","ditherNoise","ditherSpecks","ditherEdge","ditherCap","ditherInk","ditherSeed","ditherPaper","mlMode","mlShow","ml1On","ml1Col","ml1Int","ml1Conc","ml1Soft","ml1X","ml1Y","ml1Z","ml1Shad","ml2On","ml2Col","ml2Int","ml2Conc","ml2Soft","ml2X","ml2Y","ml2Z","ml2Shad","ml3On","ml3Col","ml3Int","ml3Conc","ml3Soft","ml3X","ml3Y","ml3Z","ml3Shad","ml4On","ml4Col","ml4Int","ml4Conc","ml4Soft","ml4X","ml4Y","ml4Z","ml4Shad","bgShadow","bgShadowOpacity","bgShadowDist","bgShadowSoft","perspOn","persp","transOn","transEffect","transDur"];
const controls = globalThis.__brikControls || globalThis.controls;
const ST = (() => {
const _v = {"deformPreset":"fur","depth":168,"bevel":0,"bevelSmooth":1,"balloonEnabled":false,"balloonInflate":2,"balloonZBulge":0.68,"balloonXYGrow":3,"balloonRoundness":0.6,"balloonPinch":1,"balloonWrinkleFreq":2.2,"balloonWrinkleDepth":0.8,"crumpleEnabled":false,"crumpleIntensity":0.61,"crumpleScale":6,"crumpleDetail":0.48,"furEnabled":true,"furLength":2.6,"furDensity":420,"furFluff":1,"furGravity":1,"furClump":0.7,"furFlow":0.8,"furThickness":0.55,"furVariation":0.8,"furLayers":40,"furColor":"#A5A5A5","logo":"","size":1.5,"logoPos":{"x":0,"y":0},"envIntensity":2.05,"lightIntensity":0.4,"shadow":false,"motionEnabled":true,"motion":"loop","loopTurns":2,"loopDur":7,"loopPause":0.6,"speed":0.6,"rotAxis":"y","perspOn":true,"persp":0.2609,"cameraState":{"version":1,"position":[0.09687860756568889,-0.03743625519721664,4.656793597176543],"target":[0.09687860756568889,-0.03743625519721664,0.0403001419429367],"zoom":1,"fov":35},"bgMode":"transparent","ditherOutline":1,"ditherEdge":0.45,"ditherCap":0.92,"logoRotX":-3.2,"logoRotY":42,"logoRotZ":0,"poseX":0.13999999999999999,"poseY":-0.04000000000000001,"poseS":1.3,"transOn":true,"transEffect":"dissolve","transDur":1.6,"bgShadow":true,"bgShadowOpacity":0.35,"bgShadowDist":0.6,"bgShadowSoft":3,"bgNoise":0,"bgNoiseSize":1,"ditherScope":"logo","ditherBase":"standard","ditherMode":"bit","ditherGrain":2,"ditherAmt":1.3,"ditherShadow":0.12,"ditherNoise":"white","ditherSpecks":0.5,"ditherInk":"#000000","ditherPaper":"#ffffff","ditherSeed":1,"clayMatte":0.9,"clayTex":true,"clayGrain":0.6,"clayGrainSize":1,"clayLump":0.6,"clayLumpSize":1,"clayPits":0.45,"clayPitSize":1,"clayMott":0.5,"clayMottSize":1,"clayColor2":"#a96a4c","clayDust":0.25,"clayCrack":0.25,"clayBump":1,"furPattern":"","furPatMix":1,"furPatScale":1,"colorBalloonShadow":"#2b2b33","balloonShadowAmt":0.7,"balloonGloss":0.9,"colorStandard":"#d4d7dc","colorBalloon":"#d4d7dc","colorCrumpled":"#d08f6c","colorMetal":"#dce1e9","balloonFold":0.8,"balloonFoldFreq":1.5,"balloonStar":0.8,"furBlur":0.35,"envPreset":"room","lightPreset":"default","metalRough":0.16,"metalAniso":0.2,"metalBrushDir":0,"metalBrushStrength":0.12,"metalScratch":0.9,"metalGrain":1,"metalEdge":0.5,"metalInflate":0,"metalEnvRot":0,"metalEnvSoft":0.25,"furBevel":16,"furBevelSmooth":6,"stoneEnabled":false,"stoneCracks":0,"stoneIntensity":0.8,"stoneScale":5,"stoneSharp":6,"stoneTilt":0.8,"stoneEdge":0.6,"stoneRough":0.3,"stoneSeed":7,"stoneColor":"#58524d","stonePores":0.4,"stonePoreSize":1,"stoneDirt":0.3,"stoneBump":1.3,"stoneTexScale":1,"stoneColor2":"#8a6244","stoneColor3":"#a9a7b0","stoneRust":0.55,"stonePatina":0.5,"stoneDetail":0.8,"stoneGrain":0.8,"stoneGrainSize":1,"stoneWear":0.7,"stoneAO":0.7,"stoneTone":1.25,"glassBend":1.3,"glassCA":1.2,"glassLD":0.6,"glassLens":1.25,"glassIor":1.65,"glassDisp":0.02,"glassThick":3,"glassTint":"#8f9bb5","glassAbs":0.55,"glassRainbow":0.5,"glassFrost":0,"glassScrA":0.2,"glassScrS":1,"glassEdge":0.65,"knitMode":"auto","knitHair":0.5,"knitHairLen":0.5,"knitPalette":"lavender","knitImage":"","knitImgMode":"quant","knitImgScale":1,"knitSoft":1,"knitPattern":"stock","knitMistakes":0.04,"knitUneven":0.5,"knitCount":16,"knitWeight":1.2,"knitPlies":2,"knitTwist":0.55,"knitFuzz":0.5,"knitHeather":0.35,"knitIrreg":0.4,"knitInflate":0.55,"knitSeed":3,"knitY1":"#b98ad9","knitY2":"#f1eee7","knitY3":"#a84f2e","knitY4":"#c99a3e","knitY5":"#8eb2c4","knitY6":"#34503f","knitEmb":"off","knitEAng":70,"knitEDen":1,"knitEH":1,"knitThread":"#f4f1ee","mlMode":"off","mlShow":true,"ml1On":true,"ml1X":4,"ml1Y":5,"ml1Z":6,"ml1Col":"#ffffff","ml1Int":1.5,"ml1Conc":0.35,"ml1Soft":0.6,"ml1Shad":false,"ml2On":false,"ml2X":-5,"ml2Y":3,"ml2Z":4,"ml2Col":"#ffd2a0","ml2Int":1,"ml2Conc":0.35,"ml2Soft":0.6,"ml2Shad":false,"ml3On":false,"ml3X":0,"ml3Y":-4,"ml3Z":5,"ml3Col":"#a8c8ff","ml3Int":1,"ml3Conc":0.35,"ml3Soft":0.6,"ml3Shad":false,"ml4On":false,"ml4X":0,"ml4Y":6,"ml4Z":-5,"ml4Col":"#ffffff","ml4Int":1.5,"ml4Conc":0.35,"ml4Soft":0.6,"ml4Shad":false,"stoneMossOn":true,"stoneMossAmt":0.7,"stoneMossScale":4,"stoneMossFuzz":1.5,"stoneMossColor":"#3F5A1C","stoneMossColor2":"#5E7029","stoneMossTop":0.3,"stoneMossBump":0,"stoneMossDrip":0.5,"stoneMossHeight":1.1,"stoneMossBubble":0.3,"metalRound":0,"glassBack":"#ffffff"};
const MAT_ENV = {"standard":["room","default",2.05,0.4],"balloon":["studio","default",2.05,0.4],"crumpled":["neutral","soft",2.05,0.4],"fur":["room","default",2.05,0.4],"lightstone":["room","default",2.05,0.4],"darkstone":["room","default",2.05,0.4],"metal":["studio","default",2.05,0.4],"dither":["room","default",0.5,1.6],"knit":["studio","side",1.2,0.5],"glass":["studio","default",1,0.5]};
for (const pr in MAT_ENV) {
const [ep, lp, ei, li] = MAT_ENV[pr];
Object.assign(_v, { ['envPreset__' + pr]: ep, ['lightPreset__' + pr]: lp, ['envIntensity__' + pr]: ei, ['lightIntensity__' + pr]: li, ['metalEnvRot__' + pr]: 0, ['metalEnvSoft__' + pr]: 0.25 });
const moss = pr === 'lightstone' || pr === 'darkstone' ? {"stoneMossOn":true,"stoneMossAmt":0.7,"stoneMossScale":4,"stoneMossFuzz":1.5,"stoneMossColor":"#3F5A1C","stoneMossColor2":"#5E7029","stoneMossTop":0.3,"stoneMossBump":0,"stoneMossDrip":0.5,"stoneMossHeight":1.1,"stoneMossBubble":0.3} : {"stoneMossOn":false,"stoneMossAmt":0.55,"stoneMossScale":1,"stoneMossFuzz":0.8,"stoneMossColor":"#3a6612","stoneMossColor2":"#a8d02c","stoneMossTop":0.6,"stoneMossBump":1,"stoneMossDrip":1.4,"stoneMossHeight":0.8,"stoneMossBubble":0.7};
for (const k of STONEKEYS) _v[k + '__' + pr] = k in moss ? moss[k] : _v[k];
}
for (const k of BRIK_KEYS) { const v = controls.get(k); if (v !== undefined && v !== null) _v[k] = v; }
const pr0 = _v.deformPreset;
for (const k of ['envPreset', 'lightPreset', 'envIntensity', 'lightIntensity', 'metalEnvRot', 'metalEnvSoft', ...STONEKEYS]) _v[k + '__' + pr0] = _v[k];
_v.bgMode = 'transparent'; _v.bgNoise = 0;
{
const FL = { standard: [0, 0, 0, 0], balloon: [1, 0, 0, 0], crumpled: [0, 1, 0, 0], fur: [0, 0, 1, 0], lightstone: [0, 0, 0, 1], darkstone: [0, 0, 0, 1], metal: [0, 0, 0, 0], dither: [0, 0, 0, 0], knit: [0, 0, 0, 0], glass: [0, 0, 0, 0] };
let f = FL[pr0] || FL.standard;
if (pr0 === 'dither') { const b = _v.ditherBase; f = [b === 'balloon', b === 'clay', 0, b === 'stone']; }
_v.balloonEnabled = !!f[0]; _v.crumpleEnabled = !!f[1]; _v.furEnabled = !!f[2]; _v.stoneEnabled = !!f[3];
}
const D0 = JSON.parse(JSON.stringify(_v));
const L = {}, ANY = [], fromBrik = new Set(), toBrik = new Set(), exposed = new Set(BRIK_KEYS);
const same = (a, b) => a === b || (a && b && typeof a === 'object' && JSON.stringify(a) === JSON.stringify(b));
const api = {
get: (k) => _v[k],
getAll: () => Object.assign({}, _v),
defaults: () => JSON.parse(JSON.stringify(D0)),
onAny: (f) => ANY.push(f),
onChange(k, cb) { (L[k] = L[k] || []).push(cb); },
set(k, v) {
_v[k] = v;
if (exposed.has(k) && !fromBrik.has(k) && !same(controls.get(k), v)) { toBrik.add(k); try { controls.set(k, v); } catch (e) {} toBrik.delete(k); }
(L[k] || []).forEach((f) => f(v)); ANY.forEach((f) => f(k, v));
},
setValues(o) { Object.keys(o).forEach((k) => { if (k in _v) api.set(k, o[k]); }); },
};
for (const k of BRIK_KEYS) controls.onChange(k, (v) => { if (toBrik.has(k) || same(_v[k], v)) return; fromBrik.add(k); try { api.set(k, v); } finally { fromBrik.delete(k); } });
return api;
})();
const area = document.querySelector('.tool-canvas-area') || document.body;
if (area !== document.body && getComputedStyle(area).position === 'static') area.style.position = 'relative';
const W = () => area.clientWidth || 1200;
const H = () => area.clientHeight || 800;
let renderUntil = 0, lodWanted = false, lodApplied = null;
function poke(ms) { renderUntil = Math.max(renderUntil, performance.now() + (ms || 1500)); }
ST.onAny(() => poke(2500));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, W() / H(), 0.1, 2500);
camera.position.set(0, 0.3, 8);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(W(), H());
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; /* PCF honours shadow.radius (adjustable blur) */
area.appendChild(renderer.domElement);
renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab;';
for (const c of area.querySelectorAll('canvas')) if (c !== renderer.domElement) c.style.display = 'none';
renderer.debug.onShaderError = (gl, program, vs, fs) => {
const log = (gl.getShaderInfoLog(vs) || '') + ' ' + (gl.getShaderInfoLog(fs) || '') + ' ' + (gl.getProgramInfoLog(program) || '');
const msg = 'Shader error: ' + log.trim().slice(0, 400);
console.error(msg);
try { ST.set('__furStatus', msg); } catch (e) {}
};
window.renderer = renderer; window.scene = scene; window.camera = camera;
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const hemi = new THREE.HemisphereLight(0xffffff, 0x555566, 0.4);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 2);
key.position.set(4, 6, 6);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
key.shadow.bias = -0.0005;
scene.add(key);
const rim = new THREE.DirectionalLight(0x88aaff, 1.2);
rim.position.set(-5, 2, -4);
scene.add(rim);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.3 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; floor.receiveShadow = true;
scene.add(floor);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.enableRotate = false;   /* dragging now rotates the LOGO (Tilt X / Turn Y sliders) instead of orbiting the camera; wheel = zoom, right-drag = pan */
{
/* every gesture edits the Pose sliders (saved per material):
drag = rotate (Tilt X / Turn Y) · right-drag or Shift-drag = move (Position X/Y) · pinch or Ctrl/Shift+wheel = Scale · two-finger scroll = move */
orbit.enableZoom = false; orbit.enablePan = false;
let ld = null;
const dom = renderer.domElement;
const unitsPerPx = () => 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.distanceTo(orbit.target) / Math.max(1, dom.clientHeight);
const clampv = (v, a, b) => Math.max(a, Math.min(b, v));
const r2 = (v) => Math.round(v * 100) / 100;
dom.addEventListener('contextmenu', (e) => e.preventDefault());
dom.addEventListener('pointerdown', (e) => {
if (e.button !== 0 && e.button !== 2) return;
ld = { x: e.clientX, y: e.clientY, rx: ST.get('logoRotX'), ry: ST.get('logoRotY'), px: ST.get('poseX'), py: ST.get('poseY'), pan: e.button === 2 || e.shiftKey };
try { dom.setPointerCapture(e.pointerId); } catch (_) {}
});
dom.addEventListener('pointermove', (e) => {
if (!ld) return;
const dx = e.clientX - ld.x, dy = e.clientY - ld.y;
if (ld.pan) {
const u = unitsPerPx();
ST.set('poseX', r2(clampv(ld.px + dx * u, -5, 5))); ST.set('poseY', r2(clampv(ld.py - dy * u, -5, 5)));
} else {
ST.set('logoRotY', Math.round((ld.ry + dx * 0.4) * 10) / 10);
ST.set('logoRotX', Math.round((ld.rx + dy * 0.4) * 10) / 10);
}
});
dom.addEventListener('wheel', (e) => {
e.preventDefault();
if (e.ctrlKey || e.metaKey || e.shiftKey) {
ST.set('poseS', r2(clampv(ST.get('poseS') * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.004)), 0.1, 4)));
} else {
const u = unitsPerPx();
ST.set('poseX', r2(clampv(ST.get('poseX') - e.deltaX * u, -5, 5))); ST.set('poseY', r2(clampv(ST.get('poseY') + e.deltaY * u, -5, 5)));
}
}, { passive: false });
const lend = () => { ld = null; };
dom.addEventListener('pointerup', lend); dom.addEventListener('pointercancel', lend);
}
function applyCamera(cam) {
if (!cam || !cam.position) return;
camera.position.fromArray(cam.position);
orbit.target.fromArray(cam.target || [0, 0, 0]);
if (typeof cam.zoom === 'number') { camera.zoom = cam.zoom; camera.updateProjectionMatrix(); }
if (typeof cam.fov === 'number') { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
orbit.update();
}
function applyPersp() {
const tf = ST.get('perspOn') ? 5 + ST.get('persp') * 115 : 2;
if (Math.abs(camera.fov - tf) < 0.01) return;
const off = camera.position.clone().sub(orbit.target);
const F = off.length() * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
camera.fov = tf; camera.updateProjectionMatrix();
camera.position.copy(orbit.target).add(off.setLength(F / Math.tan(THREE.MathUtils.degToRad(tf / 2))));
orbit.update();
ST.set('cameraState', { version: 1, position: camera.position.toArray(), target: orbit.target.toArray(), zoom: camera.zoom, fov: camera.fov });
poke(1500);
}
ST.onChange('perspOn', applyPersp); ST.onChange('persp', applyPersp);
applyPersp();
applyCamera(ST.get('cameraState'));
ST.onChange('cameraState', applyCamera);
orbit.addEventListener('change', () => poke(400));
orbit.addEventListener('start', () => { lodWanted = true; poke(600); });
let lodTimer = 0;
orbit.addEventListener('end', () => { clearTimeout(lodTimer); lodTimer = setTimeout(() => { lodWanted = false; poke(1500); }, 300); });
orbit.addEventListener('end', () => {
ST.set('cameraState', { version: 1, position: camera.position.toArray(), target: orbit.target.toArray(), zoom: camera.zoom, fov: camera.fov });
});
let curPR = Math.min(window.devicePixelRatio || 1, 2);   /* render resolution, adapted automatically while animating */
let rootBase = 1, trReady = false, trActive = false, trT0 = 0, trFrom = null, lastPoseS = 1;
const poseD = [0, 0, 1, 0, 0, 0];
const root = new THREE.Group();
const holder = new THREE.Group();
root.add(holder);
scene.add(root);
let items = [];
let meshes = [];
function defaultItems() {
const s = new THREE.Shape();
const N = 240;
for (let i = 0; i < N; i++) {
const a = (i / N) * Math.PI * 2;
const r = 300 * (0.5 + 0.5 * Math.pow(Math.abs(Math.sin(2 * a)), 0.3));
const x = Math.cos(a) * r, y = Math.sin(a) * r;
if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
}
s.closePath();
return [{ shapes: [s], color: new THREE.Color('#3fbf4a') }];
}
function hash3(i, j, k) { const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y, z) {
const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
const xf = x - xi, yf = y - yi, zf = z - zi;
const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
const L = (a, b, t) => a + (b - a) * t;
return L(L(L(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), L(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
L(L(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), L(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v), w);
}
function subdivide(arr) {
const n = arr.length / 9;
const out = new Float32Array(n * 36);
let o = 0;
const put = (a, b, c) => { for (const p of [a, b, c]) { out[o++] = p[0]; out[o++] = p[1]; out[o++] = p[2]; } };
for (let t = 0; t < n; t++) {
const i = t * 9;
const A = [arr[i], arr[i + 1], arr[i + 2]], B = [arr[i + 3], arr[i + 4], arr[i + 5]], C = [arr[i + 6], arr[i + 7], arr[i + 8]];
const m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
const ab = m(A, B), bc = m(B, C), ca = m(C, A);
put(A, ab, ca); put(ab, B, bc); put(ca, bc, C); put(ab, bc, ca);
}
return out;
}
function outlinePts(it) {
if (it._pts) return it._pts;
const p = [];
for (const sh of it.shapes) {
const e = sh.extractPoints(10);
for (const q of e.shape) p.push(q.x, q.y);
for (const h of e.holes) for (const q of h) p.push(q.x, q.y);
}
it._pts = new Float32Array(p);
return it._pts;
}
function outlineSegs(it) {
if (it._segs) return it._segs;
const s = [];
const loop = (arr) => { for (let i = 0; i < arr.length; i++) { const a = arr[i], b = arr[(i + 1) % arr.length]; s.push(a.x, a.y, b.x, b.y); } };
for (const sh of it.shapes) { const e = sh.extractPoints(12); loop(e.shape); for (const h of e.holes) loop(h); }
it._segs = new Float32Array(s);
return it._segs;
}
let PX = { fold: 0.8, ff: 1.5, star: 0.8, puff: 0.06, cs: 6, cd: 0.3, zb: 1, rd: 0.8, pinch: 0.5, wf: 1, wd: 1, xy: 1 };
function expandItem(it, delta, S, cx, cy) {
const key = delta.toFixed(4);
if (it._exp && it._exp.key === key) return it._exp.item;
const G = 700, gsz = S * 1.1 + delta * 2, cs = gsz / G, ox = cx - gsz / 2, oy = cy - gsz / 2;
const N = G * G;
const cv = new OffscreenCanvas(1, 1); cv.width = cv.height = G;
const ctx = cv.getContext('2d', { willReadFrequently: true });
ctx.fillStyle = '#fff';
ctx.beginPath();
const loops0 = [];
for (const sh of it.shapes) {
const e = sh.extractPoints(12);
for (const loop of [e.shape, ...e.holes]) {
const pp = loop.map(q => [(q.x - ox) / cs, (q.y - oy) / cs]);
loops0.push(pp);
pp.forEach((q, i) => { if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
ctx.closePath();
}
}
ctx.fill('evenodd');
const d = ctx.getImageData(0, 0, G, G).data;
const O = new Uint8Array(N);
for (let i = 0; i < N; i++) O[i] = d[i * 4 + 3] > 127 ? 1 : 0;
const arcOf = new Float32Array(N), loopOf = new Int32Array(N).fill(-1), per = [];
loops0.forEach((pp, li) => {
let acc = 0;
for (let i = 0; i < pp.length; i++) {
const A = pp[i], B = pp[(i + 1) % pp.length];
const len = Math.hypot(B[0] - A[0], B[1] - A[1]), steps = Math.max(1, Math.ceil(len * 2));
for (let k = 0; k <= steps; k++) {
const t = k / steps, x = Math.floor(A[0] + (B[0] - A[0]) * t), y = Math.floor(A[1] + (B[1] - A[1]) * t);
if (x < 0 || y < 0 || x >= G || y >= G) continue;
const id = y * G + x; loopOf[id] = li; arcOf[id] = acc + len * t;
}
acc += len;
}
per[li] = acc;
});
const D = new Float32Array(N).fill(1e9), SRC = new Int32Array(N).fill(-1);
for (let i = 0; i < N; i++) if (loopOf[i] >= 0) { D[i] = 0; SRC[i] = i; }
const FW = [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.4142], [1, -1, 1.4142], [-2, -1, 2.236], [-1, -2, 2.236], [1, -2, 2.236], [2, -1, 2.236]];
const pass = (fwd) => {
for (let yy = 0; yy < G; yy++) for (let xx = 0; xx < G; xx++) {
const x = fwd ? xx : G - 1 - xx, y = fwd ? yy : G - 1 - yy, i = y * G + x;
let bd = D[i], bs = SRC[i];
for (const [dx, dy, w] of FW) {
const nx = x + (fwd ? dx : -dx), ny = y + (fwd ? dy : -dy);
if (nx < 0 || ny < 0 || nx >= G || ny >= G) continue;
const j = ny * G + nx, v = D[j] + w;
if (v < bd) { bd = v; bs = SRC[j]; }
}
D[i] = bd; SRC[i] = bs;
}
};
pass(true); pass(false);
const dpx = delta / cs, thr = 3 * dpx;
const ridge = new Uint8Array(N);
const isRidge = (a, b) => {
const sa = SRC[a], sb = SRC[b];
if (sa < 0 || sb < 0 || sa === sb) return false;
const la = loopOf[sa], lb = loopOf[sb];
if (la !== lb) return true;
let df = Math.abs(arcOf[sa] - arcOf[sb]); df = Math.min(df, per[la] - df);
return df > thr;
};
for (let y = 0; y < G - 1; y++) for (let x = 0; x < G - 1; x++) {
const i = y * G + x;
if (O[i] || D[i] > dpx) continue;
const r = i + 1, bt = i + G;
if (!O[r] && D[r] <= dpx && isRidge(i, r)) { ridge[i] = 1; ridge[r] = 1; }
if (!O[bt] && D[bt] <= dpx && isRidge(i, bt)) { ridge[i] = 1; ridge[bt] = 1; }
}
const RR = 0, tmp = new Uint8Array(N), rd = new Uint8Array(N);
for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { let v = 0; for (let k = -RR; k <= RR && !v; k++) { const xx = x + k; if (xx >= 0 && xx < G && ridge[y * G + xx]) v = 1; } tmp[y * G + x] = v; }
for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { let v = 0; for (let k = -RR; k <= RR && !v; k++) { const yy = y + k; if (yy >= 0 && yy < G && tmp[yy * G + x]) v = 1; } rd[y * G + x] = v; }
const cl = [];
for (let i = 0; i < N; i++) if (ridge[i]) { const x = i % G, y = (i - x) / G; cl.push((x + 0.5) * cs + ox, (y + 0.5) * cs + oy); }
let f = new Float32Array(N);
for (let i = 0; i < N; i++) f[i] = (O[i] || (D[i] <= dpx && !rd[i])) ? 1 : 0;
const g2 = new Float32Array(N);
for (let n2 = 0; n2 < 1; n2++) {
for (let y = 0; y < G; y++) for (let x = 1; x < G - 1; x++) { const i = y * G + x; g2[i] = (f[i - 1] + f[i] + f[i + 1]) / 3; }
for (let y = 1; y < G - 1; y++) for (let x = 0; x < G; x++) { const i = y * G + x; f[i] = (g2[i - G] + g2[i] + g2[i + G]) / 3; }
}
const pcache = new Map();
const pt = (id) => {
let r = pcache.get(id); if (r) return r;
const vert = id & 1, base = id >> 1, x = base % G, y = (base - x) / G;
if (!vert) { const t = (0.5 - f[base]) / (f[base + 1] - f[base]); r = [x + t, y]; }
else { const t = (0.5 - f[base]) / (f[base + G] - f[base]); r = [x, y + t]; }
pcache.set(id, r); return r;
};
const adj = new Map();
const link = (a, b) => { (adj.get(a) || adj.set(a, []).get(a)).push(b); (adj.get(b) || adj.set(b, []).get(b)).push(a); };
for (let y = 0; y < G - 1; y++) for (let x = 0; x < G - 1; x++) {
const i = y * G + x;
const a = f[i], b = f[i + 1], c = f[i + G + 1], dd = f[i + G];
const k = (a > 0.5 ? 1 : 0) | (b > 0.5 ? 2 : 0) | (c > 0.5 ? 4 : 0) | (dd > 0.5 ? 8 : 0);
if (k === 0 || k === 15) continue;
const T = i * 2, B = (i + G) * 2, Lf = i * 2 + 1, Rt = (i + 1) * 2 + 1;
switch (k) {
case 1: case 14: link(Lf, T); break;
case 2: case 13: link(T, Rt); break;
case 3: case 12: link(Lf, Rt); break;
case 4: case 11: link(Rt, B); break;
case 6: case 9: link(T, B); break;
case 7: case 8: link(Lf, B); break;
case 5: if ((a + b + c + dd) / 4 > 0.5) { link(Lf, B); link(T, Rt); } else { link(Lf, T); link(Rt, B); } break;
case 10: if ((a + b + c + dd) / 4 > 0.5) { link(Lf, T); link(Rt, B); } else { link(T, Rt); link(Lf, B); } break;
}
}
const toW = (id) => { const q = pt(id); return [(q[0] + 0.5) * cs + ox, (q[1] + 0.5) * cs + oy]; };
const seen = new Set(), loops = [];
for (const start of adj.keys()) {
if (seen.has(start)) continue;
const ids = []; let prev = -1, cur = start, guard = 0;
while (guard++ < 400000) {
seen.add(cur); ids.push(cur);
const nb = adj.get(cur); if (!nb) break;
const nx = nb[0] === prev ? nb[1] : nb[0];
if (nx === undefined || nx === start) break;
prev = cur; cur = nx;
}
if (ids.length >= 8) loops.push(ids.map(toW));
}
const smooth = (pts) => { for (let pass = 0; pass < 2; pass++) { const n = pts.length; pts = pts.map((p, i) => { const a = pts[(i + n - 1) % n], c = pts[(i + 1) % n]; return [(a[0] + 2 * p[0] + c[0]) / 4, (a[1] + 2 * p[1] + c[1]) / 4]; }); } return pts; };
const dp = (pts, eps) => {
const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
const st = [[0, pts.length - 1]];
while (st.length) {
const [i0, i1] = st.pop(); let md = 0, mi = -1;
const A = pts[i0], B = pts[i1], dx = B[0] - A[0], dy = B[1] - A[1], l2 = dx * dx + dy * dy || 1e-12;
for (let i = i0 + 1; i < i1; i++) {
const t = Math.max(0, Math.min(1, ((pts[i][0] - A[0]) * dx + (pts[i][1] - A[1]) * dy) / l2));
const ex = pts[i][0] - A[0] - dx * t, ey = pts[i][1] - A[1] - dy * t, dd = ex * ex + ey * ey;
if (dd > md) { md = dd; mi = i; }
}
if (md > eps * eps && mi > 0) { keep[mi] = 1; st.push([i0, mi], [mi, i1]); }
}
return pts.filter((_, i) => keep[i]);
};
const area = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a / 2); };
const inside = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
const polys = loops.map(l => { const sm = smooth(l); const pts = dp(sm.concat([sm[0]]), cs * 0.45); pts.pop(); return { pts, area: area(pts) }; }).filter(q => q.pts.length >= 4 && q.area > cs * cs * 20);
polys.forEach(q => { q.depth = polys.filter(o => o !== q && o.area > q.area && inside(q.pts[0], o.pts)).length; });
const outers = polys.filter(q => q.depth % 2 === 0), holes = polys.filter(q => q.depth % 2 === 1);
const shapes = outers.map(o => { const sh = new THREE.Shape(o.pts.map(v => new THREE.Vector2(v[0], v[1]))); sh._area = o.area; sh._pts = o.pts; return sh; });
holes.forEach(h => {
const par = shapes.filter(sh => sh._area > h.area && inside(h.pts[0], sh._pts)).sort((a, b) => a._area - b._area)[0];
if (par) par.holes.push(new THREE.Path(h.pts.map(v => new THREE.Vector2(v[0], v[1]))));
});
const item = { shapes: shapes.length ? shapes : it.shapes, color: it.color, contact: new Float32Array(cl) };
it._exp = { key, item };
return item;
}
function getPoisson(it, cxm, cym, S) {
if (it._po) return it._po;
const G = 320, gsz = S * 1.08, cs = gsz / (G - 1), ox = cxm - gsz / 2, oy = cym - gsz / 2;
const cv = new OffscreenCanvas(1, 1); cv.width = cv.height = G;
const ctx = cv.getContext('2d', { willReadFrequently: true });
ctx.fillStyle = '#fff';
ctx.beginPath();
for (const sh of it.shapes) {
const e = sh.extractPoints(12);
for (const loop of [e.shape, ...e.holes]) {
loop.forEach((q, i) => { const x = (q.x - ox) / cs, y = (q.y - oy) / cs; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
ctx.closePath();
}
}
ctx.fill('evenodd');
const d = ctx.getImageData(0, 0, G, G).data;
const mask = new Uint8Array(G * G);
for (let i = 0; i < G * G; i++) mask[i] = d[i * 4 + 3] > 127 ? 1 : 0;
const u = new Float32Array(G * G);
const w = 1.95, c2 = cs * cs;
for (let n = 0; n < 420; n++) {
for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) {
const i = y * G + x; if (!mask[i]) continue;
const g = (u[i - 1] + u[i + 1] + u[i - G] + u[i + G] + c2) * 0.25;
u[i] += w * (g - u[i]);
}
}
it._po = { u, G, ox, oy, cs };
return it._po;
}
function samplePoisson(po, x, y) {
const { u, G, ox, oy, cs } = po;
const gx = (x - ox) / cs - 0.5, gy = (y - oy) / cs - 0.5;
const x0 = Math.max(0, Math.min(G - 2, Math.floor(gx))), y0 = Math.max(0, Math.min(G - 2, Math.floor(gy)));
const fx = Math.min(1, Math.max(0, gx - x0)), fy = Math.min(1, Math.max(0, gy - y0));
const i = y0 * G + x0;
const v = (u[i] * (1 - fx) + u[i + 1] * fx) * (1 - fy) + (u[i + G] * (1 - fx) + u[i + G + 1] * fx) * fy;
return Math.sqrt(2 * Math.max(v, 0));
}
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function buildBalloon(it, A, segsN) {
A = Math.min(Math.max(A * 2, 0), 8);
{
const q0 = outlinePts(it); let a0 = 1e9, b0 = -1e9, c0 = 1e9, d0 = -1e9;
for (let i = 0; i < q0.length; i += 2) { a0 = Math.min(a0, q0[i]); b0 = Math.max(b0, q0[i]); c0 = Math.min(c0, q0[i + 1]); d0 = Math.max(d0, q0[i + 1]); }
const S0 = Math.max(b0 - a0, d0 - c0) || 1;
const delta = S0 * 0.0075 * PX.xy;
if (delta > S0 * 1e-4) it = expandItem(it, delta, S0, (a0 + b0) / 2, (c0 + d0) / 2);
}
const sg = new THREE.ShapeGeometry(it.shapes, 12);
let m = mergeVertices((() => { sg.deleteAttribute('normal'); sg.deleteAttribute('uv'); return sg; })(), 1e-3);
let V = Array.from(m.attributes.position.array);
let T = Array.from(m.index.array);
sg.dispose(); m.dispose();
let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
for (let i = 0; i < V.length; i += 3) { minx = Math.min(minx, V[i]); maxx = Math.max(maxx, V[i]); miny = Math.min(miny, V[i + 1]); maxy = Math.max(maxy, V[i + 1]); }
const S = Math.max(maxx - minx, maxy - miny) || 1;
const L = S / 210;
for (let pass = 0; pass < 12 && T.length / 3 < 360000; pass++) {
const mids = new Map();
let any = false;
const mid = (a, b) => {
const dx = V[a * 3] - V[b * 3], dy = V[a * 3 + 1] - V[b * 3 + 1];
if (dx * dx + dy * dy <= L * L) return -1;
const k = a < b ? a * 4294967 + b : b * 4294967 + a;
let r = mids.get(k);
if (r === undefined) { r = V.length / 3; V.push((V[a * 3] + V[b * 3]) / 2, (V[a * 3 + 1] + V[b * 3 + 1]) / 2, 0); mids.set(k, r); any = true; }
return r;
};
const out = [];
for (let t = 0; t < T.length; t += 3) {
const v = [T[t], T[t + 1], T[t + 2]];
const e = [mid(v[0], v[1]), mid(v[1], v[2]), mid(v[2], v[0])];
const cnt = (e[0] >= 0) + (e[1] >= 0) + (e[2] >= 0);
if (cnt === 0) out.push(v[0], v[1], v[2]);
else if (cnt === 3) out.push(v[0], e[0], e[2], e[0], v[1], e[1], e[2], e[1], v[2], e[0], e[1], e[2]);
else if (cnt === 1) {
const k = e[0] >= 0 ? 0 : e[1] >= 0 ? 1 : 2;
const a = v[k], b = v[(k + 1) % 3], c = v[(k + 2) % 3], mm = e[k];
out.push(a, mm, c, mm, b, c);
} else {
const k = e[0] < 0 ? 0 : e[1] < 0 ? 1 : 2;
const r = (k + 1) % 3;
const a = v[r], b = v[(r + 1) % 3], c = v[(r + 2) % 3];
const m0 = e[r], m1 = e[(r + 1) % 3];
out.push(m0, b, m1, a, m0, m1, a, m1, c);
}
}
T = out;
if (!any) break;
}
const cxm = (minx + maxx) / 2, cym = (miny + maxy) / 2;
const po = getPoisson(it, cxm, cym, S);
const segs = outlineSegs(it);
const nseg = segs.length / 4;
const cum = new Float32Array(nseg), slen = new Float32Array(nseg);
let acc = 0;
for (let j = 0; j < nseg; j++) { slen[j] = Math.hypot(segs[j * 4 + 2] - segs[j * 4], segs[j * 4 + 3] - segs[j * 4 + 1]); cum[j] = acc; acc += slen[j]; }
const R = S * 0.3;
const grid = new Map();
const gk = (a, b) => a * 73856093 ^ b * 19349663;
for (let k = 0; k < segs.length; k += 4) {
const x0 = Math.floor(Math.min(segs[k], segs[k + 2]) / R), x1 = Math.floor(Math.max(segs[k], segs[k + 2]) / R);
const y0 = Math.floor(Math.min(segs[k + 1], segs[k + 3]) / R), y1 = Math.floor(Math.max(segs[k + 1], segs[k + 3]) / R);
for (let a = x0; a <= x1; a++) for (let b = y0; b <= y1; b++) {
const key2 = gk(a, b); let l = grid.get(key2); if (!l) { l = []; grid.set(key2, l); } l.push(k);
}
}
const n = V.length / 3;
const dist = new Float32Array(n), sArc = new Float32Array(n), Q = new Float32Array(n);
let Rq = 1e-6;
for (let i = 0; i < n; i++) {
const x = V[i * 3], y = V[i * 3 + 1];
let d2 = R * R, kb = 0, tb = 0;
const gx = Math.floor(x / R), gy = Math.floor(y / R);
for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
const l = grid.get(gk(gx + a, gy + b)); if (!l) continue;
for (const k of l) {
const ax = segs[k], ay = segs[k + 1], bx = segs[k + 2] - ax, by = segs[k + 3] - ay;
const ll = bx * bx + by * by || 1e-9;
const tt = Math.max(0, Math.min(1, ((x - ax) * bx + (y - ay) * by) / ll));
const dx = x - ax - bx * tt, dy = y - ay - by * tt;
const dd = dx * dx + dy * dy; if (dd < d2) { d2 = dd; kb = k >> 2; tb = tt; }
}
}
dist[i] = Math.sqrt(d2);
sArc[i] = cum[kb] + tb * slen[kb];
Q[i] = samplePoisson(po, x, y);
if (Q[i] > Rq) Rq = Q[i];
}
const cW = new Float32Array(n), cNX = new Float32Array(n), cNY = new Float32Array(n), cD = new Float32Array(n).fill(1e9);
if (it.contact && it.contact.length) {
const CP = it.contact, CR = Math.max(S * 0.08, Rq * 0.9), cg = new Map();
for (let k = 0; k < CP.length; k += 2) { const key2 = gk(Math.floor(CP[k] / CR), Math.floor(CP[k + 1] / CR)); let l = cg.get(key2); if (!l) { l = []; cg.set(key2, l); } l.push(k); }
for (let i = 0; i < n; i++) {
const x = V[i * 3], y = V[i * 3 + 1];
let d2 = CR * CR, bx0 = 0, by0 = 0; const gx = Math.floor(x / CR), gy = Math.floor(y / CR);
for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
const l = cg.get(gk(gx + a, gy + b)); if (!l) continue;
for (const k of l) { const dx = x - CP[k], dy = y - CP[k + 1], dd = dx * dx + dy * dy; if (dd < d2) { d2 = dd; bx0 = CP[k]; by0 = CP[k + 1]; } }
}
cNX[i] = bx0; cNY[i] = by0; cD[i] = Math.sqrt(d2);
cW[i] = 1 - sstep(0, Rq * 0.45, Math.sqrt(d2));
}
}
const fac = Math.min(A, 6) * 0.3 * PX.zb;                  // height / local half-width
const pexp = 0.7 + 0.3 * PX.rd;                            // <1 boxier, 1 soft ellipse
const sf = PX.wf / (Rq * 1.2);                             // crease frequency along the seam
const fw = Rq * (0.05 + 0.12 * PX.pinch);                  // width of the flat sealed flange
const wd = PX.wd;
const sfine = PX.ff / (Rq * 0.3);
const heightAt = (i, seed) => {
const x = V[i * 3], y = V[i * 3 + 1], dd = dist[i];
const c = cW[i];
const hp = Rq * Math.pow(Q[i] / Rq, pexp) * fac;
const hl = dd * (0.6 + 0.9 * PX.pinch) * Math.max(fac, 0.3) / 0.8;
const hc = (hp * hl) / (Math.pow(hp, 4) + Math.pow(hl, 4) + 1e-12) ** 0.25;
let body = (1 - c) * hp * sstep(fw * 0.8, fw * 2.6, dd) + c * hc;
const nn = vnoise(sArc[i] * sf + seed * 3.7, dd / Rq * 1.3, seed + 2.1) * 0.7 + vnoise(sArc[i] * sf * 2.3 + seed, dd / Rq * 2.6, seed + 9.0) * 0.3;
const ridge = Math.pow(1 - Math.abs(2 * nn - 1), 3);
const fade = (1 - sstep(0.2, 1.5, dd / Rq)) * sstep(fw * 1.5, fw * 4, dd);
body -= Rq * 0.2 * wd * ridge * fade * Math.max(fac, 0.3);
body += (vnoise(x / Rq * 0.9 + seed, y / Rq * 0.9, seed) - 0.5) * Rq * 0.1 * wd * sstep(fw, fw * 3, dd) * Math.max(fac, 0.3);
if (PX.fold > 0) {
const warp = (vnoise(sArc[i] * sf * 1.3 + seed, 0.5, seed + 3.3) - 0.5) * 1.6 + (vnoise(sArc[i] * sf * 0.4 + seed, dd / Rq * 2.5, seed + 8.8) - 0.5) * 1.2;
const u = sArc[i] * sfine + warp;
const sn = Math.abs(Math.sin(Math.PI * u));
const valley = Math.exp(-Math.pow(sn / 0.26, 2));
const av = 0.35 + 1.0 * vnoise(sArc[i] * sfine * 0.22 + seed * 2, dd / Rq * 2.0, seed + 6.1);
const prof = sstep(fw * 0.7, fw * 2.4, dd) * Math.pow(Math.max(0, 1 - dd / (Rq * 0.95)), 1.4);
body -= Rq * 0.085 * PX.fold * valley * av * prof * Math.max(fac, 0.3) * (1 + 0.5 * c);
}
if (PX.star > 0 && cD[i] < 1e8) {
const dc = cD[i];
const ang = Math.atan2(y - cNY[i], x - cNX[i]) / (2 * Math.PI);
const ua = ang * 22 + (vnoise(ang * 9 + seed, dc / Rq * 3, seed + 1.9) - 0.5) * 1.5;
const sa = Math.abs(Math.sin(Math.PI * ua));
const va = Math.exp(-Math.pow(sa / 0.28, 2));
const aav = 0.4 + 0.9 * vnoise(ang * 5 + seed * 3, dc / Rq * 2, seed + 4.2);
const rp = sstep(Rq * 0.02, Rq * 0.14, dc) * (1 - sstep(Rq * 0.25, Rq * 0.9, dc)) * sstep(fw * 0.5, fw * 1.6, dd);
body -= Rq * 0.1 * PX.star * va * aav * rp * Math.max(fac, 0.3);
}
body = Math.max(0, body);
const rfn = vnoise(x / fw * 0.8 + seed * 5, y / fw * 0.8, 4.4);
const rfc = Math.pow(0.5 + 0.5 * Math.sin(2 * Math.PI * (sArc[i] / (fw * 0.55) + (vnoise(sArc[i] / fw * 0.6 + seed, 1.2, 3.1) - 0.5) * 1.5)), 1.6);
const rf = rfn * 0.4 + rfc * 0.8;
const ruff = Rq * 0.05 * (0.5 + 0.5 * Math.min(wd, 2)) * rf * sstep(0, fw * 0.5, dd) * (1 - sstep(fw * 1.2, fw * 3.2, dd)) * (1 - c);
return body + ruff;
};
const pos = new Float32Array(n * 6);
const back = new Int32Array(n);
let cnt = n;
for (let i = 0; i < n; i++) {
const t = Math.min(1, dist[i] / Rq);
const sk = 1;
const px = cxm + (V[i * 3] - cxm) * sk, py = cym + (V[i * 3 + 1] - cym) * sk;
pos[i * 3] = px; pos[i * 3 + 1] = py;
if (dist[i] < S * 2e-4) { back[i] = i; pos[i * 3 + 2] = 0; continue; }
pos[i * 3 + 2] = heightAt(i, 0);
back[i] = cnt; pos[cnt * 3] = px; pos[cnt * 3 + 1] = py; pos[cnt * 3 + 2] = -heightAt(i, 1.7); cnt++;
}
const idx = [];
for (let t = 0; t < T.length; t += 3) {
idx.push(T[t], T[t + 1], T[t + 2]);
idx.push(back[T[t]], back[T[t + 2]], back[T[t + 1]]);
}
const eMap = new Map();
for (let t = 0; t < T.length; t += 3) for (let k = 0; k < 3; k++) {
const a = T[t + k], b = T[t + (k + 1) % 3], key2 = a < b ? a * 1048576 + b : b * 1048576 + a;
const e = eMap.get(key2); if (e) e.c++; else eMap.set(key2, { a, b, c: 1 });
}
for (const e of eMap.values()) {
if (e.c !== 1) continue;
const a = e.a, b = e.b, ba = back[a], bb = back[b];
if (ba === a && bb === b) continue;
if (a !== ba && b !== ba) idx.push(a, ba, b);
if (b !== ba && b !== bb && ba !== bb) idx.push(b, ba, bb);
}
const g = new THREE.BufferGeometry();
g.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, cnt * 3), 3));
g.setIndex(idx);
g.computeVertexNormals();
g.computeBoundingBox();
return g;
}
function buildClean(it, depth, bev, segs, raw) {
const bb = new THREE.Box2();
for (const sh of it.shapes) for (const q of sh.extractPoints(4).shape) bb.expandByPoint(q);
const S = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y) || 1;
const mi = PX.mi || 0;
const rd = PX.rn || 0;
const bs = rd > 0 ? Math.min(bev, S * 0.03 * rd) : Math.min(bev, S * ((PX.furOn ? 0.04 : 0.012) + mi * 0.09));
const bt = rd > 0 ? Math.min(bev, depth * 0.45, S * 0.05 * rd) : Math.min(bev, depth * (0.4 + mi * 0.1), S * ((PX.furOn ? 0.08 : 0.03) + mi * 0.14));
const useBevel = bs > 0.01 && bt > 0.01;
const geo = new THREE.ExtrudeGeometry(it.shapes, {
depth, steps: 1, curveSegments: 12,
bevelEnabled: useBevel, bevelThickness: bt, bevelSize: bs, bevelOffset: -bs,
bevelSegments: Math.min(segs, PX.furOn ? 6 : (mi > 0 || rd > 0 ? 10 : 6)),
});
geo.deleteAttribute('uv');
geo.deleteAttribute('normal');
if (raw) return geo;
let g = mergeVertices(geo, 1e-3);
geo.dispose();
g = toCreasedNormals(g, Math.PI / 4);
g.computeBoundingBox();
return g;
}
function buildStone(it, depth, bev, segs) {
const st = PX.st;
let g = buildClean(it, depth, bev, segs, true);
let arr = g.attributes.position.array;
g.dispose();
for (let p = 0; p < 6 && (arr.length / 9) * 4 <= 160000; p++) arr = subdivide(arr);
g = new THREE.BufferGeometry();
g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
g = mergeVertices(g, 1e-3);
g.computeVertexNormals();
g.computeBoundingBox();
const bb = g.boundingBox;
const S = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y) || 1;
const P = g.attributes.position.array, N = g.attributes.normal.array, n = g.attributes.position.count;
const Sc = S / st.scale, amp = st.amt * S * 0.045, seed = st.seed;
const hv = (ix, iy, iz, k) => { const q = Math.sin(ix * 127.1 + iy * 311.7 + iz * 74.7 + k * 19.19 + seed * 13.7) * 43758.5453; return q - Math.floor(q); };
const dd = new Float32Array(27), vv = new Float32Array(27);
const rs = S / 28;
const cr = st.crack, crackE = new Float32Array(n).fill(1), Sc2 = S / (st.scale * 0.9), wr = Sc2 * 0.35;
for (let i = 0; i < n; i++) {
const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], nx = N[i * 3], ny = N[i * 3 + 1], nz = N[i * 3 + 2];
const px = x / Sc, py = y / Sc, pz = z / Sc, ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
let c = 0, dmin = 1e9;
for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let e = -1; e <= 1; e++) {
const cx = ix + a, cy = iy + b, cz = iz + e;
const fx = cx + 0.15 + 0.7 * hv(cx, cy, cz, 1), fy = cy + 0.15 + 0.7 * hv(cx, cy, cz, 2), fz = cz + 0.15 + 0.7 * hv(cx, cy, cz, 3);
const ox = px - fx, oy = py - fy, oz = pz - fz;
const d = Math.sqrt(ox * ox + oy * oy + oz * oz);
let tx = hv(cx, cy, cz, 4) - 0.5, ty = hv(cx, cy, cz, 5) - 0.5, tz = hv(cx, cy, cz, 6) - 0.5;
const dn = tx * nx + ty * ny + tz * nz; tx -= nx * dn; ty -= ny * dn; tz -= nz * dn;
const tl = Math.hypot(tx, ty, tz) || 1;
vv[c] = (hv(cx, cy, cz, 7) - 0.5) * 1.2 + st.tilt * 2 * (ox * tx + oy * ty + oz * tz) / tl;
dd[c] = d; if (d < dmin) dmin = d; c++;
}
let ws = 0, vs = 0;
for (let k = 0; k < 27; k++) { const w = Math.exp(-(dd[k] - dmin) * st.sharp); ws += w; vs += w * vv[k]; }
const f = vs / ws;
const side = sstep(0.3, 0.8, Math.abs(nz));
const mul = st.edge + (1 - st.edge) * side;
const r = (vnoise(x / rs, y / rs, z / rs) * 0.6 + vnoise(x / rs * 2.3 + 5, y / rs * 2.3, z / rs * 2.3) * 0.4 - 0.5) * st.rough * amp * 0.5;
let Dx = 0;
if (cr > 0) {
const wx = x / Sc2 + (vnoise(x / wr + 3, y / wr, z / wr) - 0.5) * 0.6, wy = y / Sc2 + (vnoise(x / wr, y / wr + 11, z / wr) - 0.5) * 0.6, wz = z / Sc2 + (vnoise(x / wr, y / wr, z / wr + 19) - 0.5) * 0.6;
const jx = Math.floor(wx), jy = Math.floor(wy), jz = Math.floor(wz);
let d1 = 1e9, d2 = 1e9, ax = 0, ay = 0, az = 0, bx2 = 0, by2 = 0, bz2 = 0;
for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let e = -1; e <= 1; e++) {
const cx = jx + a, cy = jy + b, cz = jz + e;
const ox = wx - (cx + 0.1 + 0.8 * hv(cx, cy, cz, 41)), oy = wy - (cy + 0.1 + 0.8 * hv(cx, cy, cz, 42)), oz = wz - (cz + 0.1 + 0.8 * hv(cx, cy, cz, 43));
const d = Math.sqrt(ox * ox + oy * oy + oz * oz);
if (d < d1) { d2 = d1; bx2 = ax; by2 = ay; bz2 = az; d1 = d; ax = cx; ay = cy; az = cz; }
else if (d < d2) { d2 = d; bx2 = cx; by2 = cy; bz2 = cz; }
}
const ee = d2 - d1;
if (hv(ax + bx2, ay + by2, az + bz2, 60) < 0.2 + 0.65 * cr) {
crackE[i] = ee;
Dx -= amp * 0.55 * Math.min(1, cr * 1.5) * (1 - sstep(0, 0.07 + 0.06 * cr, ee));
}
if (hv(ax, ay, az, 50) > 1 - 0.4 * cr) Dx -= amp * 1.1 * cr * sstep(0, 0.3, ee) * (0.6 + 0.4 * (1 - side));
}
const D = f * amp * mul + r + Dx;
P[i * 3] = x + nx * D; P[i * 3 + 1] = y + ny * D; P[i * 3 + 2] = z + nz * D;
}
g.attributes.position.needsUpdate = true;
g.setAttribute('aCrack', new THREE.BufferAttribute(crackE, 1));
g = toCreasedNormals(g, Math.PI / 3);
g.computeBoundingBox();
g.userData.S = S;
return g;
}
function outlineGrid(it) {
if (it._og) return it._og;
const segs = outlineSegs(it);
let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
for (let i = 0; i < segs.length; i += 2) { a = Math.min(a, segs[i]); b = Math.max(b, segs[i]); c = Math.min(c, segs[i + 1]); d = Math.max(d, segs[i + 1]); }
const S = Math.max(b - a, d - c) || 1, R = S * 0.05, grid = new Map();
const gk = (x, y) => x * 73856093 ^ y * 19349663;
for (let k = 0; k < segs.length; k += 4) {
const x0 = Math.floor(Math.min(segs[k], segs[k + 2]) / R), x1 = Math.floor(Math.max(segs[k], segs[k + 2]) / R);
const y0 = Math.floor(Math.min(segs[k + 1], segs[k + 3]) / R), y1 = Math.floor(Math.max(segs[k + 1], segs[k + 3]) / R);
for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) { const key = gk(i, j); let l = grid.get(key); if (!l) { l = []; grid.set(key, l); } l.push(k); }
}
it._og = { segs, S, R, grid, gk };
return it._og;
}
function nearestOutline(og, x, y) {
const { segs, R, grid, gk } = og;
const gx = Math.floor(x / R), gy = Math.floor(y / R);
let best = 1e18, qx = x, qy = y;
for (let r = 1; r <= 8; r++) {
best = 1e18;
for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
const l = grid.get(gk(gx + i, gy + j)); if (!l) continue;
for (const k of l) {
const ax = segs[k], ay = segs[k + 1], bx = segs[k + 2] - ax, by = segs[k + 3] - ay;
const ll = bx * bx + by * by || 1e-9;
const t = Math.max(0, Math.min(1, ((x - ax) * bx + (y - ay) * by) / ll));
const px = ax + bx * t, py = ay + by * t, dd = (x - px) * (x - px) + (y - py) * (y - py);
if (dd < best) { best = dd; qx = px; qy = py; }
}
}
if (best <= (r * R) * (r * R)) break;
}
return { x: qx, y: qy, d: Math.sqrt(best) };
}
function addFurFlow(g, it, depth) {
const og = outlineGrid(it);
const P = g.attributes.position.array, N = g.attributes.normal.array, n = g.attributes.position.count;
const F = new Float32Array(n * 3), zmid = depth / 2;
for (let i = 0; i < n; i++) {
const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
const q = nearestOutline(og, x, y);
let vx, vy;
if (q.d > og.S * 1e-3) { vx = (q.x - x) / q.d; vy = (q.y - y) / q.d; }
else { const l = Math.hypot(N[i * 3], N[i * 3 + 1]) || 1; vx = N[i * 3] / l; vy = N[i * 3 + 1] / l; }
const t = sstep(0.3, 0.8, Math.abs(N[i * 3 + 2]));
F[i * 3] = vx * t; F[i * 3 + 1] = vy * t; F[i * 3 + 2] = (1 - t) * (z > zmid ? -1 : 1);
}
g.setAttribute('aFlow', new THREE.BufferAttribute(F, 3));
}
function buildGeometry(it, bA, cA, depth, bev, segs) {
if (PX.furOn && !(PX.st && PX.st.on) && bA <= 0 && cA <= 0) { return buildClean(it, depth, bev, segs); }
if (PX.st && PX.st.on) return buildStone(it, depth, bev, segs);
if (bA <= 0 && cA <= 0) return buildClean(it, depth, bev, segs);
if (bA > 0) {
const gb = buildBalloon(it, bA, segs);
if (cA > 0) {
const P = gb.attributes.position.array, N = gb.attributes.normal.array, n = gb.attributes.position.count;
const bb = gb.boundingBox; const S = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
for (let i = 0; i < n; i++) {
const x = P[i * 3] / S, y = P[i * 3 + 1] / S, z = P[i * 3 + 2] / S;
const n1 = 1 - Math.abs(2 * vnoise(x * PX.cs, y * PX.cs, z * PX.cs) - 1);
const n2 = 1 - Math.abs(2 * vnoise(x * PX.cs * 2.3 + 9, y * PX.cs * 2.3, z * PX.cs * 2.3) - 1);
const d = (n1 * (1 - PX.cd) + n2 * PX.cd - 0.5) * cA * S * 0.08;
P[i * 3] += N[i * 3] * d; P[i * 3 + 1] += N[i * 3 + 1] * d; P[i * 3 + 2] += N[i * 3 + 2] * d;
}
gb.attributes.position.needsUpdate = true;
gb.computeVertexNormals(); gb.computeBoundingBox();
}
return gb;
}
let g = buildClean(it, depth, bev, segs, true);
let arr = g.attributes.position.array;
g.dispose();
for (let p = 0; p < 6 && (arr.length / 9) * 4 <= 180000; p++) arr = subdivide(arr);
g = new THREE.BufferGeometry();
g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
g = mergeVertices(g, 1e-3);
g.computeBoundingBox();
const bb = g.boundingBox;
const S = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
const P = g.attributes.position.array;
const n = g.attributes.position.count;
g.attributes.position.needsUpdate = true;
g.computeVertexNormals();
const N = g.attributes.normal.array;
for (let i = 0; i < n; i++) {
const x = P[i * 3] / S, y = P[i * 3 + 1] / S, z = P[i * 3 + 2] / S;
const n1 = 1 - Math.abs(2 * vnoise(x * PX.cs, y * PX.cs, z * PX.cs) - 1);
const n2 = 1 - Math.abs(2 * vnoise(x * PX.cs * 2.3 + 9, y * PX.cs * 2.3, z * PX.cs * 2.3) - 1);
const d = (n1 * (1 - PX.cd) + n2 * PX.cd - 0.5) * cA * S * 0.08;
P[i * 3] += N[i * 3] * d; P[i * 3 + 1] += N[i * 3 + 1] * d; P[i * 3 + 2] += N[i * 3 + 2] * d;
}
g.attributes.position.needsUpdate = true;
g.computeVertexNormals();
g.computeBoundingBox();
return g;
}
function makeMaterial(type, color) {
const c = new THREE.Color(color);
const P = (o) => new THREE.MeshPhysicalMaterial(o);
switch (type) {
case 'balloon': {
const bm = P({ color: c, metalness: 0, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.04, ior: 1.6, specularIntensity: 1 });
bm.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, balloonU);
sh.fragmentShader = sh.fragmentShader
.replace('#include <common>', '#include <common>\nuniform vec3 uShCol; uniform float uShAmt;')
.replace('#include <opaque_fragment>', `float shL = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
float shW = 1.0 - smoothstep(0.015, 0.5, shL);
outgoingLight = mix(outgoingLight, uShCol * (0.3 + 1.1 * shL), shW * uShAmt);
#include <opaque_fragment>`);
};
bm.customProgramCacheKey = () => 'balloonsh1';
return bm;
}
case 'clay': return P({ color: c, metalness: 0, roughness: 0.7, specularIntensity: 0.6 });
case 'default': return P({ color: c, metalness: 0, roughness: 0.45 });
case 'glass': return P({ color: 0xffffff, transmission: 1, thickness: 1.5, ior: 1.5, roughness: 0.03, metalness: 0, attenuationColor: c.clone().lerp(new THREE.Color(0xffffff), 0.7), attenuationDistance: 2, specularIntensity: 1 });
case 'chrome': return P({ color: 0xffffff, metalness: 1, roughness: 0.04 });
case 'gold': return P({ color: 0xffc94a, metalness: 1, roughness: 0.2 });
case 'copper': return P({ color: 0xd9825b, metalness: 1, roughness: 0.28 });
case 'brushed': return P({ color: c, metalness: 1, roughness: 0.45 });
case 'plastic': return P({ color: c, metalness: 0, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
case 'ceramic': return P({ color: c, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.02 });
case 'matte': return P({ color: c, metalness: 0, roughness: 1 });
case 'rubber': return P({ color: c, roughness: 0.85 });
case 'velvet': return P({ color: c, roughness: 0.9, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffffff) });
case 'iridescent': return P({ color: 0xffffff, metalness: 0.2, roughness: 0.1, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 800], clearcoat: 1 });
case 'neon': return new THREE.MeshStandardMaterial({ color: 0x111111, emissive: c, emissiveIntensity: 2.5, roughness: 0.4 });
case 'wood': return P({ color: 0xb98550, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 });
case 'toon': return new THREE.MeshToonMaterial({ color: c });
case 'wireframe': return new THREE.MeshBasicMaterial({ color: c, wireframe: true });
case 'normal': return new THREE.MeshNormalMaterial();
default: return P({ color: c });
}
}
const balloonU = { uShCol: { value: new THREE.Color('#2b2b33') }, uShAmt: { value: 0.7 } };
const FIN = ['plastic', 'matte', 'ceramic', 'rubber', 'velvet', 'brushed'];
function finishMat(m, type) {
if (!FIN.includes(type)) return m;
const f = m.userData.fin ?? 1;
m.roughness = type === 'brushed' ? 0.15 + 0.6 * (1 - f) : 1 - 0.9 * f;
if ('clearcoat' in m) { m.clearcoat = f; m.clearcoatRoughness = 0.1 + 0.3 * (1 - f); }
return m;
}
const geoCache = new Map();
let itemsVer = 0;
function clearGeoCache() { for (const g of geoCache.values()) g.dispose(); geoCache.clear(); }
function getGeo(it, idx, bA, cA, depth, bev, segs) {
const k = [itemsVer, idx, bA, cA, depth, bev, segs, PX.cs + ',' + PX.cd, PX.zb, PX.rd, PX.rn, PX.pinch, PX.wf, PX.wd, PX.xy, PX.fold, PX.ff, PX.star, JSON.stringify(PX.st), PX.furOn, PX.mi].join('|');
let g = geoCache.get(k);
if (g) { geoCache.delete(k); geoCache.set(k, g); return g; }
g = buildGeometry(it, bA, cA, depth, bev, segs);
geoCache.set(k, g);
while (geoCache.size > 12) { const f = geoCache.keys().next().value; geoCache.get(f).dispose(); geoCache.delete(f); }
return g;
}
const matCache = new Map();
function getMat(type, col, f) {
if (type === 'metal') return getMetalMat();
const fin = FIN.includes(type) ? f : 0;
const k = type + '|' + col.getHexString() + '|' + fin;
let m = matCache.get(k);
if (!m) {
m = makeMaterial(type, col); m.userData.fin = f;
m = finishMat(m, type);
matCache.set(k, m);
if (matCache.size > 40) { const f0 = matCache.keys().next().value; matCache.get(f0).dispose(); matCache.delete(f0); }
}
return m;
}
const stoneU = {
uStoneColor: { value: new THREE.Color('#c6c9ce') }, uInvS: { value: 1 / 933 }, uPore: { value: 0.5 },
uPoreSize: { value: 1 }, uDirt: { value: 0.25 }, uBump: { value: 1 }, uTexScale: { value: 1 },
uStoneColor2: { value: new THREE.Color('#8a6244') }, uStoneColor3: { value: new THREE.Color('#a9a7b0') },
uRust: { value: 0.55 }, uPatina: { value: 0.5 }, uDetail: { value: 0.8 }, uGrain: { value: 0.8 }, uGrainS: { value: 1 },
uWear: { value: 0.7 }, uAO: { value: 0.7 }, uTone: { value: 1.25 },
uMossOn: { value: 0 }, uMossAmt: { value: 0.55 }, uMossScale: { value: 1 }, uMossFuzz: { value: 0.8 }, uMossCol1: { value: new THREE.Color('#3f5a1c') }, uMossCol2: { value: new THREE.Color('#8fae2e') },
uMossTop: { value: 0.6 }, uMossBump: { value: 1 }, uMossDrip: { value: 1.4 },
};
let stoneMat = null;
function getStoneMat() {
if (stoneMat) return stoneMat;
stoneMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 });
stoneMat.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, stoneU);
sh.vertexShader = sh.vertexShader.replace('#include <common>', 'varying vec3 vSP; attribute float aCrack; varying float vCrack; varying vec3 vONm;\n#include <common>').replace('#include <begin_vertex>', '#include <begin_vertex>\nvSP = position; vCrack = aCrack; vONm = normal;');
sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vSP; varying float vCrack; varying vec3 vONm;
uniform vec3 uMossCol1, uMossCol2; uniform float uMossOn, uMossAmt, uMossScale, uMossFuzz, uMossTop, uMossBump, uMossDrip;
uniform vec3 uStoneColor, uStoneColor2, uStoneColor3; uniform float uInvS, uPore, uPoreSize, uDirt, uBump, uTexScale, uRust, uPatina, uDetail, uGrain, uGrainS, uWear, uAO, uTone;
float sH(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
float sN(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
return mix(mix(mix(sH(i),sH(i+vec3(1,0,0)),f.x),mix(sH(i+vec3(0,1,0)),sH(i+vec3(1,1,0)),f.x),f.y),
mix(mix(sH(i+vec3(0,0,1)),sH(i+vec3(1,0,1)),f.x),mix(sH(i+vec3(0,1,1)),sH(i+vec3(1,1,1)),f.x),f.y),f.z); }
float sF(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*sN(p); p=p*2.03+7.1; a*=0.5; } return s; }
float stoneH, stoneChip, stoneMoss;`).replace('#include <color_fragment>', `#include <color_fragment>
{
vec3 q = vSP * uInvS * uTexScale;
float lod = 1.0 - smoothstep(0.35, 0.95, length(fwidth(q)) * 340.0 / uGrainS);
vec3 wv = vec3(sF(q*2.0+3.0), sF(q*2.0+8.0), sF(q*2.0+13.0));
vec3 qw = q + (wv-0.5)*0.4;                       /* domain warp: organic, non-repeating patches */
float mott = sF(qw*3.0);
float mott2 = sF(qw*9.0+5.0);
float big = sF(qw*1.4+20.0);
float chip = sN(qw*30.0)*0.65 + sN(qw*61.0+4.0)*0.35;
float fine = sF(q*64.0);
float grain = (sN(q*170.0/uGrainS)*0.55 + sN(q*340.0/uGrainS+2.0)*0.45);
float t1 = mix(0.86, 0.60, uPore);
float pore = smoothstep(t1, t1+0.05, sN(q*95.0/uPoreSize));
float t2 = mix(0.90, 0.68, uPore);
float pore2 = smoothstep(t2, t2+0.05, sN(q*210.0/uPoreSize + 3.3));
float dirtN = smoothstep(0.42, 0.72, sF(vec3(q.x*2.2, q.y*0.9, q.z*2.2) + 11.0));
float rustM = smoothstep(0.42, 0.78, sF(qw*4.0+31.0)) * uRust;
float paleM = smoothstep(0.52, 0.86, mott2*0.55 + big*0.45) * uPatina;
vec3 c = uStoneColor * (0.62 + 0.8*mott);
c = mix(c, uStoneColor2 * (0.7 + 0.6*mott2), rustM * 0.85);
c = mix(c, uStoneColor3 * (0.65 + 0.7*chip), paleM * 0.75);
c *= 0.84 + 0.32*chip;
c *= 1.0 + (fine-0.5)*0.55*uDetail + (grain-0.5)*1.1*uGrain*lod;
c = mix(c, c*vec3(0.55,0.47,0.40), dirtN * uDirt * 0.8);
c = (c - 0.16) * uTone + 0.16;                       /* tonal contrast: deeper darks, brighter lights */
c = max(c, vec3(0.006));
c = mix(c, c*0.12, clamp(pore + pore2*0.6, 0.0, 1.0));
stoneChip = chip;
stoneH = (mott-0.5)*0.55 + (big-0.5)*0.5 + (chip-0.5)*0.7*uDetail + (fine-0.5)*0.55*uDetail + (grain-0.5)*0.8*uGrain*lod - pore*1.2 - pore2*0.5 + dirtN*0.12;
stoneMoss = 0.0;
if (uMossOn > 0.5) {
vec3 mq = vec3(q.x, q.y / max(uMossDrip, 0.3), q.z) * uMossScale;
float cov = sF(mq*3.0 + 40.0)*0.62 + sF(mq*9.0 + 7.0)*0.38;
float topv = 1.0 - clamp(q.y*1.3, 0.0, 1.0);
float upn = -vONm.y;
cov += uMossTop * (topv*0.85 + upn*0.5 - 0.5);
cov += (sN(q*55.0) - 0.5) * 0.16;
float mk = smoothstep(mix(1.08, 0.28, uMossAmt), mix(1.08, 0.28, uMossAmt) + 0.06, cov);
float cush = sF(mq*22.0 + 3.0);
float cush2 = sF(mq*55.0 + 11.0);
float fib = sN(q*240.0)*0.55 + sN(q*520.0 + 9.0)*0.45;
float shade = cush*0.75 + cush2*0.25;
vec3 mc = mix(uMossCol1, uMossCol2, smoothstep(0.2, 0.85, shade*0.8 + (fib-0.5)*0.5*uMossFuzz*lod + 0.1));
mc = mix(mc, vec3(0.42, 0.36, 0.16) * (0.6 + 0.6*shade), smoothstep(0.62, 0.9, sF(mq*5.0 + 70.0)) * 0.55);
mc *= 0.5 + 0.7*smoothstep(0.05, 0.95, shade);
mc *= 1.0 + (fib - 0.5) * 0.9 * uMossFuzz * lod;
mc += uMossCol2 * smoothstep(0.78, 0.95, fib) * 0.35 * uMossFuzz * lod;
float mh = (cush - 0.4)*1.7*uMossBump + (cush2 - 0.5)*0.5*uMossBump + (fib - 0.5)*0.8*uMossFuzz*lod;
c = mix(c, mc, mk);
stoneH = mix(stoneH, mh, mk);
stoneMoss = mk;
}
c *= mix(1.0, 0.35 + 0.65*smoothstep(-1.1, 0.35, stoneH), uAO);   /* cavities read darker */
float ck = (1.0 - smoothstep(0.015, 0.075, vCrack)) * (1.0 - stoneMoss);
c = mix(c, vec3(0.008), ck * 0.94);
stoneH -= ck * 2.5;
diffuseColor.rgb = c;
}`).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{
vec3 dnx = dFdx(normal), dny = dFdy(normal), dpx = dFdx(-vViewPosition), dpy = dFdy(-vViewPosition);
float cv = (dot(dnx, dpx) + dot(dny, dpy)) / (dot(dpx, dpx) + dot(dpy, dpy) + 1e-9);
float cvx = smoothstep(3.0, 28.0, cv), ccv = smoothstep(3.0, 28.0, -cv);
float wear = clamp(cvx * (0.45 + 1.1*stoneChip) * uWear * 1.7, 0.0, 1.0) * (1.0 - stoneMoss);
diffuseColor.rgb = mix(diffuseColor.rgb, uStoneColor3 * 1.05, wear * 0.7);
diffuseColor.rgb *= 1.0 - ccv * uAO * 0.75;
roughnessFactor = mix(mix(0.92, 0.5, wear), 1.0, stoneMoss);
float mfr = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.5);
diffuseColor.rgb += mix(uMossCol2, vec3(1.0), 0.2) * stoneMoss * mfr * 0.22;   /* soft sheen on the moss fibres at grazing angles */
stoneH += wear * 0.6;
vec2 dH = vec2(dFdx(stoneH), dFdy(stoneH)) * uBump * 0.014;
vec3 sX = dFdx(-vViewPosition), sY = dFdy(-vViewPosition);
vec3 R1 = cross(sY, normal), R2 = cross(normal, sX);
float det = dot(sX, R1);
vec3 grad = sign(det) * (dH.x*R1 + dH.y*R2);
normal = normalize(abs(det)*normal - grad);
}`);
};
stoneMat.customProgramCacheKey = () => 'stone3';
return stoneMat;
}
function updateStoneUniforms() {
const g = (k) => ST.get(k);
stoneU.uStoneColor.value.set(g('stoneColor')); stoneU.uStoneColor2.value.set(g('stoneColor2')); stoneU.uStoneColor3.value.set(g('stoneColor3'));
stoneU.uRust.value = g('stoneRust'); stoneU.uPatina.value = g('stonePatina'); stoneU.uDetail.value = g('stoneDetail');
stoneU.uGrain.value = g('stoneGrain'); stoneU.uGrainS.value = g('stoneGrainSize'); stoneU.uWear.value = g('stoneWear');
stoneU.uAO.value = g('stoneAO'); stoneU.uTone.value = g('stoneTone');
stoneU.uMossOn.value = 0; stoneU.uMossAmt.value = g('stoneMossAmt'); stoneU.uMossScale.value = g('stoneMossScale'); stoneU.uMossFuzz.value = g('stoneMossFuzz');
stoneU.uMossCol1.value.set(g('stoneMossColor')); stoneU.uMossCol2.value.set(g('stoneMossColor2'));
stoneU.uMossTop.value = g('stoneMossTop'); stoneU.uMossBump.value = g('stoneMossBump'); stoneU.uMossDrip.value = g('stoneMossDrip');
stoneU.uPore.value = g('stonePores'); stoneU.uPoreSize.value = g('stonePoreSize');
stoneU.uDirt.value = g('stoneDirt'); stoneU.uBump.value = g('stoneBump'); stoneU.uTexScale.value = g('stoneTexScale');
let S = 0; for (const m of meshes) S = Math.max(S, m.geometry.userData.S || 0);
if (S) stoneU.uInvS.value = 1 / S;
applyMossUniforms();
}
const clayU = {
uCCol: { value: new THREE.Color('#d08f6c') }, uCCol2: { value: new THREE.Color('#a96a4c') }, uCInvS: { value: 1 / 933 },
uCGrain: { value: 0.6 }, uCGrainS: { value: 1 }, uCLump: { value: 0.6 }, uCLumpS: { value: 1 },
uCPit: { value: 0.45 }, uCPitS: { value: 1 }, uCMott: { value: 0.5 }, uCMottS: { value: 1 },
uCDust: { value: 0.25 }, uCCrack: { value: 0.25 }, uCBump: { value: 1 },
};
let clayMat = null;
function getClayMat() {
if (clayMat) return clayMat;
clayMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
clayMat.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, clayU);
sh.vertexShader = sh.vertexShader.replace('#include <common>', 'varying vec3 vCP;\n#include <common>').replace('#include <begin_vertex>', '#include <begin_vertex>\nvCP = position;');
sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vCP;
uniform vec3 uCCol, uCCol2; uniform float uCInvS, uCGrain, uCGrainS, uCLump, uCLumpS, uCPit, uCPitS, uCMott, uCMottS, uCDust, uCCrack, uCBump;
float cH(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float cN(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
return mix(mix(mix(cH(i),cH(i+vec3(1,0,0)),f.x),mix(cH(i+vec3(0,1,0)),cH(i+vec3(1,1,0)),f.x),f.y),
mix(mix(cH(i+vec3(0,0,1)),cH(i+vec3(1,0,1)),f.x),mix(cH(i+vec3(0,1,1)),cH(i+vec3(1,1,1)),f.x),f.y),f.z); }
float cF(vec3 p, int o){ float a=0.5, s=0.0, n=0.0; for(int i=0;i<5;i++){ if(i>=o) break; s+=a*cN(p); n+=a; p=p*2.07+5.3; a*=0.5; } return s/n; }
float clayH;`).replace('#include <color_fragment>', `#include <color_fragment>
{
vec3 q = vCP * uCInvS;
float lod = clamp(1.0 - fwidth(q.x*600.0/uCGrainS)*0.12, 0.0, 1.0);
float mott = cF(q*3.0/uCMottS + 2.0, 4);
float mott2 = cF(q*9.0/uCMottS + 9.0, 3);
float lump = cF(q*7.0/uCLumpS, 4);
float grain = cF(q*190.0/uCGrainS, 2);
float grain2 = cN(q*420.0/uCGrainS + 4.0);
float pt = mix(0.80, 0.50, uCPit);
float pit = smoothstep(pt, pt+0.07, cN(q*85.0/uCPitS)) * (0.6 + 0.4*cN(q*23.0));
float pit2 = smoothstep(pt+0.06, pt+0.13, cN(q*170.0/uCPitS + 3.3));
float ck = (1.0 - smoothstep(0.0, 0.012, abs(cF(q*14.0 + 21.0, 3) - 0.5))) * uCCrack;
float mixc = clamp((mott - 0.5)*2.2*uCMott + 0.5 + (mott2-0.5)*0.5*uCMott, 0.0, 1.0);
vec3 c = mix(uCCol, uCCol2, smoothstep(0.25, 0.85, mixc) * clamp(uCMott*1.2, 0.0, 1.0));
c *= 1.0 + (mott2 - 0.5) * 0.28 * uCMott;
c *= 1.0 + ((grain - 0.5)*0.55 + (grain2 - 0.5)*0.35) * uCGrain * lod;
c = mix(c, c*0.38, clamp(pit*uCPit*1.4 + pit2*uCPit*0.5, 0.0, 1.0) * lod);
c = mix(c, vec3(dot(c, vec3(0.33))) * 1.25 + vec3(0.08), smoothstep(0.55, 0.9, lump) * uCDust * 0.45);
c *= 1.0 - ck * 0.55;
diffuseColor.rgb = c;
clayH = (lump - 0.5) * 1.8 * uCLump + ((grain - 0.5) * 0.45 + (grain2 - 0.5) * 0.3) * uCGrain * lod
- (pit * 1.1 + pit2 * 0.5) * uCPit * lod - ck * 1.4 + (mott - 0.5) * 0.4 * uCLump;
}`).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{
vec2 dH = vec2(dFdx(clayH), dFdy(clayH)) * uCBump * 0.012;
vec3 sX = dFdx(-vViewPosition), sY = dFdy(-vViewPosition);
vec3 R1 = cross(sY, normal), R2 = cross(normal, sX);
float det = dot(sX, R1);
vec3 grad = sign(det) * (dH.x*R1 + dH.y*R2);
normal = normalize(abs(det)*normal - grad);
}`);
};
clayMat.customProgramCacheKey = () => 'clay1';
return clayMat;
}
function updateClayUniforms() {
const g = (k) => ST.get(k);
clayU.uCCol.value.set(g('colorCrumpled')); clayU.uCCol2.value.set(g('clayColor2'));
clayU.uCGrain.value = g('clayGrain'); clayU.uCGrainS.value = g('clayGrainSize');
clayU.uCLump.value = g('clayLump'); clayU.uCLumpS.value = g('clayLumpSize');
clayU.uCPit.value = g('clayPits'); clayU.uCPitS.value = g('clayPitSize');
clayU.uCMott.value = g('clayMott'); clayU.uCMottS.value = g('clayMottSize');
clayU.uCDust.value = g('clayDust'); clayU.uCCrack.value = g('clayCrack'); clayU.uCBump.value = g('clayBump');
if (clayMat) clayMat.roughness = 0.35 + 0.65 * g('clayMatte');
let S = 0; for (const m of meshes) S = Math.max(S, m.geometry.userData.S || 0);
if (S) clayU.uCInvS.value = 1 / S;
}
function applyMaterials() {
const type = ST.get('deformPreset') === 'metal' ? 'metal' : (ST.get('deformPreset') === 'balloon' ? 'balloon' : (ST.get('deformPreset') === 'crumpled' ? 'clay' : 'default'));
const keep = false;
const tint = ST.get({ balloon: 'colorBalloon', crumpled: 'colorCrumpled' }[ST.get('deformPreset')] || 'colorStandard');
const f = 1;
const fixed = ['metal', 'chrome', 'gold', 'copper', 'iridescent', 'normal'].includes(type);
meshes.forEach((mesh, i) => {
const col = keep && !fixed ? items[i].color : new THREE.Color(tint);
mesh.material = getMat(type, col, f);
if (type === 'clay') {
if (ST.get('clayTex')) { updateClayUniforms(); mesh.material = getClayMat(); }
else { const mt = ST.get('clayMatte'); mesh.material.roughness = 0.2 + 0.8 * mt; mesh.material.specularIntensity = 1 - 0.7 * mt; }
}
if (type === 'balloon') { balloonU.uShCol.value.set(ST.get('colorBalloonShadow')); balloonU.uShAmt.value = ST.get('balloonShadowAmt'); const gl = ST.get('balloonGloss'); mesh.material.roughness = 0.5 - 0.42 * gl; mesh.material.clearcoat = gl; mesh.material.clearcoatRoughness = 0.22 - 0.19 * gl; }
});
if (ST.get('stoneEnabled')) { updateStoneUniforms(); meshes.forEach(m => { m.material = getStoneMat(); }); }
applyFur();
applyKnitUniforms();
applyGlass();
applyMetalEnv();
applyMetalUniforms();
}
const FUR_VS = `
uniform float uLayer; uniform float uLen; uniform float uFluff; uniform float uGrav;
varying vec3 vBase; varying vec3 vON; varying vec3 vWN; varying vec3 vWP;
void main(){
vBase = position;
vec3 n = normalize(normal);
vON = n;
float h = uLayer;
vec3 curl = vec3(sin(position.y*0.02+position.z*0.015), sin(position.z*0.02+position.x*0.018), sin(position.x*0.018+position.y*0.022));
vec3 p = position + n * uLen * h + curl * uFluff * uLen * h * h * 0.35 + vec3(0.0, uGrav * uLen * h * h * 0.6, 0.0);
vec4 wp = modelMatrix * vec4(p, 1.0);
vWP = wp.xyz;
vWN = normalize(mat3(modelMatrix) * n);
gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const FUR_FS = `
uniform float uLayer; uniform float uScale; uniform vec3 uRoot; uniform vec3 uTip;
uniform float uClump; uniform float uFlow; uniform float uThick; uniform float uVar; uniform float uBlur;
uniform sampler2D uPat; uniform float uHasPat, uPatMix, uPatScale; uniform vec2 uPatO, uPatS;
uniform sampler2D uEnv; uniform mat3 uEnvRot; uniform float uEnvAmb, uSpecK;
#include <cube_uv_reflection_fragment>
uniform vec3 uLDir; uniform vec3 uKeyCol; uniform float uKeyI; uniform vec3 uAmbT; uniform vec3 uAmbB; uniform vec3 uRDir; uniform vec3 uRimCol; uniform float uRimI; uniform float uEnvK;
varying vec3 vBase; varying vec3 vON; varying vec3 vWN; varying vec3 vWP;
float h1(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }  /* sin-free hash: much cheaper per call */
float vn(vec3 x){
vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
return mix(mix(mix(h1(i),h1(i+vec3(1,0,0)),f.x), mix(h1(i+vec3(0,1,0)),h1(i+vec3(1,1,0)),f.x), f.y),
mix(mix(h1(i+vec3(0,0,1)),h1(i+vec3(1,0,1)),f.x), mix(h1(i+vec3(0,1,1)),h1(i+vec3(1,1,1)),f.x), f.y), f.z);
}
void main(){
float h = uLayer;
vec3 p = vBase * uScale;
vec3 fl = vec3(vn(p*0.045+1.0), vn(p*0.045+7.0), vn(p*0.045+13.0)) - 0.5;
fl += (vec3(vn(p*0.15+3.0), vn(p*0.15+9.0), vn(p*0.15+21.0)) - 0.5) * 0.5;
fl -= vON * dot(fl, vON);
p += fl * uFlow * h * 14.0;
const float CS = 7.0;
vec3 cq = floor(p / CS);
vec3 cc = (cq + 0.5 + (vec3(h1(cq+2.1), h1(cq+5.3), h1(cq+8.7)) - 0.5) * 0.7) * CS;
float cr = h1(cq + 4.4);
p = mix(p, cc, clamp(uClump * h * h * 0.85, 0.0, 0.95));
vec3 c = floor(p);
vec3 f = fract(p) - 0.5;
float r = h1(c);
vec3 jit = vec3(h1(c+1.3), h1(c+2.7), h1(c+4.1)) - 0.5;
float d = length(f - jit * 0.6);
float slen = mix(1.0, 0.2 + 0.8 * r * r * (0.6 + 0.8 * cr), uVar);
slen = clamp(slen, 0.12, 1.0);
float rad = 0.0; float alpha = 1.0;
if (h > 0.0) {
if (h > slen) discard;
float t = h / slen;
rad = uThick * 0.5 * max(pow(1.0 - t, 0.9), 0.3) + 0.015;
rad *= 1.0 + 0.7 * uBlur;
if (d > rad) discard;
alpha = 1.0 - smoothstep(rad * (1.0 - uBlur), rad, d);
alpha *= mix(1.0, 0.75, uBlur * h);
alpha *= 1.0 - smoothstep(0.7, 1.0, t);
if (alpha < 0.02) discard;
}
vec3 N = normalize(vWN);
vec3 V = normalize(cameraPosition - vWP);
vec3 L = normalize(uLDir);
vec3 Ns = normalize(N + jit * 0.9 * h);
float diff = pow(clamp((dot(Ns, L) + 0.25) / 1.25, 0.0, 1.0), 1.5);   /* contrastier than half-lambert: light direction reads clearly */
float ao = mix(0.1, 1.0, pow(h, 0.55));
float tone = (0.8 + 0.4 * r) * (0.88 + 0.24 * cr);
vec3 base = mix(uRoot * 0.5, uTip, pow(h, 0.85)) * tone;
if (uHasPat > 0.5) {
vec2 puv = vec2((vBase.x - uPatO.x) / uPatS.x, 1.0 - (vBase.y - uPatO.y) / uPatS.y) * uPatScale;
vec3 pc = texture2D(uPat, puv).rgb;
vec3 pb = mix(pc * 0.55, pc * 1.08, pow(h, 0.85)) * tone;
base = mix(base, pb, uPatMix);
}
vec3 H = normalize(L + V);
float spec = pow(max(dot(Ns, H), 0.0), 18.0) * 0.35 * h;
float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * h;
vec3 envD = textureCubeUV(uEnv, uEnvRot * normalize(N + jit * 0.5 * h), 1.0).rgb;            /* blurred environment = ambient light from that direction */
vec3 envS = textureCubeUV(uEnv, uEnvRot * reflect(-V, N), 0.55).rgb;                          /* soft environment reflection on the strands */
vec3 amb = mix(uAmbB, uAmbT, N.y * 0.5 + 0.5) + envD * uEnvAmb;
float rdiff = dot(Ns, normalize(uRDir)) * 0.5 + 0.5;
vec3 col = base * (amb + 0.95 * diff * uKeyCol * uKeyI + uRimCol * uRimI * 0.1 * rdiff) * ao + uTip * spec * uKeyI + mix(uTip, vec3(1.0), 0.5) * envS * (rim * 0.55 + 0.05 * h) * uSpecK;
gl_FragColor = vec4(col, alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
let furMats = [], mossMats = [];
const furPatDummy = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
furPatDummy.needsUpdate = true;
let furPatTex = null, furBox = { x: 0, y: 0, w: 1, h: 1 };
function loadFurPattern() {
const url = ST.get('furPattern');
if (furPatTex) { furPatTex.dispose(); furPatTex = null; }
if (!url) { applyFurUniforms(); return; }
const _tl = new THREE.TextureLoader(); _tl.setCrossOrigin('anonymous');
_tl.load(url, (tex) => {
tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4; tex.needsUpdate = true;
furPatTex = tex; applyFurUniforms();
});
}
function applyFurUniforms() {
const g = (k) => ST.get(k);
const rootC = new THREE.Color(g('furColor'));
const tip = rootC.clone().lerp(new THREE.Color(0xffffff), 0.45);
for (const fm of furMats) {
const u = fm.m.uniforms;
u.uLen.value = g('furLength') * fm.S * 0.07;
u.uScale.value = g('furDensity') / fm.S;
u.uFluff.value = g('furFluff'); u.uGrav.value = g('furGravity');
u.uClump.value = g('furClump'); u.uFlow.value = g('furFlow');
u.uPat.value = furPatTex || furPatDummy; u.uHasPat.value = furPatTex ? 1 : 0; u.uPatMix.value = g('furPatMix'); u.uPatScale.value = g('furPatScale');
u.uPatO.value.set(furBox.x, furBox.y); u.uPatS.value.set(furBox.w, furBox.h);
u.uBlur.value = g('furBlur'); u.uThick.value = g('furThickness'); u.uVar.value = g('furVariation');
u.uRoot.value.copy(rootC); u.uTip.value.copy(tip);
}
updateFurLight();
}
const ENV_AMB = { room: [[1, 1, 1], [1, 1, 1]], studio: [[1.05, 1.05, 1.1], [0.55, 0.55, 0.6]], sky: [[0.75, 0.9, 1.35], [0.6, 0.55, 0.5]], sunset: [[0.7, 0.45, 0.8], [0.9, 0.5, 0.3]], night: [[0.12, 0.13, 0.22], [0.05, 0.05, 0.08]], neutral: [[1, 1, 1], [0.8, 0.8, 0.8]] };
function updateFurLight() {
if (!furMats.length) return;
let p; try { p = LP[ST.get('lightPreset')] || LP.default; } catch (e) { return; }
const envScale = ST.get('envIntensity') * p.e / 2.05;
const ea = ENV_AMB[ST.get('envPreset')] || ENV_AMB.room;
const hc = new THREE.Color(p.hc), hI = p.h * 0.25;
const top = hc.clone().multiplyScalar(hI);                /* ambient now comes from the sampled environment; only the hemisphere light is added here */
const bot = hc.clone().multiplyScalar(hI * 0.7);
const L = new THREE.Vector3(...p.kp).normalize(), Rd = new THREE.Vector3(...p.rp).normalize();
const kc = new THREE.Color(p.kc), rc = new THREE.Color(p.rc);
let ki = ST.get('lightIntensity') * p.k / 0.4, rI = p.r;
if (ST.get('mlMode') === 'only') {
const act = []; for (let n = 1; n <= 4; n++) if (ST.get('ml' + n + 'On')) act.push(n);
ki = 0; rI = 0;
const g = (n, k) => ST.get('ml' + n + k);
if (act[0]) { const n = act[0]; L.set(g(n, 'X'), g(n, 'Y'), g(n, 'Z')).normalize(); kc.set(g(n, 'Col')); ki = g(n, 'Int') * 0.6; }
if (act[1]) { const n = act[1]; Rd.set(g(n, 'X'), g(n, 'Y'), g(n, 'Z')).normalize(); rc.set(g(n, 'Col')); rI = g(n, 'Int') * 0.6; }
}
for (const fm of furMats) {
const u = fm.m.uniforms;
u.uLDir.value.copy(L); u.uKeyCol.value.copy(kc); u.uKeyI.value = ki;
u.uAmbT.value.copy(top); u.uAmbB.value.copy(bot);
u.uRDir.value.copy(Rd); u.uRimCol.value.copy(rc); u.uRimI.value = rI;
u.uEnvK.value = Math.min(envScale, 3);
u.uEnvAmb.value = Math.min(envScale, 4) * 0.13; u.uSpecK.value = Math.min(envScale, 4) * 0.6;
}
poke(1500);
}
function furEnvDefines() {
const t = scene.environment, H = (t && t.image && t.image.height) || 1024;
const maxMip = Math.log2(H) - 2;
return { ENVMAP_TYPE_CUBE_UV: '', CUBEUV_TEXEL_WIDTH: String(1 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16))), CUBEUV_TEXEL_HEIGHT: String(1 / H), CUBEUV_MAX_MIP: maxMip.toFixed(1) };
}
function updateFurEnv() {
if (!furMats.length) return;
const rot = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, -(ST.get('metalEnvRot') || 0) * Math.PI / 180, 0)));
for (const fm of furMats) { fm.m.uniforms.uEnv.value = scene.environment; fm.m.uniforms.uEnvRot.value.copy(rot); }
poke(1500);
}
const mossU = { uMC1: { value: new THREE.Color('#3a6612') }, uMC2: { value: new THREE.Color('#a8d02c') }, uMFz: { value: 0.8 }, uMBump: { value: 1 }, uMScale: { value: 0.05 } };
let mossMat = null;
const mossGeoBig = new THREE.SphereGeometry(1, 16, 12), mossGeoSmall = new THREE.SphereGeometry(1, 10, 7), mossGeoTiny = new THREE.SphereGeometry(1, 7, 5);
function getMossMat() {
if (mossMat) return mossMat;
mossMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
mossMat.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, mossU);
sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vMH; varying vec3 vMP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMH = position.y; float ph = dot(instanceMatrix[3].xyz, vec3(12.9, 78.2, 37.7)); transformed += normalize(position) * sin(position.x * 6.0 + ph) * sin(position.z * 7.0 + ph * 1.7) * sin(position.y * 5.0 + ph * 0.6) * 0.14; vMP = (instanceMatrix * vec4(position, 1.0)).xyz;');
sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying float vMH; varying vec3 vMP; uniform vec3 uMC1, uMC2; uniform float uMFz, uMBump, uMScale;
float mH(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
float mN(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
return mix(mix(mix(mH(i),mH(i+vec3(1,0,0)),f.x),mix(mH(i+vec3(0,1,0)),mH(i+vec3(1,1,0)),f.x),f.y),
mix(mix(mH(i+vec3(0,0,1)),mH(i+vec3(1,0,1)),f.x),mix(mH(i+vec3(0,1,1)),mH(i+vec3(1,1,1)),f.x),f.y),f.z); }`)
.replace('#include <color_fragment>', `#include <color_fragment>
{
float hh = clamp(vMH * 0.5 + 0.5, 0.0, 1.0);
float sp = mN(vMP * uMScale * 9.0), sp2 = mN(vMP * uMScale * 26.0 + 3.0);
vec3 mc = mix(uMC1 * 0.55, uMC2, smoothstep(0.05, 0.95, hh * 0.95 + (sp - 0.5) * 0.45));
mc *= 0.78 + 0.44 * sp2;
mc += uMC2 * 0.2 * smoothstep(0.7, 0.95, mN(vMP * uMScale * 70.0)) * uMFz;
diffuseColor.rgb *= mc * mix(0.16, 1.0, smoothstep(0.0, 0.6, hh));
}`)
.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{
float fz = mN(vMP * uMScale * 24.0) * 0.55 + mN(vMP * uMScale * 60.0 + 9.0) * 0.45;
vec2 dH = vec2(dFdx(fz), dFdy(fz)) * 0.05 * uMFz * uMBump;
vec3 sX = dFdx(-vViewPosition), sY = dFdy(-vViewPosition);
vec3 R1 = cross(sY, normal), R2 = cross(normal, sX);
float det = dot(sX, R1);
vec3 grad = sign(det) * (dH.x*R1 + dH.y*R2);
normal = normalize(abs(det)*normal - grad);
}`);
};
mossMat.customProgramCacheKey = () => 'moss2';
return mossMat;
}
function mossHash(x, y, z) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1103515245); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function mossN(x, y, z) {
const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z); let fx = x - ix, fy = y - iy, fz = z - iz;
fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
const L = (a, b, t) => a + (b - a) * t, H = mossHash;
return L(L(L(H(ix, iy, iz), H(ix + 1, iy, iz), fx), L(H(ix, iy + 1, iz), H(ix + 1, iy + 1, iz), fx), fy), L(L(H(ix, iy, iz + 1), H(ix + 1, iy, iz + 1), fx), L(H(ix, iy + 1, iz + 1), H(ix + 1, iy + 1, iz + 1), fx), fy), fz);
}
function mossF(x, y, z) { let a = 0.5, s = 0; for (let i = 0; i < 4; i++) { s += a * mossN(x, y, z); x = x * 2.03 + 7.1; y = y * 2.03 + 7.1; z = z * 2.03 + 7.1; a *= 0.5; } return s; }
function mossRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function applyMossUniforms() {
const g = (k) => ST.get(k);
mossU.uMC1.value.set(g('stoneMossColor')); mossU.uMC2.value.set(g('stoneMossColor2'));
mossU.uMFz.value = g('stoneMossFuzz'); mossU.uMBump.value = g('stoneMossBump');
poke(800);
}
function applyMoss() {
for (const mm of mossMats) { mm.mesh.remove(mm.holderObj); if (mm.holderObj.dispose) mm.holderObj.dispose(); }
mossMats = [];
if (!ST.get('stoneEnabled') || !ST.get('stoneMossOn') || ST.get('furEnabled')) { poke(500); return; }
const g = (k) => ST.get(k);
const allBox = new THREE.Box3();
for (const m of meshes) { m.geometry.computeBoundingBox(); allBox.union(m.geometry.boundingBox); }
const gsz = allBox.getSize(new THREE.Vector3());
const S = Math.max(gsz.x, gsz.y) || 1;
const R0 = S * 0.02 * g('stoneMossBubble');
const flat = Math.min(1.8, Math.max(0.3, 0.5 * g('stoneMossHeight') + 0.3));
const invS = stoneU.uInvS.value * g('stoneTexScale'), scl = g('stoneMossScale'), drip = Math.max(g('stoneMossDrip'), 0.3), topK = g('stoneMossTop');
const thr = 1.08 - 0.8 * g('stoneMossAmt');
mossU.uMScale.value = 1 / R0;
const mat = getMossMat();
const _p = new THREE.Vector3(), _n = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _m = new THREE.Matrix4(), _c = new THREE.Color(), _up = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3(), _q2 = new THREE.Vector3();
const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), fn = new THREE.Vector3();
meshes.forEach((mesh, mi) => {
const geo = mesh.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, idx = geo.index;
const tc = (idx ? idx.count : pos.count) / 3;
const cum = new Float64Array(tc); let tot = 0;
const vi = (t, k) => idx ? idx.getX(t * 3 + k) : t * 3 + k;
for (let t = 0; t < tc; t++) {
A.fromBufferAttribute(pos, vi(t, 0)); B.fromBufferAttribute(pos, vi(t, 1)); C.fromBufferAttribute(pos, vi(t, 2));
B.sub(A); C.sub(A); tot += B.cross(C).length() * 0.5; cum[t] = tot;
}
if (!tot) return;
const rng = mossRng(1337 + mi * 17 + Math.floor(g('stoneSeed') || 0));
const cand = Math.min(70000, Math.floor(tot / (R0 * R0) * 2.4));
const big = [], small = [], tiny = [], ground = [];
for (let i = 0; i < cand && big.length < 9000; i++) {
const r = rng() * tot; let lo = 0, hi = tc - 1;
while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; }
const a = vi(lo, 0), b = vi(lo, 1), c = vi(lo, 2);
let u = rng(), v = rng(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w = 1 - u - v;
A.fromBufferAttribute(pos, a); B.fromBufferAttribute(pos, b); C.fromBufferAttribute(pos, c);
_p.set(A.x * w + B.x * u + C.x * v, A.y * w + B.y * u + C.y * v, A.z * w + B.z * u + C.z * v);
fn.copy(B).sub(A).cross(C.clone().sub(A)).normalize();
if (nor) {
_n.set(0, 0, 0);
for (const [ii, ww] of [[a, w], [b, u], [c, v]]) _n.x += nor.getX(ii) * ww, _n.y += nor.getY(ii) * ww, _n.z += nor.getZ(ii) * ww;
_n.normalize();
if (_n.dot(fn) < 0.4) _n.copy(fn); else if (_n.dot(fn) < 0) _n.negate();
} else _n.copy(fn);
const qx = _p.x * invS, qy = _p.y * invS, qz = _p.z * invS;
const mx = qx * scl, my = qy / drip * scl, mz = qz * scl;
let cov = mossF(mx * 3 + 40, my * 3 + 40, mz * 3 + 40) * 0.62 + mossF(mx * 9 + 7, my * 9 + 7, mz * 9 + 7) * 0.38;
const topv = 1 - Math.min(1, Math.max(0, qy * 1.3));
cov += topK * (topv * 0.85 + (-_n.y) * 0.5 - 0.5);
cov += (mossN(qx * 55, qy * 55, qz * 55) - 0.5) * 0.16;
if (cov < thr + (rng() - 0.5) * 0.06) continue;
const e = Math.min(1, Math.max(0, (cov - thr) / 0.2)); const edgeT = e * e * (3 - 2 * e);
const Rl = R0 * (0.4 + 0.6 * edgeT) * (0.7 + 0.6 * rng());
_n.x += (rng() - 0.5) * 0.3; _n.y += (rng() - 0.5) * 0.3; _n.z += (rng() - 0.5) * 0.3; _n.normalize();
const cx = _p.x + _n.x * Rl * flat * 0.3, cy = _p.y + _n.y * Rl * flat * 0.3, cz = _p.z + _n.z * Rl * flat * 0.3;
const tt = rng();
big.push([cx, cy, cz, _n.x, _n.y, _n.z, Rl, 0.78 + 0.34 * tt, 0.95 + 0.1 * rng(), 0.72 + 0.3 * (1 - tt)]);
ground.push([_p.x + _n.x * Rl * 0.05, _p.y + _n.y * Rl * 0.05, _p.z + _n.z * Rl * 0.05, _n.x, _n.y, _n.z, Rl * 1.35, 0.5, 0.62, 0.45]);
const ns = 3 + Math.round(rng() * 3);
for (let j = 0; j < ns; j++) {
_d.set(_n.x + (rng() - 0.5) * 1.8, _n.y + (rng() - 0.5) * 1.8, _n.z + (rng() - 0.5) * 1.8).normalize();
if (_d.dot(_n) < 0.25) continue;
const Rs = Rl * (0.32 + 0.22 * rng());
const t2 = rng(); const sx = cx + _d.x * Rl * 0.8, sy = cy + _d.y * Rl * 0.8 * flat, sz = cz + _d.z * Rl * 0.8;
small.push([sx, sy, sz, _d.x, _d.y, _d.z, Rs, 0.82 + 0.4 * t2, 0.98 + 0.1 * rng(), 0.7 + 0.3 * (1 - t2)]);
for (let k2 = 0; k2 < 3; k2++) {
_q2.set(_d.x + (rng() - 0.5) * 1.6, _d.y + (rng() - 0.5) * 1.6, _d.z + (rng() - 0.5) * 1.6).normalize();
if (_q2.dot(_d) < 0.3) continue;
const Rt = Rs * (0.3 + 0.2 * rng()); const t3 = rng();
tiny.push([sx + _q2.x * Rs * 0.8, sy + _q2.y * Rs * 0.8, sz + _q2.z * Rs * 0.8, _q2.x, _q2.y, _q2.z, Rt, 0.9 + 0.3 * t3, 1.0 + 0.1 * rng(), 0.68 + 0.3 * (1 - t3)]);
}
}
}
const build = (list, geom, kind) => {
if (!list.length) return;
const im = new THREE.InstancedMesh(geom, mat, list.length);
im.frustumCulled = false; im.castShadow = false; im.receiveShadow = false;
list.forEach((it, k) => {
_p.set(it[0], it[1], it[2]); _n.set(it[3], it[4], it[5]); _q.setFromUnitVectors(_up, _n);
const R = it[6]; _s.set(R, R * (kind === 2 ? 0.28 : kind === 1 ? 0.85 : flat), R);
_m.compose(_p, _q, _s); im.setMatrixAt(k, _m);
im.setColorAt(k, _c.setRGB(it[7], it[8], it[9]));
});
im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
mesh.add(im); mossMats.push({ mesh, holderObj: im });
};
build(ground, mossGeoBig, 2); build(big, mossGeoBig, 0); build(small, mossGeoSmall, 1); build(tiny, mossGeoTiny, 1);
});
applyMossUniforms();
}
function applyFur() { applyFurCore(); applyMoss(); }
function applyFurCore() {
for (const fm of furMats) { fm.mesh.remove(fm.holderObj); fm.m.dispose(); }
furMats = [];
for (const mesh of meshes) for (const ch of [...mesh.children]) mesh.remove(ch);
if (!ST.get('furEnabled')) return;
const allBox = new THREE.Box3();
for (const m of meshes) { m.geometry.computeBoundingBox(); allBox.union(m.geometry.boundingBox); }
const gsz = allBox.getSize(new THREE.Vector3());
furBox = { x: allBox.min.x, y: allBox.min.y, w: gsz.x || 1, h: gsz.y || 1 };
const S = Math.max(gsz.x, gsz.y) || 1;
meshes.forEach((mesh) => {
const g = mesh.geometry;
const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
const N = Math.floor(Math.max(28, Math.min(ST.get('furLayers') * Math.max(1, ST.get('furLength') / 1.2), 120, Math.floor(7e6 / Math.max(tris, 1)))));
const mk = (h) => new THREE.ShaderMaterial({
vertexShader: FUR_VS, fragmentShader: FUR_FS, transparent: h > 0, depthWrite: h === 0, defines: furEnvDefines(),
uniforms: { uEnv: { value: scene.environment }, uEnvRot: { value: new THREE.Matrix3() }, uEnvAmb: { value: 0.3 }, uSpecK: { value: 1 }, uLayer: { value: h }, uLen: { value: 1 }, uScale: { value: 1 }, uFluff: { value: 0 }, uGrav: { value: 0 }, uClump: { value: 0 }, uFlow: { value: 0 }, uThick: { value: 1 }, uVar: { value: 1 }, uBlur: { value: 0.35 }, uPat: { value: furPatDummy }, uHasPat: { value: 0 }, uPatMix: { value: 1 }, uPatScale: { value: 1 }, uPatO: { value: new THREE.Vector2() }, uPatS: { value: new THREE.Vector2(1, 1) }, uLDir: { value: new THREE.Vector3(0.4, 0.7, 0.6) }, uKeyCol: { value: new THREE.Color(1, 1, 1) }, uKeyI: { value: 1 }, uAmbT: { value: new THREE.Color(0.3, 0.3, 0.3) }, uAmbB: { value: new THREE.Color(0.3, 0.3, 0.3) }, uRDir: { value: new THREE.Vector3(-5, 2, -4) }, uRimCol: { value: new THREE.Color(0.5, 0.67, 1) }, uRimI: { value: 1.2 }, uEnvK: { value: 1 }, uRoot: { value: new THREE.Color() }, uTip: { value: new THREE.Color() } },
});
const m0 = mk(0);
mesh.material = m0;
furMats.push({ mesh, holderObj: new THREE.Object3D(), m: m0, S });
for (let i = 1; i <= N; i++) {
const m = mk(i / N);
const sh = new THREE.Mesh(g, m);
sh.castShadow = false; sh.receiveShadow = false; sh.renderOrder = 10 + i;
mesh.add(sh);
furMats.push({ mesh, holderObj: sh, m, S });
}
});
applyFurUniforms();
}
const metalU = {
uBrushA: { value: 0 }, uBrushS: { value: 0.6 }, uGrain: { value: 1 }, uAn: { value: 0.6 },
uEdge: { value: 0.5 }, uScr: { value: 0.9 }, uEdgeCol: { value: new THREE.Color(1, 1, 1) },
};
let metalMatInst = null;
function getMetalMat() {
if (metalMatInst) return metalMatInst;
const m = new THREE.MeshPhysicalMaterial({ color: 0xdfe3ea, metalness: 1, roughness: 0.35 });
m.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, metalU);
sh.vertexShader = sh.vertexShader
.replace('#include <common>', '#include <common>\nuniform float uBrushA; varying vec3 vObjP; varying vec3 vPerpV;')
.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjP = position; vPerpV = normalize(mat3(modelViewMatrix) * vec3(-sin(uBrushA), cos(uBrushA), 0.0));');
sh.fragmentShader = sh.fragmentShader
.replace('#include <common>', `#include <common>
uniform float uBrushA, uBrushS, uGrain, uAn, uEdge, uScr; uniform vec3 uEdgeCol; varying vec3 vObjP; varying vec3 vPerpV;
float mh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
vec2 mh2(vec2 p){ return vec2(mh(p), mh(p + 17.31)); }
vec3 scr(vec2 p, float sc, float dens){
vec2 q = p * sc, c0 = floor(q); vec3 acc = vec3(0.0);
for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
vec2 c = c0 + vec2(float(i), float(j)); vec2 h = mh2(c); vec2 h2 = mh2(c + 5.7);
if (h2.x > dens) continue;
float a = h.x * 3.14159; vec2 d = vec2(cos(a), sin(a));
float len = mix(0.5, 2.2, h2.y * h2.y);
vec2 ctr = c + h2 + (h - 0.5) * 0.6; vec2 r = q - ctr;
float t = clamp(dot(r, d), -len, len); vec2 e = r - d * t;
float w = mix(0.012, 0.035, mh(c + 3.1));
float l = smoothstep(w, 0.0, length(e)) * (0.35 + 0.65 * h.y);
acc += vec3(l, l * dot(normalize(e + 1e-5), vec2(-d.y, d.x)), 0.0);
}
return acc;
}
float mn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
return mix(mix(mh(i),mh(i+vec2(1,0)),f.x), mix(mh(i+vec2(0,1)),mh(i+vec2(1,1)),f.x), f.y); }`)
.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{
vec2 bd = vec2(cos(uBrushA), sin(uBrushA)), bp = vec2(-bd.y, bd.x);
float cu = dot(vObjP.xy, bd), cv = dot(vObjP.xy, bp) + vObjP.z;
float st = 1.0 + uAn * 14.0;
float g1 = mn(vec2(cu * 0.02 * uGrain / st, cv * 1.1 * uGrain));
float g2 = mn(vec2(cu * 0.09 * uGrain / st, cv * 3.7 * uGrain));
float g3 = mn(vec2(cu * 0.5 * uGrain / st, cv * 11.0 * uGrain));
float g = g1 * 0.5 + g2 * 0.32 + g3 * 0.18;
vec3 pv = vPerpV - normal * dot(vPerpV, normal);
normal = normalize(normal + pv * (g - 0.5) * uBrushS * 0.9);
roughnessFactor = clamp(roughnessFactor * (1.0 + (g2 - 0.5) * 0.5 * uBrushS), 0.02, 1.0);
vec2 sp = vec2(vObjP.x + vObjP.z * 0.7, vObjP.y - vObjP.z * 0.45) * uGrain;
vec3 s1 = scr(sp, 0.012, 0.55), s2 = scr(sp + 91.0, 0.03, 0.5), s3 = scr(sp * 1.0 + 37.0, 0.085, 0.4);
float sl = (s1.x * 1.0 + s2.x * 0.8 + s3.x * 0.6);
float sn = (s1.y * 1.0 + s2.y * 0.8 + s3.y * 0.6);
vec3 pv2 = vPerpV - normal * dot(vPerpV, normal);
vec2 pit = floor(sp * 0.22); vec2 pf = fract(sp * 0.22) - mh2(pit);
float pits = step(0.93, mh(pit + 7.0)) * smoothstep(0.1, 0.0, length(pf));
vec3 tx = normalize(cross(normal, vec3(0.0, 0.0, 1.0)) + 1e-4);
normal = normalize(normal + tx * sn * uScr * 0.55);
roughnessFactor = clamp(roughnessFactor + (sl * 0.45 + pits * 0.5) * uScr, 0.02, 1.0);
}`)
.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{
vec3 fN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
float ed = 1.0 - abs(dot(normalize(nonPerturbedNormal), fN));
totalEmissiveRadiance += uEdgeCol * uEdge * smoothstep(0.02, 0.22, ed) * 0.55;
}`);
};
m.customProgramCacheKey = () => 'metalbrushed4';
metalMatInst = m;
return m;
}
function metalTintColor(t) {
const A = new THREE.Color(0.86, 0.89, 0.94), B = new THREE.Color(1.0, 0.8, 0.38), C = new THREE.Color(0.96, 0.6, 0.48);
return t < 0.5 ? A.clone().lerp(B, t * 2) : B.clone().lerp(C, (t - 0.5) * 2);
}
function applyMetalUniforms() {
const g = (k) => ST.get(k);
metalU.uBrushA.value = g('metalBrushDir') * Math.PI / 180;
metalU.uBrushS.value = g('metalBrushStrength');
metalU.uGrain.value = g('metalGrain');
metalU.uAn.value = g('metalAniso');
metalU.uEdge.value = g('metalEdge'); metalU.uScr.value = g('metalScratch');
const col = new THREE.Color(g('colorMetal'));
metalU.uEdgeCol.value.copy(col).lerp(new THREE.Color(1, 1, 1), 0.6);
if (metalMatInst) {
metalMatInst.color.copy(col);
metalMatInst.roughness = g('metalRough');
metalMatInst.envMapIntensity = 1;
}
poke(1500);
}
const glassU = { uScrA: { value: 0.4 }, uScrS: { value: 1 }, uLens: { value: 0.8 }, uLC: { value: new THREE.Vector3() }, uLR: { value: 100 }, uLK: { value: 0.5 }, uHM: { value: null }, uHB: { value: new THREE.Vector3(0, 0, 1) }, uBend: { value: 1.3 }, uCA: { value: 1.2 }, uLD: { value: 0.6 }, uBack: { value: new THREE.Color('#ffffff') } };
let glassMat = null;
function getGlassMat() {
if (glassMat) return glassMat;
const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 2, ior: 1.66, dispersion: 2, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 800] });
m.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, glassU);
sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vGP; varying vec3 vLD; varying vec3 vGN; varying vec2 vLCuv; varying vec3 vNMx; varying vec3 vNMy; uniform vec3 uLC; uniform float uLR;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvNMx = normalMatrix[0]; vNMy = normalMatrix[1]; vGP = position; vGN = normal; vLD = normalMatrix * vec3((position.xy - uLC.xy) / uLR, 0.0); { vec4 lcp = projectionMatrix * modelViewMatrix * vec4(uLC, 1.0); vLCuv = (lcp.xy / lcp.w) * 0.5 + 0.5; }');
sh.fragmentShader = sh.fragmentShader.replace('#include <transmission_pars_fragment>', glassTransChunk()).replace('#include <common>', `#include <common>
uniform float uScrA, uScrS, uLens, uLK, uBend, uCA, uLD; uniform sampler2D uHM; uniform vec3 uHB; varying vec3 vNMx; varying vec3 vNMy; varying vec2 vLCuv; varying vec3 vGP; varying vec3 vLD; varying vec3 vGN; float gScr; vec2 gBend = vec2(0.0);
float gh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
vec2 gh2(vec2 p){ return vec2(gh(p), gh(p + 17.31)); }
vec3 gscr(vec2 p, float sc, float dens){
vec2 q = p * sc, c0 = floor(q); vec3 acc = vec3(0.0);
for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
vec2 c = c0 + vec2(float(i), float(j)); vec2 h = gh2(c); vec2 h2 = gh2(c + 5.7);
if (h2.x > dens) continue;
float a = h.x * 3.14159; vec2 d = vec2(cos(a), sin(a));
float len = mix(0.5, 2.2, h2.y * h2.y);
vec2 ctr = c + h2 + (h - 0.5) * 0.6; vec2 r = q - ctr;
float t = clamp(dot(r, d), -len, len); vec2 e = r - d * t;
float w = mix(0.012, 0.035, gh(c + 3.1));
float l = smoothstep(w, 0.0, length(e)) * (0.35 + 0.65 * h.y);
acc += vec3(l, l * dot(normalize(e + 1e-5), vec2(-d.y, d.x)), 0.0);
}
return acc;
}`).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{
vec2 sp = vec2(vGP.x + vGP.z * 0.7, vGP.y - vGP.z * 0.45) * uScrS;
vec3 s1 = gscr(sp, 0.012, 0.55), s2 = gscr(sp + 91.0, 0.03, 0.5), s3 = gscr(sp + 37.0, 0.085, 0.4);
gScr = s1.x + s2.x * 0.8 + s3.x * 0.6;
float sn = s1.y + s2.y * 0.8 + s3.y * 0.6;
vec3 tx = normalize(cross(normal, vec3(0.0, 0.0, 1.0)) + 1e-4);
normal = normalize(normal + tx * sn * uScrA * 0.5);
float capW = smoothstep(0.25, 0.8, abs(normalize(vGN).z));
float ld = length(vLD);
vec3 lo = vLD / max(ld, 1e-4);
normal = normalize(normal + lo * min(ld, 1.4) * uLens * 0.55 * capW);
{
float e = 1.0 / 256.0;
vec2 hu = (vGP.xy - uHB.xy) / uHB.z + 0.5;
float h0 = texture2D(uHM, hu).r, hx = texture2D(uHM, hu + vec2(e, 0.0)).r, hy = texture2D(uHM, hu + vec2(0.0, e)).r;
vec2 gr = vec2(hx - h0, hy - h0) / e;
vec3 bd = vNMx * gr.x + vNMy * gr.y;
normal = normalize(normal - bd * 0.0004 * uBend * capW);
gBend = bd.xy * (0.00006 * uBend) * (0.4 + 0.6 * capW);
}
}`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0) * gScr * uScrA * 0.18;`);
};
m.customProgramCacheKey = () => 'glass8';
glassMat = m;
return m;
}
function glassTransChunk() {
const parts = THREE.ShaderChunk.transmission_pars_fragment.replace('#ifdef USE_TRANSMISSION', '#ifdef USE_TRANSMISSION\nuniform vec3 uBack;').replace('return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );', 'vec4 _ts = textureBicubic( transmissionSamplerMap, fragCoord.xy, lod ); return vec4( mix( uBack, _ts.rgb, smoothstep( 0.6, 0.9, _ts.a ) ), 1.0 );').split('refractionCoords /= 2.0;');
const core = 'vec2 dd0 = (refractionCoords - vLCuv) * uLK; refractionCoords = vLCuv + dd0 * (1.0 + uLD * dot(dd0, dd0) * 4.0) + gBend;';
const ca = ' refractionCoords += (float(i) - 1.0) * uCA * (gBend * 1.5 + dd0 * 0.03);';
if (parts.length === 3) return parts[0] + 'refractionCoords /= 2.0; ' + core + ca + parts[1] + 'refractionCoords /= 2.0; ' + core + parts[2];
return parts.join('refractionCoords /= 2.0; ' + core);
}
let glassMapKey = '', glassMapTex = null;
function buildGlassMap(bb) {
const key = itemsVer + '|' + items.length;
if (key === glassMapKey && glassMapTex) return;
const N = 256, bs = bb.getSize(new THREE.Vector3()), bc = bb.getCenter(new THREE.Vector3());
const Sx = Math.max(bs.x, bs.y, 1) * 1.1;
const cv = new OffscreenCanvas(1, 1); cv.width = N; cv.height = N;
const cx = cv.getContext('2d', { willReadFrequently: true });
cx.fillStyle = '#000'; cx.fillRect(0, 0, N, N); cx.fillStyle = '#fff';
const tp = (q) => [((q.x - bc.x) / Sx + 0.5) * N, ((q.y - bc.y) / Sx + 0.5) * N];
items.forEach((it) => it.shapes.forEach((sh) => {
cx.beginPath();
[sh.getPoints(16), ...sh.holes.map((h) => h.getPoints(16))].forEach((pts) => { pts.forEach((q, i) => { const [x, y] = tp(q); if (i) cx.lineTo(x, y); else cx.moveTo(x, y); }); cx.closePath(); });
cx.fill('evenodd');
}));
const px = cx.getImageData(0, 0, N, N).data, d = new Float32Array(N * N);
for (let i = 0; i < N * N; i++) d[i] = px[i * 4] > 127 ? 1e4 : 0;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; if (!d[i]) continue; let m = d[i]; if (x > 0) m = Math.min(m, d[i - 1] + 1); if (y > 0) m = Math.min(m, d[i - N] + 1); if (x > 0 && y > 0) m = Math.min(m, d[i - N - 1] + 1.41); if (x < N - 1 && y > 0) m = Math.min(m, d[i - N + 1] + 1.41); d[i] = m; }
for (let y = N - 1; y >= 0; y--) for (let x = N - 1; x >= 0; x--) { const i = y * N + x; if (!d[i]) continue; let m = d[i]; if (x < N - 1) m = Math.min(m, d[i + 1] + 1); if (y < N - 1) m = Math.min(m, d[i + N] + 1); if (x < N - 1 && y < N - 1) m = Math.min(m, d[i + N + 1] + 1.41); if (x > 0 && y < N - 1) m = Math.min(m, d[i + N - 1] + 1.41); d[i] = m; }
let mx = 1; for (let i = 0; i < N * N; i++) if (d[i] < 1e3) mx = Math.max(mx, d[i]);
let h = new Float32Array(N * N); for (let i = 0; i < N * N; i++) h[i] = d[i] > 1e3 ? 0 : Math.sqrt(Math.min(1, d[i] / mx));
for (let pass = 0; pass < 4; pass++) { const o = new Float32Array(N * N); for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { let sum = 0; for (let j = -1; j <= 1; j++) for (let i2 = -1; i2 <= 1; i2++) sum += h[(y + j) * N + x + i2]; o[y * N + x] = sum / 9; } h = o; }
const data = new Uint8Array(N * N * 4);
for (let i = 0; i < N * N; i++) { const v = Math.round(Math.min(1, h[i]) * 255); data[i * 4] = v; data[i * 4 + 1] = v; data[i * 4 + 2] = v; data[i * 4 + 3] = 255; }
if (glassMapTex) glassMapTex.dispose();
glassMapTex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
glassMapTex.magFilter = THREE.LinearFilter; glassMapTex.minFilter = THREE.LinearFilter; glassMapTex.needsUpdate = true;
glassMapKey = key;
glassU.uHM.value = glassMapTex; glassU.uHB.value.set(bc.x, bc.y, Sx);
}
function applyGlass() {
if (ST.get('deformPreset') !== 'glass') return;
const g = (k) => ST.get(k);
const m = getGlassMat();
const sz = g('size') || 20;
m.ior = Math.min(2.5, Math.max(1.25, g('glassIor') + g('glassLens') * 0.35));
m.dispersion = Math.max(g('glassDisp') * 40, g('glassCA') > 0 ? 0.5 : 0);
m.thickness = Math.min(sz * 0.8, g('glassThick') * sz * 0.05 * (1 + g('glassLens') * 1.5));
const bb = new THREE.Box3(); meshes.forEach((me) => { me.geometry.computeBoundingBox(); bb.union(me.geometry.boundingBox); });
const bc = bb.getCenter(new THREE.Vector3()), bsz = bb.getSize(new THREE.Vector3());
buildGlassMap(bb); glassU.uBend.value = g('glassBend'); glassU.uCA.value = g('glassCA'); glassU.uLD.value = g('glassLD'); glassU.uLC.value.set(bc.x, bc.y, bc.z); glassU.uLK.value = 1 / (1 + g('glassLens') * 0.8); glassU.uLR.value = Math.max(bsz.x, bsz.y, 1) * 0.5; glassU.uLens.value = g('glassLens');
m.attenuationColor.set(g('glassTint'));
m.attenuationDistance = g('glassAbs') < 0.01 ? Infinity : sz * (3 - 2.7 * g('glassAbs'));
m.iridescence = g('glassRainbow');
m.roughness = 0.02 + g('glassFrost') * 0.6;
m.clearcoatRoughness = 0.03 + g('glassFrost') * 0.3;
glassU.uBack.value.set(g('glassBack')); glassU.uScrA.value = g('glassScrA'); glassU.uScrS.value = g('glassScrS');
meshes.forEach((mesh) => { mesh.material = m; });
poke(1500);
}
for (const k of ['glassIor', 'glassDisp', 'glassThick', 'glassTint', 'glassBack', 'glassAbs', 'glassRainbow', 'glassFrost', 'glassScrA', 'glassScrS']) ST.onChange(k, applyGlass);
ST.onChange('glassLens', applyGlass);
ST.onChange('glassBend', applyGlass);
ST.onChange('glassCA', applyGlass);
ST.onChange('glassLD', applyGlass);
ST.onChange('glassEdge', () => scheduleRebuild());
ST.onChange('deformPreset', () => applyGlass());
const knitU = {
uCell: { value: 10 }, uCellV: { value: 1 }, uRad: { value: 1 }, uPlies: { value: 2 }, uTwist: { value: 0.55 }, uFuzz: { value: 0.5 },
uHeat: { value: 0.35 }, uIrr: { value: 0.4 }, uKSeed: { value: 3 }, uEAng: { value: 1.2 }, uEDen: { value: 1 }, uEH: { value: 1 },
uThread: { value: new THREE.Color('#f4f1ee') }, uSolid: { value: 0 },
};
const knitMats = [];
function getKnitMat(i) {
if (knitMats[i]) return knitMats[i];
const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0, sheen: 1, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffffff') });
const own = { uY: { value: new THREE.Color('#b98ad9') }, uEmb: { value: 0 } };
m.userData.own = own;
m.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, knitU, own);
sh.vertexShader = sh.vertexShader
.replace('#include <common>', '#include <common>\nvarying vec3 vKP; varying vec3 vKN;')
.replace('#include <begin_vertex>', '#include <begin_vertex>\nvKP = position; vKN = normal;');
sh.fragmentShader = sh.fragmentShader
.replace('#include <common>', `#include <common>
varying vec3 vKP; varying vec3 vKN;
uniform vec3 uY, uThread; uniform float uCell, uCellV, uRad, uPlies, uTwist, uFuzz, uHeat, uIrr, uKSeed, uEAng, uEDen, uEH, uEmb, uSolid;
float kh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
vec4 kh4(vec2 p){ return vec4(kh(p), kh(p+17.3), kh(p+41.7), kh(p+83.1)); }
float kn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
return mix(mix(kh(i),kh(i+vec2(1,0)),f.x), mix(kh(i+vec2(0,1)),kh(i+vec2(1,1)),f.x), f.y); }
float kHv; float kAO; vec3 kAlb;`)
.replace('#include <color_fragment>', `#include <color_fragment>
{
const float A = 0.72;
bool top = abs(vKN.z) > 0.3;
vec2 tg = normalize(vec2(-vKN.y, vKN.x) + 1e-5);
vec2 uvT = vec2(vKP.x, vKP.y) / uCell;
vec2 uvS = vec2(abs(vKN.x) > abs(vKN.y) ? vKP.y : vKP.x, vKP.z) / uCell;
vec2 uv = top ? uvT : uvS;
uv.y /= A;
float fw = max(fwidth(uv.x), fwidth(uv.y));
float lod = smoothstep(0.12, 0.4, fw);
vec3 yc = uY;
float hgt = 0.0;
vec3 col = yc;
float ao = 1.0;
if (uEmb > 0.5 && top) {
vec2 dir = vec2(cos(uEAng), sin(uEAng)), prp = vec2(-dir.y, dir.x);
float th = uCell * 0.30 / uEDen;
float q = dot(vKP.xy, prp) / th;
float s = dot(vKP.xy, dir) / th;
float id = floor(q), f = fract(q);
float rn = kh(vec2(id, 3.7));
float sw = s + sin(id * 1.7) * 3.0;
float prof = sqrt(max(1.0 - pow(2.0 * f - 1.0, 2.0), 0.0));
float gap = smoothstep(0.02, 0.3, prof);
float fib = kn(vec2(sw * 0.4 + rn * 50.0, q * 16.0));
float fib2 = kn(vec2(sw * 0.06 + rn * 9.0, q * 3.0));
hgt = (prof * 0.55 + (fib - 0.5) * 0.10) * th * uEH;
float lw = 0.9 + 0.2 * rn + 0.08 * sin(sw * 0.05 + rn * 6.28);
col = uThread * (0.55 + 0.55 * prof) * lw * (0.88 + 0.24 * fib2);
col = mix(col * 0.1, col, gap);
ao = mix(0.35, 1.0, gap);
kHv = hgt * uCellV;
kAO = ao; kAlb = col;
diffuseColor.rgb = col * ao;
} else {
vec2 ci = floor(uv);
vec2 pI = vec2(uv.x, uv.y * A);
float best = -1.0, second = -1.0, bPly = 1.0, bHeat = 0.0, bT = 0.0;
float R0 = (0.14 + 0.08 * uRad);
for (int dj = -1; dj <= 0; dj++) for (int di = -1; di <= 1; di++) {
vec2 c = ci + vec2(float(di), float(dj));
vec4 rh = kh4(c + uKSeed * 7.13);
vec2 org = vec2(c.x, c.y * A) + (rh.xy - 0.5) * vec2(0.09, 0.07 * A) * uIrr;
float R = R0 * (1.0 + (rh.z - 0.5) * 0.2 * uIrr);
for (int s = 0; s < 2; s++) {
float sd = s == 0 ? -1.0 : 1.0;
vec2 a = org + vec2(0.5 + sd * 0.085, 0.1 * A);
vec2 b = org + vec2(0.5 + sd * (0.365 + 0.03 * (rh.w - 0.5) * uIrr), 1.32 * A);
vec2 ab = b - a; float L2 = dot(ab, ab);
float t = clamp(dot(pI - a, ab) / L2, 0.0, 1.0);
vec2 qv = a + ab * t; vec2 dv = pI - qv; float d = length(dv);
if (d >= R) continue;
float rr = R * (1.0 - 0.22 * pow(abs(2.0 * t - 1.0), 4.0));
if (d >= rr) continue;
float zb = -0.55 * R * smoothstep(0.5, 1.0, t) - 0.1 * R * (1.0 - smoothstep(0.0, 0.25, t));
float hh = zb + sqrt(max(R * R - d * d, 0.0));
float lat = dot(dv, vec2(-ab.y, ab.x)) / (sqrt(L2) * R);
float ph = uPlies * (t * sqrt(L2) * uTwist * 1.6 + asin(clamp(lat, -0.999, 0.999)) / 6.2832) + rh.z * 5.0 + float(s) * 0.37;
float pl = cos(6.2832 * ph);
float plyOn = uPlies > 1.5 ? 1.0 : 0.0;
hh += 0.035 * R * pl * plyOn;
if (hh > best) { second = best; best = hh; bPly = mix(1.0, 0.78 + 0.22 * (0.5 + 0.5 * pl), plyOn); bHeat = kn(vec2(t * 7.0, lat * 2.0) + rh.w * 31.0 + c * 3.7); bT = rh.w; }
else if (hh > second) second = hh;
}
}
if (best < 0.0) {
col = yc * 0.14; ao = 0.4; hgt = -0.45 * R0;
} else {
float fibre = kn(vec2(pI.x * 60.0, pI.y * 60.0));
float hair = kn(pI * 85.0 + 9.0);
float rel = clamp(best / R0, 0.0, 1.0);
ao = clamp(0.35 + 0.65 * smoothstep(-0.2, 0.75, best / R0 - 0.35 * clamp(second / R0, 0.0, 1.0) * 0.0), 0.0, 1.0);
ao *= mix(0.6, 1.0, smoothstep(0.0, 0.6, best - max(second, 0.0) + 0.25 * R0));
col = yc * (1.0 + (bHeat - 0.5) * uHeat * 1.6) * (0.9 + 0.2 * bT) * bPly * (0.9 + 0.2 * fibre);
col += yc * uFuzz * 0.5 * smoothstep(0.80, 1.0, hair) * 0.8;
hgt = best;
}
col = mix(col, yc * 0.72, lod);
ao = mix(ao, 0.75, lod);
hgt *= (1.0 - lod);
if (uSolid > 0.5) { col = yc * (0.5 + 0.2 * kn(pI * 40.0)); hgt = 0.0; ao = 1.0; }
kHv = hgt * uCell * uCellV;
kAO = ao; kAlb = col;
diffuseColor.rgb = col * ao;
}
}`)
.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{
vec2 dH = vec2(dFdx(kHv), dFdy(kHv)) * 1.2;
vec3 sX = dFdx(-vViewPosition), sY = dFdy(-vViewPosition);
vec3 R1 = cross(sY, normal), R2 = cross(normal, sX);
float det = dot(sX, R1);
vec3 grad = sign(det) * (dH.x * R1 + dH.y * R2);
normal = normalize(abs(det) * normal - grad);
}`)
.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{
float ndv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
float rimF = pow(1.0 - ndv, 2.4);
totalEmissiveRadiance += kAlb * uFuzz * rimF * 0.5 * (uEmb > 0.5 ? 0.15 : 1.0);
}`);
};
m.customProgramCacheKey = () => 'knit11';
knitMats[i] = m;
return m;
}
function applyKnitUniforms() {
if (ST.get('deformPreset') !== 'knit') return;
const g = (k) => ST.get(k);
const bb = new THREE.Box3();
for (const m of meshes) { m.geometry.computeBoundingBox(); bb.union(m.geometry.boundingBox); }
const bs = bb.getSize(new THREE.Vector3()); const S = Math.max(bs.x, bs.y, 1);
const cell = S / Math.max(4, g('knitCount'));
knitU.uCell.value = cell;
knitU.uCellV.value = Math.abs(holder.scale.x) || 1;
knitU.uRad.value = g('knitWeight');
knitU.uPlies.value = g('knitPlies'); knitU.uTwist.value = g('knitTwist'); knitU.uFuzz.value = g('knitFuzz');
knitU.uHeat.value = g('knitHeather'); knitU.uIrr.value = g('knitIrreg'); knitU.uKSeed.value = g('knitSeed');
knitU.uEAng.value = g('knitEAng') * Math.PI / 180; knitU.uEDen.value = g('knitEDen'); knitU.uEH.value = g('knitEH');
knitU.uThread.value.set(g('knitThread'));
const uniq = []; items.forEach((it) => { const h = it.color.getHexString(); if (!uniq.includes(h)) uniq.push(h); });
const mode = g('knitEmb'); const n = items.length;
const embIdx = mode === 'last' ? n - 1 : mode === 'second' ? 1 : mode === 'first' ? 0 : -1;
meshes.forEach((mesh, i) => {
const km = getKnitMat(i);
mesh.material = km;
const yi = Math.max(0, uniq.indexOf(items[i].color.getHexString())) % 6;
const ycol = new THREE.Color(g('knitY' + (yi + 1)));
km.userData.own.uY.value.copy(ycol);
km.userData.own.uEmb.value = i === embIdx ? 1 : 0;
if (i === embIdx) km.userData.own.uY.value.set(g('knitThread'));
km.sheenColor.copy(km.userData.own.uY.value).lerp(new THREE.Color(1, 1, 1), 0.35);
km.sheen = 0.4 + 0.6 * g('knitFuzz');
});
updateKnit3D();
poke(1500);
}
/* ---- true 3D stitches: each cell of a grid on the front/back surface gets an instanced V stitch
oriented along the surface normal (surface found by rasterising the extruded triangles) ---- */
const KA = 0.72;
let knitInsts = null, knitPurlGeo = null, knitPurlKey = '', knit3Mat = null, knit3Geo = null, knit3GeoKey = '';
const knit3U = { uPl: { value: 2 }, uTw: { value: 0.55 }, uFz: { value: 0.5 } };
function clearKnit3D() {
if (knitInsts) knitInsts.forEach((o) => { holder.remove(o.mesh); o.mesh.dispose(); });
knitInsts = null;
knitU.uSolid.value = 0;
}
function getKnit3Mat() {
if (knit3Mat) return knit3Mat;
const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0, sheen: 1, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffffff') });
m.onBeforeCompile = (sh) => {
Object.assign(sh.uniforms, knit3U);
sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vKU;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvKU = uv;');
sh.fragmentShader = sh.fragmentShader
.replace('#include <common>', '#include <common>\nvarying vec2 vKU; uniform float uPl, uTw, uFz;')
.replace('#include <color_fragment>', `#include <color_fragment>
{
float ph = uPl * (vKU.y * uTw * 7.0 + vKU.x);
float st = uPl > 1.5 ? (0.80 + 0.20 * cos(6.2832 * ph)) : 1.0;
float fb = fract(sin(dot(vec2(vKU.x * 40.0, vKU.y * 200.0), vec2(12.9898, 78.233))) * 43758.5453);
diffuseColor.rgb *= st * (0.92 + 0.16 * fb);
}`)
.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * uFz * pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.4) * 0.5;`);
};
m.customProgramCacheKey = () => 'knit3d1';
knit3Mat = m;
return m;
}
function getKnit3Geo(R) {
const key = R.toFixed(3);
if (knit3Geo && knit3GeoKey === key) return knit3Geo;
if (knit3Geo) knit3Geo.dispose();
const parts = [];
for (const sd of [-1, 1]) {
const a = new THREE.Vector2(sd * 0.085, 0.07), b = new THREE.Vector2(sd * 0.365, 0.95);
const d = b.clone().sub(a), len = d.length();
const g = new THREE.CapsuleGeometry(R, Math.max(0.05, len - 2 * R * 0.8), 3, 8);
g.rotateZ(Math.atan2(-d.x, d.y));
const mid = a.clone().add(b).multiplyScalar(0.5);
g.translate(mid.x, mid.y - 0.51, 0);
g.scale(1, 1, 0.85);
parts.push(g);
}
const g = mergeGeometries(parts);
parts.forEach((p) => p.dispose());
const p = g.attributes.position;
for (let i = 0; i < p.count; i++) {
const y = p.getY(i) + 0.51;
p.setZ(i, p.getZ(i) - 0.2 * THREE.MathUtils.smoothstep(y, 0.45, 0.98));
}
knit3Geo = g; knit3GeoKey = key;
return g;
}
function knitEmbIndex() {
const mode = ST.get('knitEmb'), n = items.length;
return mode === 'last' ? n - 1 : mode === 'second' ? 1 : mode === 'first' ? 0 : -1;
}
function knitYarnColor(mi) {
const uniq = []; items.forEach((it) => { const h = it.color.getHexString(); if (!uniq.includes(h)) uniq.push(h); });
const yi = Math.max(0, uniq.indexOf(items[mi].color.getHexString())) % 6;
return new THREE.Color(ST.get('knitY' + (yi + 1)));
}
function updateKnit3D() {
knit3U.uPl.value = ST.get('knitPlies'); knit3U.uTw.value = ST.get('knitTwist'); knit3U.uFz.value = ST.get('knitFuzz');
if (!knitInsts) return;
const g = ST.get, ht = g('knitHeather');
knit3Mat.sheen = 0.4 + 0.6 * g('knitFuzz');
const cache = {}, c = new THREE.Color(), c0 = new THREE.Color(), whiteC = new THREE.Color(1, 1, 1);
const ys = [1, 2, 3, 4, 5, 6].map((i) => new THREE.Color(g('knitY' + i)));
for (const o of knitInsts) {
for (let n = 0; n < o.owner.length; n++) {
const ow = o.owner[n];
let base;
if (o.pc) {
c0.setRGB(o.pc[n * 3], o.pc[n * 3 + 1], o.pc[n * 3 + 2]);
if (g('knitImgMode') === 'quant') {
let bd = 1e9; base = ys[0];
for (const y of ys) { const d = (y.r - c0.r) ** 2 * 0.9 + (y.g - c0.g) ** 2 * 1.2 + (y.b - c0.b) ** 2 * 0.6; if (d < bd) { bd = d; base = y; } }
} else base = c0;
} else base = cache[ow] || (cache[ow] = knitYarnColor(ow));
c.copy(base).multiplyScalar(1 + (o.rnd[n] - 0.5) * ht * 0.8);
if (o.hair) c.lerp(whiteC, 0.2);
o.mesh.setColorAt(n, c);
}
if (o.mesh.instanceColor) o.mesh.instanceColor.needsUpdate = true;
}
}
function buildKnit3D() { try { buildKnit3DInner(); } catch (e) { console.error('Knit 3D failed', e); clearKnit3D(); } }
function buildKnit3DInner() {
clearKnit3D();
if (ST.get('deformPreset') !== 'knit' || !meshes.length) return;
const mode = ST.get('knitMode');
if (mode === 'shader') return;
const bb = new THREE.Box3();
meshes.forEach((m) => { m.geometry.computeBoundingBox(); bb.union(m.geometry.boundingBox); });
const bs = bb.getSize(new THREE.Vector3());
const S = Math.max(bs.x, bs.y, 1), count = Math.max(4, ST.get('knitCount')), cell = S / count;
if (mode === 'auto' && count > 80) return;
const emb = knitEmbIndex();
const mn = [bb.min.x, bb.min.y, bb.min.z], sz = [bs.x, bs.y, bs.z];
const AXES = [{ a: 0, ui: 2, vi: 1 }, { a: 1, ui: 0, vi: 2 }, { a: 2, ui: 0, vi: 1 }];
for (const A of AXES) { A.cols = Math.ceil(sz[A.ui] / cell) + 1; A.rows = Math.ceil(sz[A.vi] / (cell * KA)) + 1; A.grid = new Array(A.cols * A.rows); if (A.cols * A.rows > 90000) return; }
let total = 0, tooMany = false;
const gc = (att, i, k) => (k === 0 ? att.getX(i) : k === 1 ? att.getY(i) : att.getZ(i));
meshes.forEach((mesh, mi) => {
const g = mesh.geometry, P = g.attributes.position, Nn = g.attributes.normal, idx = g.index;
const tc = idx ? idx.count : P.count;
for (let t = 0; t + 2 < tc && !tooMany; t += 3) {
const ia = idx ? idx.getX(t) : t, ib = idx ? idx.getX(t + 1) : t + 1, ic = idx ? idx.getX(t + 2) : t + 2;
const e1x = P.getX(ib) - P.getX(ia), e1y = P.getY(ib) - P.getY(ia), e1z = P.getZ(ib) - P.getZ(ia);
const e2x = P.getX(ic) - P.getX(ia), e2y = P.getY(ic) - P.getY(ia), e2z = P.getZ(ic) - P.getZ(ia);
const fx = Math.abs(e1y * e2z - e1z * e2y), fy = Math.abs(e1z * e2x - e1x * e2z), fz = Math.abs(e1x * e2y - e1y * e2x);
if (fx + fy + fz < 1e-12) continue;
const A = fz >= fx && fz >= fy ? AXES[2] : (fx >= fy ? AXES[0] : AXES[1]);
const { a, ui, vi, cols, rows, grid } = A;
const U = (v) => (gc(P, v, ui) - mn[ui]) / cell, V = (v) => (gc(P, v, vi) - mn[vi]) / (cell * KA);
const ax = U(ia), ay = V(ia), bx = U(ib), by = V(ib), cx = U(ic), cy = V(ic);
const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
if (Math.abs(den) < 1e-9) continue;
const da = gc(P, ia, a), db = gc(P, ib, a), dc = gc(P, ic, a);
const i0 = Math.max(0, Math.floor(Math.min(ax, bx, cx) - 0.5)), i1 = Math.min(cols - 1, Math.ceil(Math.max(ax, bx, cx) - 0.5));
const j0 = Math.max(0, Math.floor(Math.min(ay, by, cy) - 0.5)), j1 = Math.min(rows - 1, Math.ceil(Math.max(ay, by, cy) - 0.5));
for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
const px = i + 0.5, py = j + 0.5;
const w0 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / den;
const w1 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / den;
const w2 = 1 - w0 - w1;
if (w0 < -1e-5 || w1 < -1e-5 || w2 < -1e-5) continue;
const d = w0 * da + w1 * db + w2 * dc;
const nx = w0 * Nn.getX(ia) + w1 * Nn.getX(ib) + w2 * Nn.getX(ic), ny = w0 * Nn.getY(ia) + w1 * Nn.getY(ib) + w2 * Nn.getY(ic), nz = w0 * Nn.getZ(ia) + w1 * Nn.getZ(ib) + w2 * Nn.getZ(ic);
const c = j * cols + i;
const lst = grid[c] || (grid[c] = []);
let dup = false;
for (const h of lst) if (Math.abs(h.d - d) < 0.7 * cell && h.nx * nx + h.ny * ny + h.nz * nz > 0) { dup = true; break; }
if (dup) continue;
lst.push({ d, nx, ny, nz, mi });
if (++total > 45000) { tooMany = true; break; }
}
}
});
if (tooMany) { console.warn('Knit: too many stitches for 3D, using shader. Lower Stitch count.'); return; }
if (!total) return;
const R = 0.14 + 0.1 * ST.get('knitWeight'), irr = ST.get('knitIrreg');
const list = [];
for (const A of AXES) A.grid.forEach((lst, c) => { if (lst) for (const h of lst) { if (A.a === 2 && h.mi === emb) continue; list.push([A, c, h]); } });
if (!list.length) return;
const hr = cell * 1.7, hmap = new Map(), key = (x, y, z) => x + ',' + y + ',' + z;
for (const e of list) {
const [A, c, h] = e, i = c % A.cols, j = (c - i) / A.cols;
const q = [0, 0, 0]; q[A.ui] = mn[A.ui] + (i + 0.5) * cell; q[A.vi] = mn[A.vi] + (j + 0.5) * cell * KA; q[A.a] = h.d;
const l = Math.hypot(h.nx, h.ny, h.nz) || 1;
h.q = q; h.n0 = [h.nx / l, h.ny / l, h.nz / l];
const k0 = key(Math.floor(q[0] / hr), Math.floor(q[1] / hr), Math.floor(q[2] / hr));
(hmap.get(k0) || hmap.set(k0, []).get(k0)).push(h);
}
for (const e of list) {
const h = e[2], bx0 = Math.floor(h.q[0] / hr), by0 = Math.floor(h.q[1] / hr), bz0 = Math.floor(h.q[2] / hr);
let sx = 0, sy = 0, sz = 0;
for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c2 = -1; c2 <= 1; c2++) {
const arr = hmap.get(key(bx0 + a, by0 + b, bz0 + c2)); if (!arr) continue;
for (const o of arr) {
const dx = o.q[0] - h.q[0], dy = o.q[1] - h.q[1], dz = o.q[2] - h.q[2], d2 = dx * dx + dy * dy + dz * dz;
if (d2 > hr * hr) continue;
const dt = o.n0[0] * h.n0[0] + o.n0[1] * h.n0[1] + o.n0[2] * h.n0[2];
if (dt < 0.3) continue;
const w = (1 - Math.sqrt(d2) / hr) * dt;
sx += o.n0[0] * w; sy += o.n0[1] * w; sz += o.n0[2] * w;
}
}
if (sx * sx + sy * sy + sz * sz > 1e-6) { h.nx = sx; h.ny = sy; h.nz = sz; }
}
const pat = ST.get('knitPattern'), mis = ST.get('knitMistakes'), un = ST.get('knitUneven');
let sd = Math.round(ST.get('knitSeed')) * 9301 + 49297;
const rng = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
const ph1 = rng() * 6.28, ph2 = rng() * 6.28, ph3 = rng() * 6.28, ph4 = rng() * 6.28;
const wob = (q, ph) => Math.sin(q[0] / cell * 0.33 + ph) * Math.sin(q[1] / cell * 0.29 + ph * 1.7) + 0.6 * Math.sin(q[2] / cell * 0.27 + ph * 0.6 + q[0] / cell * 0.11);
const mats = [[], []], owners = [[], []], rnds = [[], []], pcs = [[], []];
const imgOn = !!knitImg && ST.get('knitImgMode') !== 'off', imgSc = ST.get('knitImgScale'), cI = new THREE.Color();
const M = new THREE.Matrix4(), RZ = new THREE.Matrix4(), v = new THREE.Vector3(), Xv = new THREE.Vector3(), Yv = new THREE.Vector3(), Zv = new THREE.Vector3(), d0 = new THREE.Vector3();
for (const [A, c, h] of list) {
const i = c % A.cols, j = (c - i) / A.cols;
if (un > 0 && rng() < 0.012 * un) continue; // a dropped stitch: a tiny hole
let type = pat === 'rib' ? ((i % 4) < 2 ? 0 : 1) : pat === 'seed' ? ((i + j) % 2 ? 1 : 0) : pat === 'garter' ? (j % 2 ? 1 : 0) : 0;
if (rng() < mis) type ^= 1; // a purl where there should be a knit, and the other way round
Zv.set(h.nx, h.ny, h.nz).normalize();
if (A.a === 1) d0.set(0, 0, 1); else d0.set(0, -1, 0);
Yv.copy(d0).addScaledVector(Zv, -d0.dot(Zv));
if (Yv.lengthSq() < 0.02) { d0.set(1, 0, 0); Yv.copy(d0).addScaledVector(Zv, -d0.dot(Zv)); }
Yv.normalize();
Xv.crossVectors(Yv, Zv);
M.makeBasis(Xv, Yv, Zv);
const q = h.q;
let sc = 1 + (rng() - 0.5) * 0.12 * irr + un * 0.2 * wob(q, ph1);
let rot = (rng() - 0.5) * 0.25 * irr + un * 0.45 * wob(q, ph2);
let lift = 0.05 + un * 0.14 * wob(q, ph3) - (type === 1 ? 0.04 : 0);
let sx = un * 0.12 * wob(q, ph4);
if (un > 0) {
const r = rng();
if (r < 0.035 * un) { rot += (rng() < 0.5 ? -1 : 1) * (0.35 + 0.3 * rng()); }       // a crooked stitch
else if (r < 0.06 * un) { sc *= 1.3; lift += 0.12; }                               // a fat slub
else if (r < 0.085 * un) { sc *= 0.82; lift -= 0.06; }                             // a tight, flat one
}
const tiltK = 1 / Math.max(0.6, Math.abs(Zv.getComponent(A.a)));
const s = cell * 1.08 * tiltK * sc;
RZ.makeRotationZ(rot);
M.multiply(RZ);
M.multiply(RZ.makeScale(s, s, s));
v.setComponent(A.ui, q[A.ui] + (rng() - 0.5) * 0.08 * cell * irr);
v.setComponent(A.vi, q[A.vi]);
v.setComponent(A.a, h.d);
v.addScaledVector(Xv, sx * cell);
v.addScaledVector(Zv, lift * cell);
M.setPosition(v);
mats[type].push(M.clone()); owners[type].push(h.mi); rnds[type].push(rng());
if (imgOn) {
const fu = (((q[0] - mn[0]) / (sz[0] || 1)) * imgSc) % 1, fv = (((q[1] - mn[1]) / (sz[1] || 1)) * imgSc) % 1;
const px = Math.min(knitImg.w - 1, Math.floor(fu * knitImg.w)), py = Math.min(knitImg.h - 1, Math.floor(fv * knitImg.h));
const o = (py * knitImg.w + px) * 4;
cI.setRGB(knitImg.data[o] / 255, knitImg.data[o + 1] / 255, knitImg.data[o + 2] / 255, THREE.SRGBColorSpace);
pcs[type].push(cI.r, cI.g, cI.b);
}
}
knitInsts = [];
[0, 1].forEach((t) => {
if (!mats[t].length) return;
const inst = new THREE.InstancedMesh(t === 0 ? getKnit3Geo(R) : getPurl3Geo(R), getKnit3Mat(), mats[t].length);
mats[t].forEach((m, n) => inst.setMatrixAt(n, m));
inst.castShadow = false; inst.receiveShadow = true; inst.frustumCulled = false;
holder.add(inst);
knitInsts.push({ mesh: inst, owner: owners[t], rnd: rnds[t], pc: imgOn ? new Float32Array(pcs[t]) : null });
});
const hairAmt = ST.get('knitHair'), hairLen = ST.get('knitHairLen');
if (hairAmt > 0.01) {
const nSt = mats[0].length + mats[1].length;
const per = Math.max(1, Math.min(Math.round(hairAmt * 6), Math.floor(90000 / Math.max(1, nSt))));
const hm = [], hOwner = [], hRnd = [], hPc = [];
const Q = new THREE.Matrix4(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), hp = new THREE.Vector3(), hd = new THREE.Vector3(), hs = new THREE.Vector3(), Yax = new THREE.Vector3(0, 1, 0), One = new THREE.Vector3(1, 1, 1);
const Rl = R;
[0, 1].forEach((t) => mats[t].forEach((SM, n) => {
for (let k2 = 0; k2 < per; k2++) {
let px, py, pz, ox, oy;
if (t === 0) {
const sd2 = rng() < 0.5 ? -1 : 1, tt = 0.08 + 0.84 * rng();
const ax = sd2 * 0.085, ay = -0.44, bx2 = sd2 * 0.365, by2 = 0.44;
px = ax + (bx2 - ax) * tt; py = ay + (by2 - ay) * tt; pz = -0.2 * THREE.MathUtils.smoothstep(py + 0.51, 0.45, 0.98);
const dx = bx2 - ax, dy = by2 - ay, dl = Math.hypot(dx, dy);
const th = (rng() - 0.25) * Math.PI;
ox = (-dy / dl) * Math.cos(th); oy = (dx / dl) * Math.cos(th);
hd.set(ox * 0.8 + (dx / dl) * (rng() - 0.3) * 0.7, oy * 0.8 + (dy / dl) * (rng() - 0.3) * 0.7, 0.55 + 0.8 * Math.sin(th) + rng() * 0.4);
px += ox * Rl * 0.9; py += oy * Rl * 0.9; pz += Rl * 0.6 * Math.sin(th);
} else {
px = (rng() - 0.5) * 0.7; py = rng() < 0.5 ? -0.19 : 0.19; pz = -0.1 * px * px * 4 + Rl * 0.5;
hd.set((rng() - 0.5) * 0.8, (rng() - 0.5) * 0.8 + Math.sign(py) * 0.4, 0.7 + rng() * 0.6);
}
hd.normalize();
hp.set(px, py, pz);
qa.setFromUnitVectors(Yax, hd);
qb.setFromAxisAngle(Yax, rng() * 6.28);
qa.multiply(qb);
const L = (0.12 + 0.55 * rng() * rng() + 0.1 * rng()) * hairLen * 1.6;
hs.set(1, L, 1);
Q.compose(hp, qa, hs);
hm.push(SM.clone().multiply(Q)); hOwner.push(owners[t][n]); hRnd.push(rng());
if (imgOn) hPc.push(pcs[t][n * 3], pcs[t][n * 3 + 1], pcs[t][n * 3 + 2]);
}
}));
if (hm.length) {
const hmesh = new THREE.InstancedMesh(getHairGeo(), getHairMat(), hm.length);
hm.forEach((m, n) => hmesh.setMatrixAt(n, m));
hmesh.castShadow = false; hmesh.frustumCulled = false;
holder.add(hmesh);
knitInsts.push({ mesh: hmesh, owner: hOwner, rnd: hRnd, hair: true, pc: imgOn ? new Float32Array(hPc) : null });
}
}
knitU.uSolid.value = 1;
updateKnit3D();
poke(1500);
}
let knitHairGeo = null, knitHairMat = null;
function getHairGeo() {
if (knitHairGeo) return knitHairGeo;
const g = new THREE.CylinderGeometry(0.0015, 0.0085, 1, 3, 4, true);
g.translate(0, 0.5, 0);
const p = g.attributes.position;
for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + 0.28 * y * y); }
g.computeVertexNormals();
knitHairGeo = g; return g;
}
function getHairMat() {
if (!knitHairMat) knitHairMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, side: THREE.DoubleSide });
return knitHairMat;
}
function getPurl3Geo(R) {
if (knitPurlGeo && knitPurlKey === R.toFixed(3)) return knitPurlGeo;
if (knitPurlGeo) knitPurlGeo.dispose();
const parts = [];
for (const y of [-0.19, 0.19]) {
const g = new THREE.CapsuleGeometry(R * 0.95, Math.max(0.05, 0.78 - 2 * R * 0.8), 3, 8);
g.rotateZ(Math.PI / 2);
g.translate(0, y, 0);
g.scale(1, 1, 0.85);
parts.push(g);
}
const g = mergeGeometries(parts);
parts.forEach((p) => p.dispose());
const p = g.attributes.position;
for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) - 0.1 * x * x * 4); }
knitPurlGeo = g; knitPurlKey = R.toFixed(3);
return g;
}
const KNIT_PALETTES = {
lavender: ['#b98ad9', '#f1eee7', '#a84f2e', '#c99a3e', '#8eb2c4', '#34503f', '#f4f1ee'],
nordic: ['#f1eee7', '#1b2944', '#a84f2e', '#c99a3e', '#8eb2c4', '#34503f', '#f1eee7'],
christmas: ['#b3232d', '#f3efe6', '#1d6a3c', '#e2b33e', '#8fc6e0', '#1f3a33', '#f3efe6'],
candy: ['#f4a6c8', '#fff4c2', '#9ee0c8', '#b7a6f4', '#ffd1a6', '#7fc4f0', '#ffffff'],
forest: ['#3f6b4a', '#d9cfae', '#8a5a3a', '#c9a24a', '#6f8f9a', '#2b3b30', '#efe6cf'],
ocean: ['#2c6fa8', '#eaf4f7', '#58b4c8', '#1b3b5a', '#f2c879', '#7a9e9f', '#ffffff'],
sunset: ['#e8663d', '#ffe3b0', '#b23a48', '#f6b042', '#5b3a6b', '#2e2a4a', '#fff1d6'],
mono: ['#e9e6df', '#2b2b2b', '#8d8a84', '#c9c5bc', '#5a5853', '#f7f5f0', '#ffffff'],
};
ST.onChange('knitPalette', (v) => {
const p = KNIT_PALETTES[v]; if (!p) return;
['knitY1', 'knitY2', 'knitY3', 'knitY4', 'knitY5', 'knitY6', 'knitThread'].forEach((k, i) => ST.set(k, p[i]));
});
let knitImg = null;
function loadKnitImage() {
const url = ST.get('knitImage');
if (!url) { knitImg = null; buildKnit3D(); return; }
const im = new Image(); im.crossOrigin = 'anonymous';
im.onload = () => {
const sc = Math.min(1, 256 / Math.max(im.width, im.height));
const cv = new OffscreenCanvas(1, 1); cv.width = Math.max(1, Math.round(im.width * sc)); cv.height = Math.max(1, Math.round(im.height * sc));
const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(im, 0, 0, cv.width, cv.height);
knitImg = { w: cv.width, h: cv.height, data: cx.getImageData(0, 0, cv.width, cv.height).data };
buildKnit3D();
};
im.src = url;
}
ST.onChange('knitImage', loadKnitImage);
let k3Timer = 0;
for (const k of ['knitCount', 'knitMode', 'knitHair', 'knitHairLen', 'knitImgMode', 'knitImgScale', 'knitPattern', 'knitMistakes', 'knitUneven', 'knitIrreg', 'knitSeed', 'knitEmb', 'knitWeight']) ST.onChange(k, () => { clearTimeout(k3Timer); k3Timer = setTimeout(() => { buildKnit3D(); }, 100); });
for (const k of ['knitCount', 'knitWeight', 'knitPlies', 'knitTwist', 'knitFuzz', 'knitHeather', 'knitIrreg', 'knitSeed', 'knitY1', 'knitY2', 'knitY3', 'knitY4', 'knitY5', 'knitY6', 'knitEmb', 'knitEAng', 'knitEDen', 'knitEH', 'knitThread']) ST.onChange(k, applyKnitUniforms);
ST.onChange('knitInflate', () => scheduleRebuild());
ST.onChange('knitSoft', () => scheduleRebuild());
ST.onChange('knitCount', () => scheduleRebuild());
function buildStudioScene() {
const g = new THREE.Scene();
const sph = new THREE.SphereGeometry(40, 48, 32);
const pos = sph.attributes.position, col = new Float32Array(pos.count * 3);
for (let i = 0; i < pos.count; i++) {
const y = pos.getY(i) / 40;
const v = y > 0.15 ? 0.05 + 0.13 * (y - 0.15) : (y > -0.35 ? 0.04 + 0.10 * Math.max(0, y + 0.35) : 0.14 + 0.5 * Math.pow(-y - 0.35, 0.8));
col[i * 3] = v * 0.98; col[i * 3 + 1] = v; col[i * 3 + 2] = v * 1.03;
}
sph.setAttribute('color', new THREE.BufferAttribute(col, 3));
g.add(new THREE.Mesh(sph, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, toneMapped: false })));
const panel = (x, y, z, w, h, v, tint) => {
const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(v * (tint ? tint[0] : 1), v * (tint ? tint[1] : 1), v * (tint ? tint[2] : 1)), side: THREE.DoubleSide, toneMapped: false }));
m.position.set(x, y, z); m.lookAt(0, 0, 0); g.add(m);
};
panel(-14, 15, 14, 16, 11, 22);          // big key softbox, upper left front
panel(17, 3, 9, 3.2, 20, 18);           // tall strip right
panel(0, 24, -2, 18, 18, 5);          // overhead
panel(-3, 4, -24, 26, 2.6, 7, [1, 1, 1.08]); // back strip (cool)
panel(-24, 0, -2, 4, 22, 5, [1.05, 1, 0.95]);   // left rim strip
panel(-4, 2, 22, 7, 14, 0.03);          // dark flag behind camera
panel(9, 12, 12, 7, 14, 0.02);          // dark flag between key and strip
panel(-20, 4, 4, 5, 16, 0.02);          // dark flag left
panel(0, 6, -22, 8, 10, 0.02);          // dark flag back
return g;
}
const ENV_PRESETS = [['room', 'Room (default)'], ['studio', 'Studio softboxes'], ['sky', 'Outdoor sky'], ['sunset', 'Sunset'], ['night', 'Night / neon'], ['neutral', 'Neutral grey']];
function gradSphere(fn) {
const sph = new THREE.SphereGeometry(40, 48, 32), pos = sph.attributes.position, col = new Float32Array(pos.count * 3);
for (let i = 0; i < pos.count; i++) { const c = fn(pos.getY(i) / 40); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]; }
sph.setAttribute('color', new THREE.BufferAttribute(col, 3));
return new THREE.Mesh(sph, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, toneMapped: false }));
}
function envPanel(g, x, y, z, w, h, c) {
const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0], c[1], c[2]), side: THREE.DoubleSide, toneMapped: false }));
m.position.set(x, y, z); m.lookAt(0, 0, 0); g.add(m);
}
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function buildEnvScene(name) {
if (name === 'studio') return buildStudioScene();
if (name === 'room') return new RoomEnvironment();
const g = new THREE.Scene();
if (name === 'sky') {
g.add(gradSphere((y) => y > 0 ? mixc([0.85, 0.92, 1.0], [0.18, 0.4, 0.95], Math.pow(y, 0.55)) : mixc([0.55, 0.52, 0.48], [0.2, 0.19, 0.18], Math.min(1, -y * 2))));
envPanel(g, 22, 28, 12, 9, 9, [30, 27, 22]);
} else if (name === 'sunset') {
g.add(gradSphere((y) => y > 0 ? mixc([1.6, 0.6, 0.25], [0.12, 0.1, 0.3], Math.pow(y, 0.45)) : mixc([0.35, 0.15, 0.1], [0.04, 0.03, 0.05], Math.min(1, -y * 2))));
envPanel(g, 0, 3, -30, 9, 9, [40, 16, 4]);
envPanel(g, -18, 6, 12, 10, 14, [3, 1.4, 0.8]);
} else if (name === 'night') {
g.add(gradSphere(() => [0.012, 0.014, 0.025]));
envPanel(g, 16, 6, 8, 3, 22, [2, 9, 14]); envPanel(g, -17, 4, 6, 3, 22, [14, 2.5, 10]); envPanel(g, 0, 22, -6, 14, 3, [5, 5, 7]);
} else { g.add(gradSphere(() => [0.5, 0.5, 0.52])); }
return g;
}
const envCache = new Map();
function applyMetalEnv() {
const name = ST.get('envPreset') || 'room';
const soft = name === 'room' ? 0 : ST.get('metalEnvSoft');
const k = name + '|' + soft.toFixed(3);
let tex = envCache.get(k);
if (!tex) {
const sc = buildEnvScene(name);
tex = name === 'room' ? pmrem.fromScene(sc, 0.04).texture : pmrem.fromScene(sc, soft * 0.1, 0.1, 200).texture;
sc.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
envCache.set(k, tex);
if (envCache.size > 8) { const f = envCache.keys().next().value; envCache.get(f).dispose(); envCache.delete(f); }
}
scene.environment = tex;
scene.environmentRotation.y = ST.get('metalEnvRot') * Math.PI / 180;
updateFurEnv();
}
let mirrorIn = null;
function updateMirror() {}
for (const k of ['metalRough', 'metalAniso', 'metalBrushDir', 'metalBrushStrength', 'metalGrain', 'metalEdge', 'metalScratch']) ST.onChange(k, applyMetalUniforms);
for (const k of ['metalEnvRot', 'metalEnvSoft']) ST.onChange(k, () => { applyMetalEnv(); poke(1500); });
ST.onChange('metalInflate', scheduleRebuild);ST.onChange('metalRound', scheduleRebuild);ST.onChange('deformPreset', () => { applyMetalUniforms(); });
for (const k of ['colorStandard', 'colorBalloon', 'colorCrumpled', 'balloonGloss', 'clayMatte']) ST.onChange(k, applyMaterials);
for (const k of ['colorBalloonShadow', 'balloonShadowAmt']) ST.onChange(k, () => { balloonU.uShCol.value.set(ST.get('colorBalloonShadow')); balloonU.uShAmt.value = ST.get('balloonShadowAmt'); poke(1500); });
ST.onChange('colorMetal', applyMetalUniforms);
function layout() {
const bb = new THREE.Box3();
for (const m of meshes) { m.updateMatrix(); m.geometry.computeBoundingBox(); bb.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrix)); }
const size = bb.getSize(new THREE.Vector3()), c0 = bb.getCenter(new THREE.Vector3());
const k = ST.get('size') / Math.max(size.x, size.y, 1e-6);
holder.scale.set(k, -k, k);
holder.position.set(-c0.x * k, c0.y * k, -c0.z * k);
updateWall();
applyKnitUniforms();
}
let rbTimer = 0;
function scheduleRebuild() { clearTimeout(rbTimer); rbTimer = setTimeout(rebuild, 70); }
function rebuild() {
clearKnit3D();
for (const m of meshes) holder.remove(m);
meshes = [];
const depth = ST.get('depth');
const furOn = !!ST.get('furEnabled');
const dpr = ST.get('deformPreset'); const mi = dpr === 'metal' ? ST.get('metalInflate') : (dpr === 'knit' ? ST.get('knitInflate') : (dpr === 'glass' ? ST.get('glassEdge') : 0));
let kbev = 0;
if (dpr === 'knit' && items.length) {
const bx = new THREE.Box2();
items.forEach((it) => it.shapes.forEach((sh) => sh.getPoints(8).forEach((q) => bx.expandByPoint(q))));
const Sk = Math.max(bx.max.x - bx.min.x, bx.max.y - bx.min.y, 1);
kbev = (Sk / Math.max(4, ST.get('knitCount'))) * 0.9 * ST.get('knitSoft');
}
const rdn = dpr === 'metal' ? (ST.get('metalRound') || 0) : 0;
const bev = Math.max(furOn ? ST.get('furBevel') : ST.get('bevel'), mi * 40, rdn * 60, Math.min(kbev, ST.get('depth') * 0.48));
const bsm0 = furOn ? ST.get('furBevelSmooth') : (dpr === 'knit' ? Math.max(4, ST.get('bevelSmooth')) : ST.get('bevelSmooth'));
const bsm = rdn > 0 ? 10 : bsm0;
PX = { furOn, mi, rn: rdn, puff: 0, cs: ST.get('crumpleScale'), cd: ST.get('crumpleDetail'),
zb: ST.get('balloonZBulge'), rd: ST.get('balloonRoundness'), pinch: ST.get('balloonPinch'),
wf: ST.get('balloonWrinkleFreq'), fold: ST.get('balloonFold'), ff: ST.get('balloonFoldFreq'), star: ST.get('balloonStar'), wd: ST.get('balloonWrinkleDepth'), xy: ST.get('balloonXYGrow'),
st: { on: !!ST.get('stoneEnabled'), amt: ST.get('stoneIntensity'), scale: ST.get('stoneScale'), sharp: ST.get('stoneSharp'), crack: ST.get('stoneCracks'), tilt: ST.get('stoneTilt'), edge: ST.get('stoneEdge'), rough: ST.get('stoneRough'), seed: ST.get('stoneSeed') } };
const bA = ST.get('balloonEnabled') ? ST.get('balloonInflate') : 0;
const cA = ST.get('crumpleEnabled') ? ST.get('crumpleIntensity') : 0;
items.forEach((it, i) => {
const geo = getGeo(it, i, bA, cA, depth, bev, bsm);
const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
mesh.castShadow = true; mesh.receiveShadow = true;
holder.add(mesh); meshes.push(mesh);
});
applyMaterials();
layout();
buildKnit3D();
updateMirror();
poke(2500);
}
let loadId = 0;
async function loadLogo(url) {
const id = ++loadId;
if (!url) { items = defaultItems(); itemsVer++; clearGeoCache(); rebuild(); return; }
let txt = '';
try {
const u = url.trim();
if (u.startsWith('<')) txt = u;
else if (u.startsWith('data:')) { const i = u.indexOf(','); const head = u.slice(0, i), data = u.slice(i + 1); txt = /;base64/i.test(head) ? atob(data) : decodeURIComponent(data); }
else txt = await (await fetch(u)).text();
} catch (e) { txt = ''; }
applySvg(txt, id);
}
function parseItems(txt, honorNone) {
const data = new SVGLoader().parse(txt);
const out = [];
for (const p of data.paths) {
if (honorNone && p.userData?.style?.fill === 'none') continue;
const shapes = SVGLoader.createShapes(p);
if (!shapes.length) continue;
out.push({ shapes, color: new THREE.Color(p.color || '#000000') });
}
return out;
}
function applySvg(txt, id) {
let msg = '';
try {
if (!txt) throw new Error('SVG is empty or could not be loaded (the file could not be read).');
const clean = txt.replace(/(<svg\b[^>]*?)\sfill\s*=\s*["']none["']/i, '$1');
let honor = true, out = parseItems(clean, true), cleanS = clean;
if (!out.length) { honor = false; out = parseItems(clean, false); }
if (out.length) {
const bx = new THREE.Box2();
out.forEach((it) => it.shapes.forEach((sh) => sh.getPoints(6).forEach((q) => bx.expandByPoint(q))));
const mx = Math.max(bx.max.x - bx.min.x, bx.max.y - bx.min.y);
const kk = mx > 1e-6 ? 600 / mx : 1;
if (kk < 0.8 || kk > 1.25) {
const wrapped = clean.replace(/(<svg\b[^>]*>)/i, '$1<g transform="scale(' + kk + ')">').replace(/<\/svg>\s*$/i, '</g></svg>');
const o2 = parseItems(wrapped, honor);
if (o2.length) out = o2;
}
}
if (id !== loadId) return;
if (!out.length) throw new Error('No filled shapes found in this SVG (strokes-only or text elements are not supported: convert them to outlines).');
items = out;
msg = 'Loaded ' + out.length + ' shape group' + (out.length > 1 ? 's' : '') + '.';
} catch (e) { items = defaultItems(); msg = 'Logo not applied: ' + (e && e.message ? e.message : 'parse error') + ' Showing the default shape.'; console.warn(msg); }
ST.set('__logoStatus', msg);
itemsVer++; clearGeoCache();
rebuild();
}
const ML_N = 4;
const mlights = [], mlMarkers = [];
let mlAnyShadow = false;
for (let i = 1; i <= ML_N; i++) {
const sp = new THREE.SpotLight(0xffffff, 0, 0, 0.5, 0.5, 2);
sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0005; sp.shadow.camera.near = 0.5; sp.shadow.camera.far = 40;
scene.add(sp); scene.add(sp.target);
const mk = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, depthTest: false, transparent: true, opacity: 0.95 }));
mk.renderOrder = 999; mk.userData.ml = i; mk.visible = false; scene.add(mk);
mlights.push(sp); mlMarkers.push(mk);
}
function updateManualLights() {
const mode = ST.get('mlMode');
mlAnyShadow = false;
for (let i = 0; i < ML_N; i++) {
const g = (k) => ST.get('ml' + (i + 1) + k);
const on = mode !== 'off' && !!g('On');
const sp = mlights[i], mk = mlMarkers[i];
sp.visible = on;
sp.position.set(g('X'), g('Y'), g('Z'));
sp.color.set(g('Col'));
sp.intensity = on ? g('Int') * 80 : 0;
const c = g('Conc');
sp.angle = Math.min(1.45, Math.exp(Math.log(0.9) * (1 - c) + Math.log(0.03) * c));
sp.penumbra = g('Soft');
sp.castShadow = on && !!g('Shad');
if (sp.castShadow) mlAnyShadow = true;
mk.visible = on && !!ST.get('mlShow');
mk.position.copy(sp.position); mk.material.color.set(g('Col'));
}
}
{
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), hp = new THREE.Vector3(), off = new THREE.Vector3();
const dom = renderer.domElement; let drag = 0;
const aim = (e) => { const r = dom.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); };
dom.addEventListener('pointerdown', (e) => {
if (ST.get('mlMode') === 'off' || !ST.get('mlShow')) return;
aim(e);
const hit = ray.intersectObjects(mlMarkers.filter((m) => m.visible), false)[0];
if (!hit) return;
drag = hit.object.userData.ml;
camera.getWorldDirection(hp); plane.setFromNormalAndCoplanarPoint(hp, hit.object.position);
ray.ray.intersectPlane(plane, hp); off.copy(hit.object.position).sub(hp);
orbit.enabled = false; try { dom.setPointerCapture(e.pointerId); } catch (_) {}
e.stopImmediatePropagation(); e.preventDefault();
}, true);
dom.addEventListener('pointermove', (e) => {
if (!drag) return;
aim(e);
if (!ray.ray.intersectPlane(plane, hp)) return;
hp.add(off);
const r = (v) => Math.round(Math.max(-12, Math.min(12, v)) * 100) / 100;
ST.set('ml' + drag + 'X', r(hp.x)); ST.set('ml' + drag + 'Y', r(hp.y)); ST.set('ml' + drag + 'Z', r(hp.z));
});
const end = () => { if (drag) { drag = 0; orbit.enabled = true; } };
dom.addEventListener('pointerup', end); dom.addEventListener('pointercancel', end);
}
const ML_KEYS = ['mlMode', 'mlShow']; for (let n = 1; n <= ML_N; n++) for (const s of ['On', 'X', 'Y', 'Z', 'Col', 'Int', 'Conc', 'Soft', 'Shad']) ML_KEYS.push('ml' + n + s);
const TR_NAMES = ['fade', 'wipe', 'dissolve', 'pixels', 'blinds', 'glitch', 'zoom'];
const trU = { tOld: { value: null }, uP: { value: 0 }, uMode: { value: 0 }, uAsp: { value: 1 } };
const trMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
uniforms: trU, transparent: true, depthTest: false, depthWrite: false,
vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
fragmentShader: `uniform sampler2D tOld; uniform float uP, uMode, uAsp; varying vec2 vUv;
float h(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fb(vec2 p){ return vn(p)*.5 + vn(p*2.1+3.0)*.3 + vn(p*4.3+7.0)*.2; }
void main(){
vec2 uv = vUv, su = uv, as = vec2(uAsp, 1.0); float p = uP, keep = 1.0 - p, sh = 0.0; int m = int(uMode + 0.5);
if (m == 1) { float d = uv.x*0.8 + uv.y*0.6; keep = smoothstep(-0.07, 0.07, d - mix(-0.1, 1.5, p)); }
else if (m == 2) { float n = fb(uv*as*5.0); float t = mix(-0.08, 1.08, p); keep = smoothstep(t-0.07, t+0.07, n); }
else if (m == 3) { float n = h(floor(uv*as*26.0))*0.7 + fb(uv*as*3.0)*0.3; keep = step(mix(-0.05, 1.05, p), n); }
else if (m == 4) { float l = fract(uv.x*16.0); keep = smoothstep(l-0.03, l+0.03, 1.03 - p*1.06); }
else if (m == 5) { float row = floor(uv.y*28.0); float amp = sin(p*3.14159); su.x += (h(vec2(row, floor(p*8.0))) - 0.5)*0.3*amp; sh = 0.012*amp; keep = 1.0 - smoothstep(0.0, 1.0, p*1.3 - h(vec2(row, 9.0))*0.3); }
else if (m == 6) { keep = 1.0 - smoothstep(0.05, 0.95, p); }
vec4 c;
if (m == 5) c = vec4(texture2D(tOld, su + vec2(sh, 0.)).r, texture2D(tOld, su).g, texture2D(tOld, su - vec2(sh, 0.)).b, texture2D(tOld, su).a);
else if (m == 6) { vec4 a = vec4(0.0); for (int i = 0; i < 6; i++) { float t = float(i)/5.0; a += texture2D(tOld, (uv-0.5)/(1.0 + p*(0.3 + 0.6*t)) + 0.5); } c = a/6.0; }
else c = texture2D(tOld, su);
gl_FragColor = vec4(c.rgb, c.a * keep);
}`,
}));
trMesh.frustumCulled = false; trMesh.renderOrder = 10000; trMesh.visible = false;
scene.add(trMesh);
function startTransition() {
if (!trReady || presetBusy || !ST.get('transOn')) return;
try {
const src = renderer.domElement, cv = new OffscreenCanvas(1, 1);
cv.width = src.width; cv.height = src.height;
cv.getContext('2d').drawImage(src, 0, 0);
if (trU.tOld.value) trU.tOld.value.dispose();
const tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false;
trU.tOld.value = tx;
} catch (e) { return; }
let m = ST.get('transEffect'); if (m === 'random') m = TR_NAMES[Math.floor(Math.random() * TR_NAMES.length)];
trU.uMode.value = Math.max(0, TR_NAMES.indexOf(m)); trU.uAsp.value = camera.aspect; trU.uP.value = 0;
trMesh.visible = true; trFrom = poseD.slice(); trT0 = performance.now() + 120; trActive = true; poke(500);
}
ST.onChange('deformPreset', startTransition);
setTimeout(() => { trReady = true; }, 1500);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.35 }));
wall.receiveShadow = true; wall.visible = false;
scene.add(wall);
function updateWall() {
wall.visible = !!ST.get('bgShadow');
wall.material.opacity = ST.get('bgShadowOpacity');
let sx = 0, sy = 0, sz = 0;
for (const m of meshes) { m.geometry.computeBoundingBox(); const s = m.geometry.boundingBox.getSize(new THREE.Vector3()); sx = Math.max(sx, s.x); sy = Math.max(sy, s.y); sz = Math.max(sz, s.z); }
const r = 0.5 * Math.abs(holder.scale.x) * root.scale.x * Math.hypot(Math.max(sx, sy), sz);
const lp = ST.get('logoPos') || { x: 0, y: 0 };
wall.position.set((lp.x || 0) * 3, (lp.y || 0) * 3, -(r + ST.get('bgShadowDist')));
key.shadow.radius = ST.get('bgShadowSoft');
for (const sp of mlights) sp.shadow.radius = ST.get('bgShadowSoft');
poke(1500);
}
for (const k of ['bgShadow', 'bgShadowOpacity', 'bgShadowDist', 'bgShadowSoft', 'logoPos', 'size']) ST.onChange(k, updateWall);
const LIGHT_PRESETS = [['default', 'Default'], ['soft', 'Soft studio'], ['top', 'Top light'], ['side', 'Dramatic side'], ['back', 'Backlight / rim'], ['warm', 'Warm'], ['cool', 'Cool'], ['ambient', 'Ambient only (no shadow)']];
const LP = {
default: { kp: [4, 6, 6], kc: 0xffffff, k: 1, rp: [-5, 2, -4], rc: 0x88aaff, r: 1.2, h: 0.4, hc: 0xffffff, e: 1 },
soft: { kp: [1, 4, 9], kc: 0xffffff, k: 2.5, rp: [-5, 2, -4], rc: 0xdde6ff, r: 0.4, h: 1.6, hc: 0xffffff, e: 1.3 },
top: { kp: [0, 10, 1.5], kc: 0xffffff, k: 9, rp: [-5, 2, -4], rc: 0x88aaff, r: 0.3, h: 0.1, hc: 0xffffff, e: 0.35 },
side: { kp: [10, 1.5, 3], kc: 0xffffff, k: 11, rp: [-6, 1, -3], rc: 0x5577aa, r: 0.4, h: 0.05, hc: 0xffffff, e: 0.25 },
back: { kp: [-3, 3, -8], kc: 0xffffff, k: 8, rp: [5, 2, -6], rc: 0xffd9b0, r: 4, h: 0.3, hc: 0xffffff, e: 0.35 },
warm: { kp: [4, 6, 6], kc: 0xffb877, k: 6, rp: [-5, 2, -4], rc: 0xff8a4a, r: 2, h: 0.8, hc: 0xffcf9f, e: 0.6 },
cool: { kp: [4, 6, 6], kc: 0x9cc4ff, k: 6, rp: [-5, 2, -4], rc: 0x4f7bff, r: 2.5, h: 0.8, hc: 0xa8c8ff, e: 0.6 },
ambient: { kp: [4, 6, 6], kc: 0xffffff, k: 0, rp: [-5, 2, -4], rc: 0xffffff, r: 0, h: 1.2, hc: 0xffffff, e: 1.6 },
};
function applyLights() {
const p = LP[ST.get('lightPreset')] || LP.default;
scene.environmentIntensity = ST.get('envIntensity') * p.e;
key.position.set(...p.kp); key.color.set(p.kc); key.intensity = ST.get('lightIntensity') * p.k;
key.castShadow = p.k > 0;
rim.position.set(...p.rp); rim.color.set(p.rc); rim.intensity = p.r;
hemi.intensity = p.h; hemi.color.set(p.hc);
const only = ST.get('mlMode') === 'only';
if (only) { key.intensity = 0; key.castShadow = false; rim.intensity = 0; }
updateManualLights();
floor.visible = ST.get('shadow') && ((p.k > 0 && !only) || mlAnyShadow);
updateFurLight();
poke(1500);
}
for (const k of ['envIntensity', 'lightIntensity', 'shadow', 'lightPreset', ...ML_KEYS]) ST.onChange(k, applyLights);
ST.onChange('envPreset', () => { applyMetalEnv(); updateFurLight(); poke(1500); });
const ENVKEYS = ['envPreset', 'lightPreset', 'envIntensity', 'lightIntensity', 'metalEnvRot', 'metalEnvSoft', ...STONEKEYS];
const DEF_PRESETS = ['standard', 'balloon', 'crumpled', 'fur', 'lightstone', 'darkstone', 'metal', 'dither', 'knit', 'glass'];
let envLoading = false;
function loadPresetEnv() {
const pr = ST.get('deformPreset');
if (!DEF_PRESETS.includes(pr)) return;
envLoading = true;
for (const k of ENVKEYS) { if (pr === 'dither' && (k === 'bgColor' || k === 'bgColor2')) continue; /* Dither keeps whatever background is already showing */ const v = ST.get(k + '__' + pr); if (v !== undefined && v !== ST.get(k)) ST.set(k, v); }
envLoading = false;
applyLights(); applyMetalEnv(); updateFurLight();
}
ST.onChange('deformPreset', loadPresetEnv);
for (const pr of ['lightstone', 'darkstone']) for (const k of STONEKEYS) ST.onChange(k + '__' + pr, (v) => { if (ST.get('deformPreset') === pr && ST.get(k) !== v) ST.set(k, v); });
for (const k of ENVKEYS) ST.onChange(k, (v) => { if (envLoading) return; const pr = ST.get('deformPreset'); if (DEF_PRESETS.includes(pr)) ST.set(k + '__' + pr, v); });
for (const k of ['depth', 'bevel', 'balloonEnabled', 'crumpleEnabled', 'bevelSmooth', 'balloonInflate', 'balloonZBulge', 'balloonRoundness', 'balloonPinch', 'balloonWrinkleFreq', 'balloonWrinkleDepth', 'balloonFold', 'balloonFoldFreq', 'balloonStar', 'balloonXYGrow', 'crumpleIntensity', 'crumpleScale', 'crumpleDetail']) ST.onChange(k, scheduleRebuild);
ST.onChange('furEnabled', () => { scheduleRebuild(); syncPresetFromLayers(); });
for (const k of ['furBevel', 'furBevelSmooth']) ST.onChange(k, scheduleRebuild);
let presetBusy = false;
const PRESETS = { standard: [false, false, false, false], balloon: [true, false, false, false], crumpled: [false, true, false, false], fur: [false, false, true, false], lightstone: [false, false, false, true], darkstone: [false, false, false, true], metal: [false, false, false, false], dither: [false, false, false, false], knit: [false, false, false, false], glass: [false, false, false, false] };
function syncPresetFromLayers() {
if (presetBusy) return;
if (ST.get('deformPreset') === 'dither') return;
const b = !!ST.get('balloonEnabled'), c = !!ST.get('crumpleEnabled');
const fu = !!ST.get('furEnabled');
const so = !!ST.get('stoneEnabled');
const curP = ST.get('deformPreset');
const id = so ? (curP === 'lightstone' ? 'lightstone' : 'darkstone') : b ? 'balloon' : (c ? 'crumpled' : (fu ? 'fur' : (['metal', 'knit', 'glass'].includes(ST.get('deformPreset')) ? ST.get('deformPreset') : 'standard')));
if (ST.get('deformPreset') !== id) { presetBusy = true; ST.set('deformPreset', id); presetBusy = false; }
}
ST.onChange('deformPreset', (v) => {
if (presetBusy) return;
const p = PRESETS[v]; if (!p) return;
presetBusy = true;
ST.set('balloonEnabled', p[0]);
ST.set('crumpleEnabled', p[1]);
ST.set('furEnabled', p[2]);
ST.set('stoneEnabled', p[3]);
presetBusy = false;
if (v === 'dither') applyDitherBase();
scheduleRebuild();
});
function applyDitherBase() {
const b = ST.get('ditherBase');
presetBusy = true;
ST.set('balloonEnabled', b === 'balloon'); ST.set('crumpleEnabled', b === 'clay');
ST.set('stoneEnabled', b === 'stone'); ST.set('furEnabled', false);
presetBusy = false;
scheduleRebuild();
}
ST.onChange('ditherBase', () => { if (ST.get('deformPreset') === 'dither') applyDitherBase(); });
ST.onChange('balloonEnabled', syncPresetFromLayers);
ST.onChange('crumpleEnabled', syncPresetFromLayers);
ST.onChange('stoneEnabled', syncPresetFromLayers);
for (const k of ['stoneEnabled', 'stoneCracks', 'stoneIntensity', 'stoneScale', 'stoneSharp', 'stoneTilt', 'stoneEdge', 'stoneRough', 'stoneSeed']) ST.onChange(k, scheduleRebuild);
for (const k of ['clayGrain', 'clayGrainSize', 'clayLump', 'clayLumpSize', 'clayPits', 'clayPitSize', 'clayMott', 'clayMottSize', 'clayColor2', 'clayDust', 'clayCrack', 'clayBump']) ST.onChange(k, updateClayUniforms);
ST.onChange('clayTex', applyMaterials);
for (const k of ['stoneColor', 'stoneColor2', 'stoneColor3', 'stoneRust', 'stonePatina', 'stoneDetail', 'stoneGrain', 'stoneGrainSize', 'stoneWear', 'stoneAO', 'stoneTone', 'stonePores', 'stonePoreSize', 'stoneDirt', 'stoneBump', 'stoneTexScale', 'stoneMossOn', 'stoneMossAmt', 'stoneMossScale', 'stoneMossFuzz', 'stoneMossColor', 'stoneMossColor2', 'stoneMossTop', 'stoneMossBump', 'stoneMossDrip', 'stoneMossHeight', 'stoneMossBubble']) ST.onChange(k, updateStoneUniforms);
ST.onChange('stoneMossOn', () => applyMoss());
let _mossT = 0; const _mossRe = () => { clearTimeout(_mossT); _mossT = setTimeout(applyMoss, 160); };
for (const k of ['stoneMossAmt', 'stoneMossScale', 'stoneMossTop', 'stoneMossDrip', 'stoneMossHeight', 'stoneMossBubble', 'stoneTexScale', 'stoneSeed']) ST.onChange(k, _mossRe);
for (const k of ['furLength', 'furDensity', 'furFluff', 'furGravity', 'furColor', 'furClump', 'furFlow', 'furThickness', 'furVariation', 'furBlur', 'furPatMix', 'furPatScale']) ST.onChange(k, applyFurUniforms);
ST.onChange('furPattern', loadFurPattern);
ST.onChange('furLayers', applyFur);
ST.onChange('size', layout);
ST.onChange('logo', loadLogo);
applyLights();
items = defaultItems();
rebuild();
loadLogo(ST.get('logo'));
function fit() {
poke(800);
renderer.setPixelRatio(curPR);
renderer.setSize(W(), H());
camera.aspect = W() / H();
camera.updateProjectionMatrix();
const visH = 2 * Math.tan(THREE.MathUtils.degToRad(35 / 2)) * 8;
const visW = visH * camera.aspect;
const need = ST.get('size') * 1.15;
rootBase = Math.min(1, visW / need);
root.scale.setScalar(rootBase * poseD[2]);
updateWall();
}
window.addEventListener('resize', fit);
if (window.ResizeObserver) new ResizeObserver(fit).observe(area);
ST.onChange('size', fit);
fit();
const dU = {
tColor: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uGrain: { value: 2 }, uAmt: { value: 1.3 }, uShadow: { value: 0.12 },
uBlue: { value: 0 }, uSpecks: { value: 0.5 }, uInk: { value: new THREE.Color(0, 0, 0) }, uPaper: { value: new THREE.Color(1, 1, 1) },
uGray: { value: 0 }, uSeed: { value: 1 }, uExp: { value: 1.8 }, uLogoOnly: { value: 0 }, uOutline: { value: 1 }, uCap: { value: 0.92 }, uNoiseAmt: { value: 0 }, uNoiseSize: { value: 1 },
};
const ditherMat = new THREE.ShaderMaterial({
uniforms: dU, depthTest: false, depthWrite: false, transparent: true,
vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
fragmentShader: `
varying vec2 vUv;
uniform sampler2D tColor; uniform vec2 uRes; uniform float uGrain, uAmt, uShadow, uBlue, uSpecks, uGray, uSeed, uExp, uLogoOnly, uOutline, uCap, uNoiseAmt, uNoiseSize; uniform vec3 uInk, uPaper;
float hn(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
void main(){
vec2 px = gl_FragCoord.xy;
vec2 cell = floor(px / uGrain);
vec2 cuv = (cell + 0.5) * uGrain / uRes;
vec4 c = texture2D(tColor, cuv);
vec4 cp = texture2D(tColor, vUv);
float cover = smoothstep(0.35, 0.65, cp.a);
vec3 rgb = c.a > 0.001 ? c.rgb / c.a : vec3(0.0);
float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
float l = pow(clamp(1.0 - exp(-lum * uExp), 0.0, 1.0), 1.0 / 2.2);
l = clamp((l - 0.5) * uAmt + 0.5, 0.0, 1.0);
l = min(l, uCap);   /* lit faces keep a few ink dots so they never vanish into the paper */
float nw = h21(cell + uSeed * 17.31);
float nb = ign(cell + uSeed * 5.0);
float n = mix(nw, nb, uBlue);
float ink;
if (uGray > 0.5) {
float g = clamp(l + (n - 0.5) * 0.55, 0.0, 1.0);
g *= smoothstep(uShadow * 0.4, uShadow * 1.6 + 0.001, l);
ink = 1.0 - g;
ink = floor(ink * 4.0 + 0.5) / 4.0;
} else {
ink = l < uShadow ? 1.0 : (n > (l - uShadow) / max(1.0 - uShadow, 0.001) ? 1.0 : 0.0);
}
vec3 paper = uPaper * (1.0 - 0.035 * h21(px * 0.37 + uSeed));
float speck = step(1.0 - uSpecks * 0.012, h21(floor(px / max(1.0, uGrain * 0.5)) * 1.7 + uSeed * 3.1));
float fine = step(1.0 - uSpecks * 0.03, h21(px * 0.91 + 9.7 + uSeed)) * 0.5;
vec3 bg = mix(paper, uInk, clamp(speck + fine, 0.0, 1.0) * uSpecks);
vec3 fg = mix(paper, uInk, ink);
vec2 st = uGrain / uRes;
float edge = 0.0;
float R = uOutline * 6.0;                       /* band width in dither cells along the silhouette */
if (c.a > 0.5 && R > 0.5) {
float mnA = 1.0;
for (int i = 1; i <= 6; i++) {
float fi = float(i); if (fi > R + 0.01) break;
vec2 o = st * fi, o2 = vec2(o.x, -o.y);
mnA = min(mnA, min(min(texture2D(tColor, cuv + vec2(o.x, 0.0)).a, texture2D(tColor, cuv - vec2(o.x, 0.0)).a), min(texture2D(tColor, cuv + vec2(0.0, o.y)).a, texture2D(tColor, cuv - vec2(0.0, o.y)).a)));
mnA = min(mnA, min(min(texture2D(tColor, cuv + o).a, texture2D(tColor, cuv - o).a), min(texture2D(tColor, cuv + o2).a, texture2D(tColor, cuv - o2).a)));
}
edge = mnA < 0.5 ? 1.0 : 0.0;
}
fg = mix(fg, paper, step(0.5, edge));
ink = mix(ink, 0.0, step(0.5, edge));
cover = max(cover, step(0.5, edge));
vec3 col = uLogoOnly > 0.5 ? fg : mix(bg, fg, cover);
gl_FragColor = vec4(col, uLogoOnly > 0.5 ? cover : 1.0);
#include <colorspace_fragment>
float nv = hn(floor(px / uNoiseSize)) - 0.5;
float pm = cover > 0.5 ? 1.0 - ink : (uLogoOnly > 0.5 ? 0.0 : 1.0);
gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(step(0.0, nv)), abs(nv) * 2.0 * uNoiseAmt * pm);
}`,
});
const ditherScene = new THREE.Scene();
const ditherQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ditherMat);
ditherQuad.frustumCulled = false;
ditherScene.add(ditherQuad);
const ditherCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
let ditherRT = null;
const bgOnlyScene = new THREE.Scene();
const ditherOverride = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
function updateDitherUniforms() {
const g = (k) => ST.get(k);
dU.uGrain.value = Math.max(1, g('ditherGrain') * renderer.getPixelRatio());
dU.uAmt.value = g('ditherAmt'); dU.uShadow.value = g('ditherShadow');
dU.uBlue.value = g('ditherNoise') === 'blue' ? 1 : 0; dU.uGray.value = g('ditherMode') === 'gray' ? 1 : 0;
dU.uSpecks.value = g('ditherSpecks'); dU.uInk.value.set(g('ditherInk')); dU.uPaper.value.set(g('ditherPaper'));   /* paper = the background color */ dU.uSeed.value = g('ditherSeed'); dU.uLogoOnly.value = g('ditherScope') === 'logo' ? 1 : 0; dU.uOutline.value = g('ditherEdge'); dU.uCap.value = g('ditherCap');
poke(1500);
}
function renderFrame() {
if (ST.get('deformPreset') !== 'dither') { renderer.render(scene, camera); return; }
const size = renderer.getDrawingBufferSize(new THREE.Vector2());
if (!ditherRT || ditherRT.width !== size.x || ditherRT.height !== size.y) {
if (ditherRT) ditherRT.dispose();
ditherRT = new THREE.WebGLRenderTarget(size.x, size.y, { samples: 4, type: THREE.HalfFloatType });
}
dU.uRes.value.copy(size);
dU.uNoiseSize.value = Math.max(1, ST.get('bgNoiseSize') * renderer.getPixelRatio());
dU.uNoiseAmt.value = ST.get('bgMode') === 'transparent' ? 0 : ST.get('bgNoise');
const bg = scene.background, ov = scene.overrideMaterial, fl = floor.visible;
const cc = new THREE.Color(); renderer.getClearColor(cc); const ca = renderer.getClearAlpha();
/* helper meshes (noise quad, backdrop wall, transition overlay, light markers) must not be drawn with the override material:
they would turn into white geometry that cuts through / covers the logo */
const helpers = [noiseMesh, wall, trMesh, ...mlMarkers], hv = helpers.map((o) => o.visible);
helpers.forEach((o) => { o.visible = false; });
scene.background = null; floor.visible = false;
if (ST.get('ditherBase') !== 'fur') scene.overrideMaterial = ditherOverride;
renderer.setClearColor(0x000000, 0);
renderer.setRenderTarget(ditherRT); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);
scene.background = bg; scene.overrideMaterial = ov; floor.visible = fl; renderer.setClearColor(cc, ca);
helpers.forEach((o, i) => { o.visible = hv[i]; });
dU.tColor.value = ditherRT.texture;
renderer.autoClear = false;
renderer.clear();
if (dU.uLogoOnly.value > 0.5) {
bgOnlyScene.background = bg; renderer.render(bgOnlyScene, camera);
if (noiseMesh.visible) {   /* same background noise as every other style, so the backdrop looks identical */
const nv = scene.children.map((o) => o.visible), nb = scene.background;
scene.children.forEach((o) => { o.visible = o === noiseMesh; }); scene.background = null;
renderer.render(scene, camera);
scene.background = nb; scene.children.forEach((o, i) => { o.visible = nv[i]; });
}
}
renderer.render(ditherScene, ditherCam);
if (trMesh.visible) {   /* material-change transition drawn over the dithered result */
const cv = scene.children.map((o) => o.visible), b2 = scene.background;
scene.children.forEach((o) => { o.visible = o === trMesh; }); scene.background = null;
renderer.render(scene, camera);
scene.background = b2; scene.children.forEach((o, i) => { o.visible = cv[i]; });
}
renderer.autoClear = true;
}
for (const k of ['ditherMode', 'ditherGrain', 'ditherAmt', 'ditherShadow', 'ditherNoise', 'ditherSpecks', 'ditherInk', 'ditherPaper', 'ditherSeed', 'ditherScope', 'ditherEdge', 'ditherCap', 'bgColor', 'bgGlobalOn', 'bgGlobalColor']) ST.onChange(k, updateDitherUniforms);
ST.onChange('deformPreset', () => { updateDitherUniforms(); poke(2500); });
let adEma = 16.7, adLast = 0, adCool = 0;
function adaptRes(ts) {
const maxPR = Math.min(window.devicePixelRatio || 1, 2), minPR = Math.min(maxPR, 1.0);   /* never below 1 CSS pixel = 1 device pixel */
if (!(ST.get('motionEnabled') || trActive || mSettle)) {
adLast = 0;
if (curPR < maxPR - 0.01) { curPR = maxPR; renderer.setPixelRatio(curPR); renderer.setSize(W(), H()); noiseU.uDpr.value = curPR; poke(500); }   /* full quality as soon as motion stops */
return;
}
if (adLast) adEma = adEma * 0.92 + Math.min(60, ts - adLast) * 0.08;
adLast = ts;
if (ts < adCool) return;
let np = curPR;
if (adEma > 30 && curPR > minPR + 0.01) np = Math.max(minPR, curPR * 0.88);
else if (adEma < 17.5 && curPR < maxPR) np = Math.min(maxPR, curPR * 1.15);
if (Math.abs(np - curPR) > 0.01) {
curPR = np; renderer.setPixelRatio(curPR); renderer.setSize(W(), H()); noiseU.uDpr.value = curPR;
adCool = ts + 900; adEma = 16.7;
}
}
let mLt = 0, mLast = 0, mLin = 0, mAng = 0, mVel = 0, mPh = 0, mSettle = false;
function animate(ts) {
requestAnimationFrame(animate);
const dt = Math.min(0.05, Math.max(0, (ts - (mLast || ts)) / 1000)); mLast = ts;
if (performance.now() > renderUntil && !ST.get('motionEnabled') && !mSettle && ST.get('bgMode') !== 'video') return;
const mode = ST.get('motion');
const sp = ST.get('speed');
const en = !!ST.get('motionEnabled') && (mode === 'spin' || mode === 'sway' || mode === 'loop' || mode === 'turn');
mLin = en ? Math.min(1, mLin + dt / 3) : Math.max(0, mLin - dt / 1.5);
const ramp = mLin * mLin * (3 - 2 * mLin);          /* smooth ease-in on start, ease-out on stop */
let rot = 0;
if (en && (mode === 'loop' || mode === 'turn')) {
const T = Math.max(0.5, ST.get('loopDur')), Pz = Math.max(0, ST.get('loopPause')), turns = 2 * Math.PI * (mode === 'turn' ? 1 : Math.max(1, Math.round(ST.get('loopTurns')))) * (sp < 0 ? -1 : 1);
mLt += dt;
const u = Math.min(1, (mLt % (T + Pz)) / T);
const e = u * u * u * (u * (u * 6 - 15) + 10);
mAng = turns * e; mVel = u >= 1 ? 0 : turns * 30 * u * u * (1 - u) * (1 - u) / T;
rot = mAng; mSettle = true; mPh = 0;
} else if (en && mode === 'spin') {
mVel = sp * 0.8 * ramp; mAng += mVel * dt; rot = mAng; mSettle = true;
} else if (en && mode === 'sway') {
mPh += sp * 1.5 * ramp * dt; rot = Math.sin(mPh) * 0.6 * ramp; mAng = 0; mVel = 0; mSettle = true;
} else {
const tgt = Math.round(mAng / (Math.PI * 2)) * Math.PI * 2, w = 3.2;
mVel += (w * w * (tgt - mAng) - 2 * w * mVel) * dt; mAng += mVel * dt;
if (Math.abs(tgt - mAng) < 0.0005 && Math.abs(mVel) < 0.002) { mAng = 0; mVel = 0; mSettle = false; mLt = 0; } else mSettle = true;
if (mLin > 0) rot = Math.sin(mPh) * 0.6 * ramp + mAng; else { rot = mAng; mPh = 0; }
poke(300);
}
const tg = [ST.get('poseX'), ST.get('poseY'), ST.get('poseS'), ST.get('logoRotX'), ST.get('logoRotY'), ST.get('logoRotZ')];
const pp = trActive ? Math.min(1, Math.max(0, (performance.now() - trT0) / (Math.max(0.2, ST.get('transDur')) * 1000))) : 1;
const pe = pp < 0.5 ? 4 * pp * pp * pp : 1 - Math.pow(-2 * pp + 2, 3) / 2;
for (let i = 0; i < 6; i++) poseD[i] = trActive && trFrom ? trFrom[i] + (tg[i] - trFrom[i]) * pe : tg[i];
if (trActive) { trU.uP.value = pe; poke(300); if (pp >= 1) { trActive = false; trFrom = null; trMesh.visible = false; } }
const D2R = Math.PI / 180;
root.rotation.set(poseD[3] * D2R, poseD[4] * D2R, poseD[5] * D2R);
root.rotation[ST.get('rotAxis') || 'y'] += rot;
root.scale.setScalar(rootBase * poseD[2]);
if (Math.abs(poseD[2] - lastPoseS) > 0.002) { lastPoseS = poseD[2]; updateWall(); }
const lp = ST.get('logoPos') || { x: 0, y: 0 };
root.position.set((lp.x || 0) * 3 + poseD[0], (lp.y || 0) * 3 + poseD[1], 0);
orbit.update();
renderFrame();
adaptRes(ts);
}
requestAnimationFrame(animate);
let bgTex = null;
const noiseU = { uAmt: { value: 0 }, uSize: { value: 1 }, uDpr: { value: 1 } };
const noiseMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
uniforms: noiseU, depthTest: false, depthWrite: false, blending: THREE.CustomBlending,
blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
fragmentShader: `uniform float uAmt, uSize, uDpr;
float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){ vec2 c = floor(gl_FragCoord.xy / (uSize * uDpr)); float v = h(c) - 0.5; gl_FragColor = vec4(vec3(step(0.0, v)), abs(v) * 2.0 * uAmt); }`,
}));
noiseMesh.frustumCulled = false; noiseMesh.renderOrder = -1000;
scene.add(noiseMesh);
function applyNoise() {
noiseU.uAmt.value = ST.get('bgNoise'); noiseU.uSize.value = ST.get('bgNoiseSize'); noiseU.uDpr.value = renderer.getPixelRatio();
noiseMesh.visible = ST.get('bgNoise') > 0 && ST.get('bgMode') !== 'transparent';
poke(1500);
}
for (const k of ['bgNoise', 'bgNoiseSize', 'bgMode']) ST.onChange(k, applyNoise);
applyNoise();
window.renderer = renderer; window.scene = scene; window.camera = camera;
void [controls.get('deformPreset'), controls.get('logo'), controls.get('depth'), controls.get('bevel'), controls.get('bevelSmooth'), controls.get('poseX'), controls.get('poseY'), controls.get('poseS'), controls.get('logoRotX'), controls.get('logoRotY'), controls.get('logoRotZ'), controls.get('motionEnabled'), controls.get('motion'), controls.get('loopTurns'), controls.get('loopDur'), controls.get('loopPause'), controls.get('rotAxis'), controls.get('speed'), controls.get('envPreset'), controls.get('lightPreset'), controls.get('envIntensity'), controls.get('lightIntensity'), controls.get('metalEnvRot'), controls.get('metalEnvSoft'), controls.get('shadow'), controls.get('colorStandard'), controls.get('glassLens'), controls.get('glassBend'), controls.get('glassLD'), controls.get('glassCA'), controls.get('glassIor'), controls.get('glassDisp'), controls.get('glassThick'), controls.get('glassTint'), controls.get('glassAbs'), controls.get('glassRainbow'), controls.get('glassFrost'), controls.get('glassScrA'), controls.get('glassScrS'), controls.get('glassEdge'), controls.get('glassBack'), controls.get('knitMode'), controls.get('knitCount'), controls.get('knitWeight'), controls.get('knitPlies'), controls.get('knitTwist'), controls.get('knitFuzz'), controls.get('knitHair'), controls.get('knitHairLen'), controls.get('knitHeather'), controls.get('knitIrreg'), controls.get('knitPattern'), controls.get('knitMistakes'), controls.get('knitUneven'), controls.get('knitSoft'), controls.get('knitInflate'), controls.get('knitSeed'), controls.get('knitPalette'), controls.get('knitImage'), controls.get('knitImgMode'), controls.get('knitImgScale'), controls.get('knitY1'), controls.get('knitY2'), controls.get('knitY3'), controls.get('knitY4'), controls.get('knitY5'), controls.get('knitY6'), controls.get('knitEmb'), controls.get('knitEAng'), controls.get('knitEDen'), controls.get('knitEH'), controls.get('knitThread'), controls.get('colorMetal'), controls.get('metalRough'), controls.get('metalAniso'), controls.get('metalBrushDir'), controls.get('metalBrushStrength'), controls.get('metalScratch'), controls.get('metalGrain'), controls.get('metalEdge'), controls.get('metalRound'), controls.get('metalInflate'), controls.get('colorBalloon'), controls.get('balloonGloss'), controls.get('colorBalloonShadow'), controls.get('balloonShadowAmt'), controls.get('balloonInflate'), controls.get('balloonZBulge'), controls.get('balloonXYGrow'), controls.get('balloonRoundness'), controls.get('balloonPinch'), controls.get('balloonWrinkleFreq'), controls.get('balloonWrinkleDepth'), controls.get('balloonFold'), controls.get('balloonFoldFreq'), controls.get('balloonStar'), controls.get('colorCrumpled'), controls.get('clayMatte'), controls.get('clayTex'), controls.get('clayColor2'), controls.get('clayMott'), controls.get('clayMottSize'), controls.get('clayGrain'), controls.get('clayGrainSize'), controls.get('clayLump'), controls.get('clayLumpSize'), controls.get('clayPits'), controls.get('clayPitSize'), controls.get('clayCrack'), controls.get('clayDust'), controls.get('clayBump'), controls.get('crumpleIntensity'), controls.get('crumpleScale'), controls.get('crumpleDetail'), controls.get('stoneMossOn'), controls.get('stoneMossHeight'), controls.get('stoneMossBubble'), controls.get('stoneMossAmt'), controls.get('stoneMossTop'), controls.get('stoneMossDrip'), controls.get('stoneMossScale'), controls.get('stoneMossFuzz'), controls.get('stoneMossBump'), controls.get('stoneMossColor'), controls.get('stoneMossColor2'), controls.get('stoneColor'), controls.get('stoneColor2'), controls.get('stoneColor3'), controls.get('stoneRust'), controls.get('stonePatina'), controls.get('stoneTone'), controls.get('stoneDetail'), controls.get('stoneGrain'), controls.get('stoneGrainSize'), controls.get('stoneWear'), controls.get('stoneAO'), controls.get('stoneCracks'), controls.get('stoneIntensity'), controls.get('stoneScale'), controls.get('stoneSharp'), controls.get('stoneTilt'), controls.get('stoneEdge'), controls.get('stoneRough'), controls.get('stoneSeed'), controls.get('stonePores'), controls.get('stonePoreSize'), controls.get('stoneDirt'), controls.get('stoneBump'), controls.get('stoneTexScale'), controls.get('furColor'), controls.get('furBevel'), controls.get('furBevelSmooth'), controls.get('furLength'), controls.get('furFluff'), controls.get('furGravity'), controls.get('furThickness'), controls.get('furBlur'), controls.get('furPattern'), controls.get('furPatMix'), controls.get('furPatScale'), controls.get('furVariation'), controls.get('furClump'), controls.get('furFlow'), controls.get('furLayers'), controls.get('ditherBase'), controls.get('ditherScope'), controls.get('ditherMode'), controls.get('ditherGrain'), controls.get('ditherAmt'), controls.get('ditherShadow'), controls.get('ditherNoise'), controls.get('ditherSpecks'), controls.get('ditherEdge'), controls.get('ditherCap'), controls.get('ditherInk'), controls.get('ditherSeed'), controls.get('ditherPaper'), controls.get('mlMode'), controls.get('mlShow'), controls.get('ml1On'), controls.get('ml1Col'), controls.get('ml1Int'), controls.get('ml1Conc'), controls.get('ml1Soft'), controls.get('ml1X'), controls.get('ml1Y'), controls.get('ml1Z'), controls.get('ml1Shad'), controls.get('ml2On'), controls.get('ml2Col'), controls.get('ml2Int'), controls.get('ml2Conc'), controls.get('ml2Soft'), controls.get('ml2X'), controls.get('ml2Y'), controls.get('ml2Z'), controls.get('ml2Shad'), controls.get('ml3On'), controls.get('ml3Col'), controls.get('ml3Int'), controls.get('ml3Conc'), controls.get('ml3Soft'), controls.get('ml3X'), controls.get('ml3Y'), controls.get('ml3Z'), controls.get('ml3Shad'), controls.get('ml4On'), controls.get('ml4Col'), controls.get('ml4Int'), controls.get('ml4Conc'), controls.get('ml4Soft'), controls.get('ml4X'), controls.get('ml4Y'), controls.get('ml4Z'), controls.get('ml4Shad'), controls.get('bgShadow'), controls.get('bgShadowOpacity'), controls.get('bgShadowDist'), controls.get('bgShadowSoft'), controls.get('perspOn'), controls.get('persp'), controls.get('transOn'), controls.get('transEffect'), controls.get('transDur')];
