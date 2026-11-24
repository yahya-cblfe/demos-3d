// Prime Palau · demo 3D (three.js r170, vendored). Scene modelled in Blender (blender/build.py) and exported as one GLB.
// Blender axes: x along the street, y into the plot (uphill), z up.  three.js = (x, z, -y).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const $ = (s) => document.querySelector(s);
const Q = new URLSearchParams(location.search);
const B = (x, y, z) => new THREE.Vector3(x, z, -y);
const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const isMobile = matchMedia('(max-width: 760px)').matches;

/* ---------------- i18n ---------------- */
const TXT = {
  es: {
    sub: 'Palau-saverdera · Prime Nordisk', video: 'Vídeo', cta: 'Pedir información', skip: 'Saltar intro ›', pick: 'Elige tu casa', pickP: '6 casas en hilera · toca una casa o una letra',
    sunset: 'Atardecer', pool: 'Piscina privada (opcional)', furn: 'Mobiliario', shut: 'Persianas bajadas', built: 'Construidos', ext: 'Exterior', plot: 'Parcela',
    enter: 'Entrar · por plantas', ask: 'Pedir info', fAll: 'Todas las plantas', fAllS: 'vista despiezada', f2: 'Planta primera', f1: 'Planta baja', f0: 'Planta calle',
    f2S: '≈ 55-56 m² útiles', f1S: '≈ 56-58 m² útiles', f0S: '≈ 39-40 m² útiles', toLiving: 'Salón 3D', toBed: 'Dormitorio 3D', replay: 'Ver construcción', exit: '‹ Volver a la calle',
    note: 'Imágenes orientativas de una promoción en proyecto; acabados y colores aproximados.', note2: 'Demo creada por Yahya con la información pública de Prime Nordisk; distribución y medidas aproximadas.',
    house: 'Casa', unitLv: 'Prime Palau · casa en hilera', vat: '+ IVA', rooms: '3 dorm. · 3 baños', status: { disponible: 'Disponible', reservada: 'Reservada', vendida: 'Vendida' },
    views: { aerial: 'Vista aérea', street: 'Fachada calle', living: 'Salón-cocina', garden: 'Jardín y terraza', bedroom: 'Dormitorio principal', pool: 'Piscina comunitaria' },
    hintPick: 'Toca una casa (A-F) para ver sus datos', hintIn: 'Arrastra para mirar alrededor', hintEx: 'Arrastra para girar · elige una planta',
    facts: (p) => `<b>6 casas</b> en hilera · <b>3 plantas</b> · ≈ 200 m² cada una · ${p.builtTotal.toLocaleString('es-ES')} m² en total. Garaje con puerta de 4,60 m y plaza exterior, salón-cocina abierto al jardín, 3 dormitorios (principal con vestidor y baño). <b>Piscina comunitaria</b>. Arquitecto: ${p.architect}. Entrega prevista: <b>${p.delivery.es}</b>.<br><span style="opacity:.75">Precios sin IVA según la web de ${p.developer} (23/11/2026).</span>`,
    story: [
      ['Prime Nordisk · Palau-saverdera', 'Del plano a tu casa', 'Seis casas en hilera en el Carrer de l\'Oliva, entre el Cap de Creus y la bahía de Roses. Proyecto de Joan Vieyra Bosch.'],
      ['Planta calle', 'Garaje y lavadero', 'Puerta de garaje de 4,60 m y sitio para un segundo coche delante.'],
      ['Planta baja', 'Abierta al jardín', 'Sala de estar, cocina-comedor, terraza delantera y terraza del jardín.'],
      ['Planta primera', 'Tres dormitorios', 'Dormitorio principal con vestidor y baño, y terraza. Cubierta de teja árabe y partes planas.'],
      ['Entrega prevista · marzo de 2028', 'Elige tu casa', 'Toca una casa de la A a la F para ver precio, superficies y recorrerla por plantas.'],
    ],
    rooms_: { garaje: 'Garaje', lav: 'Lavadero', acceso: 'Acceso', parking: 'Aparcamiento exterior', sala: 'Sala de estar', cocina: 'Cocina-comedor', bano: 'Baño', tdel: 'Terraza delantera',
      tjar: 'Terraza del jardín', jardin: 'Jardín', ppal: 'Dormitorio principal', vest: 'Vestidor', dorm: 'Dormitorio', terraza: 'Terraza', banop: 'Baño principal', piscina: 'Piscina privada (opcional)' },
    mailS: 'Prime Palau · demo 3D', mailB: 'Hola Yahya,\n\nhe visto la demo 3D de Prime Palau y me gustaría hablar de ella.\n\n',
  },
  en: {
    sub: 'Palau-saverdera · Prime Nordisk', video: 'Video', cta: 'Request information', skip: 'Skip intro ›', pick: 'Choose your home', pickP: '6 terraced houses · tap a house or a letter',
    sunset: 'Sunset', pool: 'Private pool (optional)', furn: 'Furniture', shut: 'Shutters down', built: 'Built', ext: 'Outdoor', plot: 'Plot',
    enter: 'Enter · floor by floor', ask: 'Ask', fAll: 'All floors', fAllS: 'exploded view', f2: 'First floor', f1: 'Ground floor', f0: 'Street level',
    f2S: '≈ 55-56 m² usable', f1S: '≈ 56-58 m² usable', f0S: '≈ 39-40 m² usable', toLiving: 'Living 3D', toBed: 'Bedroom 3D', replay: 'Watch it being built', exit: '‹ Back to the street',
    note: 'Indicative images of an off-plan development; finishes and colours are approximate.', note2: 'Demo made by Yahya from Prime Nordisk\'s public information; layout and sizes are approximate.',
    house: 'House', unitLv: 'Prime Palau · terraced house', vat: '+ VAT', rooms: '3 bed · 3 bath', status: { disponible: 'Available', reservada: 'Reserved', vendida: 'Sold' },
    views: { aerial: 'Aerial view', street: 'Street front', living: 'Living-kitchen', garden: 'Garden & terrace', bedroom: 'Master bedroom', pool: 'Community pool' },
    hintPick: 'Tap a house (A-F) to see its details', hintIn: 'Drag to look around', hintEx: 'Drag to rotate · pick a floor',
    facts: (p) => `<b>6 terraced houses</b> · <b>3 floors</b> · ≈ 200 m² each · ${p.builtTotal.toLocaleString('en-GB')} m² in total. Garage with a 4.60 m door and an outdoor space, living-kitchen open to the garden, 3 bedrooms (master with walk-in closet and bathroom). <b>Community pool</b>. Architect: ${p.architect}. Planned delivery: <b>${p.delivery.en}</b>.<br><span style="opacity:.75">Prices exclude VAT, as listed on ${p.developer}'s website (23/11/2026).</span>`,
    story: [
      ['Prime Nordisk · Palau-saverdera', 'From plan to home', 'Six terraced houses on Carrer de l\'Oliva, between Cap de Creus and the Bay of Roses. Designed by Joan Vieyra Bosch.'],
      ['Street level', 'Garage and laundry', '4.60 m garage door and room for a second car in front.'],
      ['Ground floor', 'Open to the garden', 'Living room, kitchen-dining, front terrace and garden terrace.'],
      ['First floor', 'Three bedrooms', 'Master bedroom with walk-in closet and bathroom, plus a terrace. Arabic clay tile roof with flat sections.'],
      ['Planned delivery · March 2028', 'Choose your home', 'Tap a house from A to F to see price and areas, and walk through it floor by floor.'],
    ],
    rooms_: { garaje: 'Garage', lav: 'Laundry', acceso: 'Entrance', parking: 'Outdoor parking', sala: 'Living room', cocina: 'Kitchen-dining', bano: 'Bathroom', tdel: 'Front terrace',
      tjar: 'Garden terrace', jardin: 'Garden', ppal: 'Master bedroom', vest: 'Walk-in closet', dorm: 'Bedroom', terraza: 'Terrace', banop: 'En-suite bathroom', piscina: 'Private pool (optional)' },
    mailS: 'Prime Palau · 3D demo', mailB: 'Hi Yahya,\n\nI have seen the Prime Palau 3D demo and would like to talk about it.\n\n',
  },
};
let lang = Q.get('lang') === 'en' ? 'en' : 'es';
const L = () => TXT[lang];

/* ---------------- renderer ---------------- */
const canvas = $('#c');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { $('#loadTxt').textContent = 'WebGL no disponible en este navegador · WebGL is not available'; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.6 : 1.75));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfdbe6, 900, 7000);
const camera = new THREE.PerspectiveCamera(40, 1, .1, 14000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .08; controls.maxPolarAngle = Math.PI * .495; controls.minDistance = 3; controls.maxDistance = 320;
controls.screenSpacePanning = true;
let fovTarget = 40; const FOV = { living: 66, bedroom: 66, garden: 62, street: 48, pool: 52 };
function baseFov() { return (innerWidth < innerHeight ? 1.45 : 1) * fovTarget; }
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = Math.min(80, baseFov()); camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

/* ---------------- loading ---------------- */
const loadBar = $('#loadBar');
const gltfLoader = new GLTFLoader(), rgbe = new RGBELoader(), tl = new THREE.TextureLoader();
const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const [gltf, DATA, SC] = await Promise.all([
  gltfLoader.loadAsync('assets/prime_palau.glb', (e) => { if (e.total) loadBar.style.width = (e.loaded / e.total * 85).toFixed(0) + '%'; }),
  fetch('data/units.json').then((r) => r.json()), fetch('data/scene.json').then((r) => r.json()),
]);
const UNITS = DATA.units, PROMO = DATA.promo, IDS = UNITS.map((u) => u.id);
const W = SC.W, HX = SC.houses;
const skies = {};
function loadSky(k) {
  if (!skies[k]) skies[k] = Promise.all([tl.loadAsync(`assets/sky/${k}.jpg`), rgbe.loadAsync(`assets/sky/${k}_env.hdr`)]).then(([bg, env]) => {
    bg.mapping = env.mapping = THREE.EquirectangularReflectionMapping; bg.colorSpace = THREE.SRGBColorSpace; return { bg, env };
  });
  return skies[k];
}
await loadSky('day'); loadBar.style.width = '100%';

/* ---------------- scene graph from the GLB ---------------- */
const world = gltf.scene; scene.add(world);
const H = {};                         // per house: groups + mesh lists
for (const id of IDS) {
  const g = (k) => world.getObjectByName(`${id}_${k}`);
  H[id] = { id, root: world.getObjectByName(`House_${id}`), L0: g('L0'), L1: g('L1'), L2: g('L2'), RF: g('RF'), SITE: g('SITE'), POOL: g('POOL'), NOPOOL: g('NOPOOL'), x: HX[id], meshes: [] };
}
const LEVELS = ['L0', 'L1', 'L2', 'RF'], LEVEL_Y = { L0: 0, L1: 3, L2: 6, RF: 9 };

/* ---------------- stairs fix (24 nov): the GLB stair was 16 overlapping white boxes per flight (coplanar side faces -> z-fighting,
   flicker, flat blown-out steps). Cut those triangles out of the shared L0/L1 floor+int meshes and rebuild each flight as one closed
   sawtooth stringer (microcement, per-face tone) + light-stone treads with a 2 cm nosing. Skipped if a re-exported GLB already
   carries the fixed stair from blender/build.py (meshes *_stairt / *_stairb). ---------------- */
if (!world.getObjectByName('A_L1_stairt')) {
  world.updateMatrixWorld(true);
  const [SX0, SX1, SY0, SY1] = SC.stair, NST = 16, RISE = 3 / NST, GO = (SY1 - SY0) / NST, TT = .04;
  const done = new Set(), pv = new THREE.Vector3();
  for (const id of IDS) for (const lv of ['L0', 'L1']) for (const mk of ['floor', 'int']) {
    const o = world.getObjectByName(`${id}_${lv}_${mk}`); if (!o || !o.isMesh || done.has(o.geometry.uuid) || !o.geometry.index) continue;
    done.add(o.geometry.uuid);
    const g = o.geometry, pos = g.attributes.position, ix = g.index.array, keep = [], z0 = LEVEL_Y[lv];
    const inStair = (vi) => { pv.fromBufferAttribute(pos, vi).applyMatrix4(o.matrixWorld); const bx = pv.x - HX[id], by = -pv.z, bz = pv.y;
      return bx > SX0 - .002 && bx < SX1 + .002 && by > SY0 - .03 && by < SY1 + .03 && bz > z0 - .002 && bz < z0 + 3.002; };
    for (let i = 0; i < ix.length; i += 3) if (!(inStair(ix[i]) && inStair(ix[i + 1]) && inStair(ix[i + 2]))) keep.push(ix[i], ix[i + 1], ix[i + 2]);
    g.setIndex(keep); g.clearGroups(); g.addGroup(0, keep.length, 0);
  }
  // shared stair geometry (Blender-local, origin at the house x0 and level z): stringer profile in (y, z) extruded along x
  const shp = new THREE.Shape(); shp.moveTo(SY0, 0);
  for (let i = 0; i < NST; i++) { const y0 = SY0 + i * GO, zt = (i + 1) * RISE; shp.lineTo(y0, zt - TT); shp.lineTo(y0 + GO, zt - TT); }
  shp.lineTo(SY1, 3 - .32); shp.lineTo(SY0 + .32 / (RISE / GO), 0); shp.closePath();
  let body = new THREE.ExtrudeGeometry(shp, { depth: SX1 - SX0 - .03, bevelEnabled: false, steps: 1 }); body.translate(0, 0, .015);   // 1.5 cm inset: tread edges overhang, no coplanar sides
  // (u=y, v=z, w=x)  ->  three (x=w, y=v, z=-u)   (proper rotation, det +1)
  body.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1));
  body = body.toNonIndexed(); body.computeVertexNormals(); body.deleteAttribute('uv');
  { const n = body.attributes.normal, col = [];   // stairs2: per-face albedo (linear). Risers cool mid-grey, stringer warm darker grey, soffit light grey
    for (let i = 0; i < n.count; i++) { const nx = Math.abs(n.getX(i)), ny = n.getY(i), nz = n.getZ(i);
      const c = nx > .5 ? [.30, .28, .25] : nz > .5 ? [.37, .36, .35] : ny < -.3 ? [.48, .47, .45] : [.45, .44, .42]; col.push(...c); }
    body.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
  const tp = [], tn = [], tuv = [], ti = [];
  const quad = (a, b, c, d, nrm) => { const k = tp.length / 3; for (const p of [a, b, c, d]) tp.push(...p), tn.push(...nrm); tuv.push(0, 0, 1, 0, 1, 1, 0, 1); ti.push(k, k + 1, k + 2, k, k + 2, k + 3); };
  for (let i = 0; i < NST; i++) {   // tread boxes in three coords: x 0..w, y za..zb, z -(y1)..-(y0)
    const w = SX1 - SX0 + .01, ya = SY0 + i * GO - .02, yb = SY0 + (i + 1) * GO + (i < NST - 1 ? .01 : 0), za = (i + 1) * RISE - TT - .001, zb = (i + 1) * RISE, Z0 = -ya, Z1 = -yb;
    quad([0, zb, Z0], [w, zb, Z0], [w, zb, Z1], [0, zb, Z1], [0, 1, 0]);          // top
    quad([0, za, Z1], [w, za, Z1], [w, za, Z0], [0, za, Z0], [0, -1, 0]);         // bottom (nosing underside)
    quad([0, za, Z0], [w, za, Z0], [w, zb, Z0], [0, zb, Z0], [0, 0, 1]);          // nosing front
    quad([w, za, Z1], [0, za, Z1], [0, zb, Z1], [w, zb, Z1], [0, 0, -1]);         // back
    quad([0, za, Z1], [0, za, Z0], [0, zb, Z0], [0, zb, Z1], [-1, 0, 0]);         // sides
    quad([w, za, Z0], [w, za, Z1], [w, zb, Z1], [w, zb, Z0], [1, 0, 0]);
  }
  const tread = new THREE.BufferGeometry(); tread.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); tread.setAttribute('normal', new THREE.Float32BufferAttribute(tn, 3));
  tread.setAttribute('uv', new THREE.Float32BufferAttribute(tuv, 2)); tread.setIndex(ti);
  const stone = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#ddd6c9'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) { const v = 200 + Math.random() * 40 | 0; x.fillStyle = `rgba(${v},${v - 6},${v - 16},.35)`; x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; })();
  /* stairs2 (24 nov): WebGL has no indirect occlusion, so under the uniform interior env light every stair face came out the same
     near-white. Analytic "baked" AO + material in the shader, from the stair-local position (the stair geometry is known exactly):
     contact darkening tread/riser, shadow line under each nosing, party-wall contact, stringer edge under the overhang, floor
     contact, plus a stone / microcement speckle and roughness variation. Albedo stays < ~0.8 sRGB. */
  const f = (v) => v.toFixed(5);
  const stairShader = (tread) => (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSP; varying vec3 vSN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSP = position; vSN = normal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vSP; varying vec3 vSN;
float sHash(vec3 p) { p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sNoise(vec3 x) { vec3 i = floor(x), q = fract(x); q = q * q * (3. - 2. * q);
  return mix(mix(mix(sHash(i), sHash(i + vec3(1, 0, 0)), q.x), mix(sHash(i + vec3(0, 1, 0)), sHash(i + vec3(1, 1, 0)), q.x), q.y),
             mix(mix(sHash(i + vec3(0, 0, 1)), sHash(i + vec3(1, 0, 1)), q.x), mix(sHash(i + vec3(0, 1, 1)), sHash(i + vec3(1, 1, 1)), q.x), q.y), q.z); }
const float SG = ${f(GO)}, SR = ${f(RISE)}, SW = ${f(SX1 - SX0)}, SY = ${f(SY0)}, STT = ${f(TT)};`)
      .replace('#include <color_fragment>', `#include <color_fragment>
  vec3 sp = vSP, sn = normalize(vSN); float run = -sp.z - SY, ao = 1.; vec3 tint = vec3(1.);
  ao *= 1. - .38 * exp(-max(SW - sp.x, 0.) / .07);                 // party-wall contact
  float sN1 = sNoise(sp * 38.), sN2 = sNoise(sp * 230. + 7.);
  tint *= .93 + .13 * sN1; tint *= 1. - .16 * smoothstep(.80, .95, sN2) + .06 * smoothstep(.90, .98, 1. - sN2);   // mottling + speckle
${tread ? `  float ti = floor(sp.y / SR + .5) - 1.;                         // tread index (top at (i+1)*SR)
  if (sn.y > .5) { float dB = max((ti + 1.) * SG - run, 0.), dF = max(run - (ti * SG - .02), 0.);
    ao *= 1. - .5 * exp(-dB / .05);                                // contact with the riser behind
    ao *= 1. - .22 * exp(-sp.x / .025);                            // open edge
    tint *= 1. + .06 * exp(-dF / .006); }                          // polished arris on the nosing
  else if (sn.z > .5) { tint *= .68; ao *= .9 + .1 * smoothstep(0., STT, sp.y - (ti + 1.) * SR + STT); }   // nosing face: a darker line
  else if (sn.y < -.5) tint *= .45;                                // nosing underside
  else tint *= .8;` : `  float ri = floor(run / SG + .5), si = floor(run / SG + 1e-3);
  if (sn.z > .5) { float dBot = max(sp.y - ri * SR, 0.), dTop = max((ri + 1.) * SR - STT - sp.y, 0.);
    ao *= (1. - .5 * exp(-dBot / .035)) * (1. - .75 * exp(-dTop / .022)); }   // riser: contact below, shadow line under the nosing
  else if (abs(sn.x) > .5) { float dT = max((si + 1.) * SR - STT - sp.y, 0.);
    ao *= (1. - .4 * exp(-dT / .025)) * (.86 + .14 * smoothstep(0., 1.2, sp.y)); }  // stringer: under the tread overhang, darker low down
  else if (sn.y < -.3) ao *= .82 + .18 * smoothstep(0., 2.4, sp.y);   // soffit
  ao *= 1. - .3 * exp(-sp.y / .05);                                // floor contact`}
  diffuseColor.rgb *= tint * ao; float sAO = ao;`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor * (.82 + .36 * sN1), .3, 1.);')
      .replace('#include <aomap_fragment>', '#include <aomap_fragment>\n  reflectedLight.indirectSpecular *= sAO * sAO;');
  };
  const treadMat = new THREE.MeshStandardMaterial({ name: 'StairTread', map: stone, color: 0xd8d1c4, roughness: .6, envMapIntensity: .7 });
  const bodyMat = new THREE.MeshStandardMaterial({ name: 'StairBody', color: 0xffffff, vertexColors: true, roughness: .86, envMapIntensity: .7 });
  treadMat.onBeforeCompile = stairShader(true); treadMat.customProgramCacheKey = () => 'stair2t'; treadMat.userData.prog = 'stair2t';
  bodyMat.onBeforeCompile = stairShader(false); bodyMat.customProgramCacheKey = () => 'stair2b'; bodyMat.userData.prog = 'stair2b';
  for (const id of IDS) for (const lv of ['L0', 'L1']) {
    const grp = H[id][lv]; if (!grp) continue;
    for (const [geo, mat, nm] of [[body, bodyMat, 'stairb'], [tread, treadMat, 'stairt']]) {
      const m = new THREE.Mesh(geo, mat); m.name = `${id}_${lv}_${nm}`; m.position.copy(B(HX[id] + SX0, 0, LEVEL_Y[lv])); scene.add(m); m.updateMatrixWorld(true); grp.attach(m);
    }
  }
}
const shutters = [], furniture = [], lampMats = new Set(), houseMats = new Set(), pickables = [];
const glassMat = new THREE.MeshStandardMaterial({ name: 'GlassWeb', color: 0x5f7882, roughness: .03, metalness: .2, transparent: true, opacity: .42, envMapIntensity: 1.2, depthWrite: false });
const waterMat = new THREE.MeshStandardMaterial({ name: 'WaterWeb', color: 0x37a9c6, roughness: .04, metalness: .15, transparent: true, opacity: .88, envMapIntensity: 1.6 });
const cloneCache = new Map();
world.traverse((o) => {
  if (!o.isMesh) return;
  o.castShadow = true; o.receiveShadow = true;
  let m = o.material;
  if (/^Glass/.test(m.name)) o.material = m = glassMat, o.castShadow = false;
  else if (/^Water/.test(m.name)) o.material = m = waterMat, o.castShadow = false;
  if (m.map) m.map.anisotropy = ANISO;
  if (/^Lamp/.test(m.name)) { lampMats.add(m); m.emissive.set(0xffd9a0); }
  if (o.name.includes('_shutter')) shutters.push(o);
  if (o.userData.furniture) furniture.push(o);
  let h = null; for (let p = o.parent; p; p = p.parent) { const k = /^House_([A-F])$/.exec(p.name); if (k) { h = k[1]; break; } }
  if (h) {
    o.userData.house = h; H[h].meshes.push(o);
    let lv = null; for (let p = o.parent; p; p = p.parent) { const k = /^[A-F]_(L0|L1|L2|RF)$/.exec(p.name); if (k) { lv = k[1]; break; } }
    o.userData.level = lv;
    if (lv) pickables.push(o);
    if (m !== glassMat && m !== waterMat) houseMats.add(m);
  } else if (m !== glassMat && m !== waterMat) {
    // the context / site get their own copies so the construction clipping only touches the six houses
    if (!cloneCache.has(m)) cloneCache.set(m, m.clone()); o.material = cloneCache.get(m);
  }
  if (o.name === 'Terrain') { o.castShadow = false; o.material.color.setRGB(1.12, 1.26, 1.0); }
  if (/^Grass/.test(o.material.name) || /grass/.test(o.name)) o.material.color.setScalar(1.25);
  if (o.name === 'Sea') { o.castShadow = false; o.receiveShadow = false; }
});

/* ---------------- lights ---------------- */
const sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = true; sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 400 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .04;
const sunTarget = B(-3, 18, 0); sun.target.position.copy(sunTarget); scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xdfeaff, 0x8a8268, .35); scene.add(hemi);
const warm = [[2.35, 13.4, 4.75], [2.35, 14.4, 4.75], [4.38, 13.7, 4.8], [.6, 12.95, 6.8], [2.8, 12.95, 6.8], [2.6, 9.6, 5.6]].map((p) => { const l = new THREE.PointLight(0xffb36b, 0, 9, 1.6); l.userData.p = p; scene.add(l); return l; });
const SKY_U = { day: .5951, sunset: .6049 };
const TIMES = {
  day: { exp: 1.0, sunC: 0xfff3e2, sunI: 3.0, el: 42, az: 150, hemi: .35, env: .95, bgI: 1, fog: 0xd3dfe9, lamp: 0, warm: 0 },
  sunset: { exp: .82, sunC: 0xffa765, sunI: 2.4, el: 11, az: -35, hemi: .12, env: .55, bgI: 1.1, fog: 0xd9bba9, lamp: 1.6, warm: 1.4 },
};
let timeReq = 0;
async function setTime(k) {
  const t = TIMES[k], req = ++timeReq, { bg, env } = await loadSky(k); if (req !== timeReq) return;
  state.time = k;
  const az = THREE.MathUtils.degToRad(t.az), el = THREE.MathUtils.degToRad(t.el);
  const d = B(Math.sin(az) * Math.cos(el), Math.cos(az) * Math.cos(el), Math.sin(el));
  sun.position.copy(sunTarget).addScaledVector(d, 150); sun.color.set(t.sunC); sun.intensity = t.sunI;
  const rot = (SKY_U[k] - .5) * Math.PI * 2 - Math.atan2(d.z, d.x);
  if (state.phase !== 'blueprint') { scene.background = bg; }
  scene.environment = env; scene.backgroundRotation.y = scene.environmentRotation.y = rot; scene.backgroundIntensity = t.bgI; scene.environmentIntensity = t.env;
  hemi.intensity = t.hemi; scene.fog.color.set(t.fog); renderer.toneMappingExposure = t.exp;
  lampMats.forEach((m) => m.emissiveIntensity = t.lamp); warm.forEach((l) => l.intensity = t.warm);
  syncToggles();
}

/* ---------------- vegetation (stairs/trees fix, 24 nov): no billboards any more. Real 3D Mediterranean species (stone pine, holm oak,
   olive, Canary palm, oleander, pittosporum, lavender, cypress) from the CC0 procedural library veg.glb (vertex colours, real leaf /
   needle geometry, no alpha cards -> no sorting artifacts), instanced; trees far from the row use a decimated LOD1 (veg_lod1.glb). ---------------- */
{
  const [vegA, vegB] = await Promise.all([gltfLoader.loadAsync('assets/veg/veg.glb'), gltfLoader.loadAsync('assets/veg/veg_lod1.glb').catch(() => null)]);
  const VG = {}, VG1 = {};
  const grab = (root, dst) => root && root.scene.traverse((o) => { if (o.isMesh) { const g = o.geometry; if (!g.attributes.normal) g.computeVertexNormals(); g.computeBoundingSphere(); dst[o.name.replace(/^[WV][a-z]*_/, '').replace(/_lod1$/, '')] = g; } });
  grab(vegA, VG); grab(vegB, VG1);
  const MAT = (c) => new THREE.MeshStandardMaterial({ vertexColors: true, color: c, roughness: .88, side: THREE.DoubleSide, envMapIntensity: .8 });
  const mats = { pine: MAT(0xb9bfa8), oak: MAT(0xb4baa2), olive: MAT(0xbcc0ad), palm: MAT(0xc4c6ae), cypress: MAT(0xa7ae98), oleander: MAT(0xdedbd0), shrub0: MAT(0xc7cab6), shrub1: MAT(0xc7cab6), lavender: MAT(0xe6e2dc), hedge: MAT(0xbcc2aa) };
  const H0 = {}; for (const k in VG) { VG[k].computeBoundingBox(); H0[k] = VG[k].boundingBox.max.y; }
  const near = {}, far = {}, up = new THREE.Vector3(0, 1, 0);
  const put = (k, p, rot, sxz, sy, lod1 = false) => { if (!VG[k]) return; const m = new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(up, rot), new THREE.Vector3(sxz, sy, sxz)); ((lod1 && VG1[k]) ? far : near)[k] ||= [], ((lod1 && VG1[k]) ? far : near)[k].push(m); };
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // context trees from scene.json: olives stay olives; the old "broad" blobs become stone pines (70 %) and holm oaks
  SC.trees.forEach((t, i) => {
    const d = Math.hypot(t.x, t.y - 17), k = t.s === 'olive' ? 'olive' : hash(i) < .7 ? 'pine' : 'oak';
    const hs = k === 'pine' ? t.h * (.85 + .25 * hash(i + 7)) : k === 'oak' ? t.h * .75 : t.h;
    const s = hs / H0[k], j = .9 + .2 * hash(i + 3);
    put(k, B(t.x, t.y, t.z - .05), t.r, s * j, s, d > 75);
  });
  // the GLB's smooth "Cypress" columns (dark blobby flames) -> real 3D cypresses at the same spots (clusters of the merged mesh)
  const cyp = world.getObjectByName('Cypress');
  if (cyp && cyp.isMesh && VG.cypress) {
    cyp.updateMatrixWorld(true); const pa = cyp.geometry.attributes.position, v = new THREE.Vector3(), cl = [];
    for (let i = 0; i < pa.count; i += 3) { v.fromBufferAttribute(pa, i).applyMatrix4(cyp.matrixWorld);
      let c = cl.find((c) => Math.hypot(c.x - v.x, c.z - v.z) < 1.6); if (!c) cl.push(c = { x: v.x, z: v.z, y0: v.y, y1: v.y, n: 0, sx: 0, sz: 0 });
      c.y0 = Math.min(c.y0, v.y); c.y1 = Math.max(c.y1, v.y); c.n++; c.sx += v.x; c.sz += v.z; }
    cl.forEach((c, i) => { const h = c.y1 - c.y0, s = h / H0.cypress; put('cypress', new THREE.Vector3(c.sx / c.n, c.y0 - .05, c.sz / c.n), i * 1.9, s * .95, s); });
    cyp.visible = false; cyp.castShadow = false;
  }
  // gardens, pool and row ends: palms, oleanders, pittosporum, lavender/rosemary rows (heights snapped to the ground by raycast)
  const groundMeshes = []; world.traverse((o) => { if (o.isMesh && !/House_|Cypress|hedge|Sea/.test(o.name) && !/^[A-F]_/.test(o.name)) groundMeshes.push(o); });
  for (const id of IDS) for (const o of H[id].meshes) if (/_SITE_|_NOPOOL_/.test(o.name) || o.parent === H[id].SITE || o.parent === H[id].NOPOOL) groundMeshes.push(o);
  const rc = new THREE.Raycaster(), dn = new THREE.Vector3(0, -1, 0);
  const gz = (x, y, z) => { rc.set(B(x, y, z + 4), dn); rc.far = 12; const h = rc.intersectObjects(groundMeshes, false).find((h) => !h.object.userData.furniture && !/Umbrella|Pot|Cabinet|Teak|Cush|Leaf/.test(h.object.material.name || '')); return h ? h.point.y : z; };
  const at = (k, x, y, z, s, r = 0) => put(k, new THREE.Vector3(B(x, y, 0).x, gz(x, y, z) - .03, B(x, y, 0).z), r, s, s);
  IDS.forEach((id, n) => {
    const x0 = HX[id];
    [1.55, 2.35, 3.15, 3.95, 4.75].forEach((x, i) => at('lavender', x0 + x, 22.95, 2.96, .82 + .12 * hash(n * 9 + i), i * 1.3));   // lavender / rosemary row before the hedge
    at('oleander', x0 + 6.55, 19.25, 2.96, .95, n);          // oleander in the garden corner
    at(n % 2 ? 'shrub0' : 'shrub1', x0 + 6.55, 22.2, 2.96, 1.05, n * 2.3);   // pittosporum
  });
  [[-10.2, 29.6], [10.2, 29.6], [-10.2, 36.6]].forEach(([x, y], i) => at('palm', x, y, 2.9, .92 + .12 * hash(i), i * 1.7));   // Canary palms by the community pool
  for (let x = -22; x <= 22; x += 2.9) if (Math.abs(x) > 9) at(hash(x) < .5 ? 'oleander' : 'shrub0', x, 42.6, 2.9, 1.1, x);       // shrubs before the back hedge
  for (const [lst, lod] of [[near, 0], [far, 1]]) for (const [k, ms] of Object.entries(lst)) {
    const im = new THREE.InstancedMesh(lod ? VG1[k] : VG[k], mats[k], ms.length); ms.forEach((m, i) => im.setMatrixAt(i, m));
    im.castShadow = !lod && k !== 'lavender'; im.receiveShadow = !lod; im.computeBoundingSphere(); im.name = `Trees_${k}${lod ? '_lod1' : ''}`; scene.add(im);
  }
}

/* ---------------- plot highlight (gold outline + soft fill of the selected plot) ---------------- */
const plotMat = new THREE.MeshBasicMaterial({ color: 0xffc766, transparent: true, opacity: .32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, fog: false, toneMapped: false });
const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffd27a, fog: false, toneMapped: false });
const plots = {};
for (const id of IDS) {
  const g = new THREE.Group(); g.visible = false; scene.add(g);
  const x0 = HX[id] - (id === 'A' ? SC.WA : 0), x1 = HX[id] + W + (id === 'F' ? SC.WF : 0), YE = SC.YE;
  const fill = (xa, xb, ya, yb, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, yb - ya).rotateX(-Math.PI / 2), plotMat); m.position.copy(B((xa + xb) / 2, (ya + yb) / 2, z)); m.renderOrder = 2; g.add(m); };
  const edge = (xa, xb, ya, yb, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(.14, xb - xa), .08, Math.max(.14, yb - ya)), edgeMat); m.position.copy(B((xa + xb) / 2, (ya + yb) / 2, z)); g.add(m); };
  fill(x0, x1, .05, 5.45, .09); fill(HX[id], HX[id] + W, 16.02, YE, 3.03);
  if (id === 'A') fill(x0, HX[id], 5.5, 16.02, 3.0); if (id === 'F') fill(HX[id] + W, x1, 5.5, 16.02, 3.0);
  edge(x0, x1, -.07, .07, .12); edge(x0, x1, YE - .07, YE + .07, 3.05);
  for (const x of [x0, x1]) { edge(x - .07, x + .07, 0, 5.5, .12); edge(x - .07, x + .07, 5.5, YE, 3.05); }
  plots[id] = g;
}

/* ---------------- blueprint lines (used by the construction intro) ---------------- */
const lineMat = new THREE.LineBasicMaterial({ color: 0x9fd6ff, transparent: true, opacity: 0, fog: false, toneMapped: false, depthWrite: false });
const buildClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100), lineClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), -100);
lineMat.clippingPlanes = [lineClip];
const lines = [], edgeCache = new Map();
for (const id of IDS) for (const o of H[id].meshes) {
  if (!o.userData.level || o.userData.furniture || o.material === glassMat || o.name.includes('_shutter')) continue;
  if (!edgeCache.has(o.geometry)) edgeCache.set(o.geometry, new THREE.EdgesGeometry(o.geometry, 25));
  const l = new THREE.LineSegments(edgeCache.get(o.geometry), lineMat); l.visible = false; o.add(l); lines.push(l);
}
const grid = new THREE.GridHelper(260, 130, 0x4d7fb3, 0x24507f); grid.position.copy(B(-3, 14, .02)); grid.material.transparent = true; grid.material.opacity = 0; grid.visible = false; scene.add(grid);
function setBuildClip(on) {
  houseMats.forEach((m) => { m.clippingPlanes = on ? [buildClip] : null; m.needsUpdate = true; });
  glassMat.clippingPlanes = waterMat.clippingPlanes = on ? [buildClip] : null; glassMat.needsUpdate = waterMat.needsUpdate = true;
}

/* ---------------- state ---------------- */
const state = { phase: 'intro', mode: 'street', sel: 'C', time: 'day', pool: false, furn: true, shut: false, floor: 'all', view: 'aerial' };

/* ---------------- camera tweening ---------------- */
let tween = null;
function flyTo(pos, tgt, dur = 1.5, after) {
  tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: tgt.clone(), s: performance.now(), d: dur * 1000, after };
  controls.enabled = false;
}
function stepTween(now) {
  if (!tween) return;
  const k = ease(clamp01((now - tween.s) / tween.d));
  camera.position.lerpVectors(tween.p0, tween.p1, k); controls.target.lerpVectors(tween.t0, tween.t1, k);
  if (k >= 1) { const a = tween.after; tween = null; controls.enabled = true; a && a(); }
}
function outdoorControls() { Object.assign(controls, { minDistance: 3, maxDistance: 320, enablePan: true, maxPolarAngle: Math.PI * .495, minPolarAngle: 0, rotateSpeed: 1 }); }
function indoorControls() { Object.assign(controls, { minDistance: .2, maxDistance: 1.6, enablePan: false, maxPolarAngle: Math.PI * .8, minPolarAngle: Math.PI * .2, rotateSpeed: -.45 }); }

/* ---------------- views ---------------- */
const hx = () => HX[state.sel];
const VIEWS = {
  aerial: () => [B(42, -44, 30), B(-3, 13, 3)],
  street: () => [B(hx() + 9.5, -8.6, 1.65), B(hx() + 2.2, 6.5, 3.9)],
  living: () => [B(hx() + 5.5, 8.2, 4.5), B(hx() + 1.6, 15.6, 3.9), true],
  garden: () => [B(hx() + 5.9, 23.3, 4.4), B(hx() + 2.0, 16.0, 4.9)],
  bedroom: () => [B(hx() + 3.72, 15.5, 7.55), B(hx() + 1.2, 13.0, 6.75), true],
  pool: () => [B(11.5, 39.5, 4.6), B(-3, 30.5, 2.6)],
};
function goView(k, dur = 1.6) {
  if (state.mode === 'explode') exitExplode(false);
  state.view = k; let [p, t, inside] = VIEWS[k]();
  fovTarget = FOV[k] || 40; if (k !== 'aerial') { $('#card').hidden = true; document.body.classList.remove('carded'); }
  if (k === 'garden' && !state.pool) setPool(true);
  if (inside) { const dir = t.clone().sub(p).normalize(); t = p.clone().addScaledVector(dir, .6); }
  state.inside = !!inside; document.body.classList.toggle('inside', state.inside);
  outdoorControls(); flyTo(p, t, dur, () => { if (inside) indoorControls(); });
  hint(inside ? L().hintIn : k === 'aerial' ? L().hintPick : '');
  document.querySelectorAll('#views button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === k));
}

/* ---------------- selection ---------------- */
const fmt = (n) => n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB');
function select(id, fly = true) {
  state.sel = id;
  IDS.forEach((k) => { plots[k].visible = k === id; });
  document.querySelectorAll('#units button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.u === id));
  pins.forEach((p) => p.el.classList.toggle('on', p.id === id));
  applyPool();
  showCard(id);
  if (fly && state.mode === 'street') {
    fovTarget = 40;
    const c = HX[id] + W / 2;
    flyTo(B(c + 14, -22, 17), B(c, 12, 4.5), 1.3);
    document.querySelectorAll('#views button').forEach((b) => b.setAttribute('aria-pressed', false)); state.inside = false; document.body.classList.remove('inside'); outdoorControls();
  }
}
function showCard(id) {
  const u = UNITS.find((x) => x.id === id), t = L();
  $('#cLv').textContent = t.unitLv; $('#cH').textContent = `${t.house} ${id}`;
  $('#cPrice').innerHTML = `${fmt(u.price)} € <small>${t.vat}</small>`;
  $('#cBuilt').textContent = `${u.built} m²`; $('#cExt').textContent = `${u.exterior} m²`; $('#cPlot').textContent = `${u.plot} m²`;
  $('#cRooms').textContent = t.rooms; $('#cStatus').textContent = '● ' + (t.status[u.status] || u.status);
  $('#cMail').href = mailto(`${t.mailS} · ${t.house} ${id}`);
  $('#card').hidden = false; document.body.classList.add('carded');
}
function mailto(subject) { return `mailto:${PROMO.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(L().mailB)}`; }

/* ---------------- toggles ---------------- */
function applyPool() { IDS.forEach((k) => { const on = state.pool && k === state.sel; H[k].POOL.visible = on; H[k].NOPOOL.visible = !on; }); }
function setPool(v) { state.pool = v; applyPool(); syncToggles(); }
function setFurn(v) { state.furn = v; furniture.forEach((o) => o.visible = v); syncToggles(); }
let shutK = 0;
function setShut(v) { state.shut = v; syncToggles(); }
function syncToggles() {
  const m = { time: state.time === 'sunset', pool: state.pool, furn: state.furn, shut: state.shut };
  document.querySelectorAll('#toggles button').forEach((b) => b.setAttribute('aria-pressed', !!m[b.dataset.t]));
}
$('#toggles').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  ({ time: () => setTime(state.time === 'day' ? 'sunset' : 'day'), pool: () => setPool(!state.pool), furn: () => setFurn(!state.furn), shut: () => setShut(!state.shut) })[b.dataset.t]();
});

/* ---------------- explode by floor (cutaway with poché) ---------------- */
const cutPlanes = { L0: new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.5), L1: new THREE.Plane(new THREE.Vector3(0, -1, 0), 4.5), L2: new THREE.Plane(new THREE.Vector3(0, -1, 0), 7.5) };
const GAP = { L0: 0, L1: 4.6, L2: 9.2, RF: 14 };
let explodeK = 0, explodeTarget = 0;
const cutCache = new Map();
function cutMaterial(m, lv) {
  const key = m.uuid + lv; if (cutCache.has(key)) return cutCache.get(key);
  const c = m.clone(); c.clippingPlanes = [cutPlanes[lv]]; c.clipShadows = true; c.side = THREE.DoubleSide;
  const base = m.onBeforeCompile; c.onBeforeCompile = (sh, r) => { base.call(c, sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n if (!gl_FrontFacing) gl_FragColor = vec4(0.13, 0.15, 0.17, 1.0);'); };
  c.customProgramCacheKey = () => 'poche' + (m.userData.prog || ''); cutCache.set(key, c); return c;
}
function enterExplode(id = state.sel) {
  if (state.mode === 'explode') return;
  state.mode = 'explode'; state.inside = false; document.body.classList.remove('inside'); document.body.classList.add('explode'); $('#card').hidden = true; document.body.classList.remove('carded');
  select(id, false); $('#card').hidden = true; document.body.classList.remove('carded'); $('#flT').textContent = `${L().house} ${id}`;
  for (const k of IDS) for (const lv of ['L1', 'L2', 'RF']) if (k !== id) H[k][lv].visible = false;
  H[id].RF.visible = false; shutters.forEach((s) => { if (s.userData.house === id) s.visible = false; });
  for (const o of H[id].meshes) if (o.userData.level && o.userData.level !== 'RF') { o.userData.orig = o.material; o.material = cutMaterial(o.material, o.userData.level); }
  fovTarget = 40; explodeTarget = 1; setFloor('all');
  hint(L().hintEx);
}
function exitExplode(fly = true) {
  if (state.mode !== 'explode') return;
  state.mode = 'street'; document.body.classList.remove('explode'); explodeTarget = 0; explodeK = 0; applyExplode();
  for (const k of IDS) for (const lv of LEVELS) H[k][lv].visible = true;
  shutters.forEach((s) => s.visible = true);
  for (const k of IDS) for (const o of H[k].meshes) if (o.userData.orig) { o.material = o.userData.orig; delete o.userData.orig; }
  state.floor = 'all';
  if (fly) { select(state.sel, true); }
}
function setFloor(f) {
  state.floor = f; const id = state.sel, c = HX[id] + W / 2;
  document.querySelectorAll('#floors button[data-f]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === f));
  for (const lv of ['L0', 'L1', 'L2']) H[id][lv].visible = f === 'all' || f === lv;
  outdoorControls();
  if (f === 'all') flyTo(B(c + 19, -17, 27), B(c, 11.5, 8.5), 1.4);
  else { const y = LEVEL_Y[f] + GAP[f]; flyTo(B(c + 7.5, 1.5, y + 13.5), B(c, 12, y), 1.3); }
}
function applyExplode() {
  const e = ease(explodeK);
  for (const id of IDS) for (const lv of LEVELS) H[id][lv].position.y = id === state.sel ? GAP[lv] * e : 0;
  for (const lv of ['L0', 'L1', 'L2']) cutPlanes[lv].constant = LEVEL_Y[lv] + GAP[lv] * e + 1.55;
}

/* ---------------- labels: house pins + room labels ---------------- */
const labelsEl = $('#labels');
const pins = IDS.map((id) => {
  const el = document.createElement('div'); el.className = 'pin'; el.innerHTML = `<b>${id}</b>`; labelsEl.appendChild(el);
  el.addEventListener('click', (e) => { e.stopPropagation(); if (state.mode === 'street') select(id); });
  return { id, el, p: B(HX[id] + W / 2, 11.75, 10.7) };
});
const ROOMS = [
  ['L0', 'garaje', 2.9, 8.2, '≈ 30 m²'], ['L0', 'lav', 2.9, 11.75], ['L0', 'acceso', 6.4, 6.4], ['SITE', 'parking', 3.0, 2.6],
  ['L1', 'sala', 2.4, 9.5, '≈ 26 m²'], ['L1', 'cocina', 3.0, 13.9, '≈ 23 m²'], ['L1', 'bano', 6.4, 12.9], ['L1', 'tdel', 3.0, 6.5],
  ['SITE', 'tjar', 2.6, 17.3, '≈ 17 m²'], ['SITE', 'jardin', 3.0, 22.7],
  ['L2', 'ppal', 1.9, 14.3, '≈ 13 m²'], ['L2', 'vest', 4.55, 14.0, '≈ 4 m²'], ['L2', 'banop', 6.0, 14.7], ['L2', 'dorm', 1.6, 9.4, '≈ 12 m²'], ['L2', 'dorm', 4.55, 9.6, '≈ 12 m²'],
  ['L2', 'bano', 1.4, 11.95], ['L2', 'terraza', 2.3, 16.8],
].map(([lv, key, x, y, area]) => {
  const el = document.createElement('div'); el.className = 'lbl hidden' + (lv === 'SITE' ? ' out' : ''); labelsEl.appendChild(el);
  return { lv, key, x, y, area, el };
});
function labelText() { ROOMS.forEach((r) => r.el.innerHTML = L().rooms_[r.key] + (r.area ? `<small>${r.area}</small>` : '')); }
const v3 = new THREE.Vector3();
function project(p, el) {
  v3.copy(p).project(camera);
  const vis = v3.z < 1 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1;
  if (vis) el.style.transform = `translate(${((v3.x + 1) / 2 * innerWidth).toFixed(1)}px, ${((1 - v3.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%, -100%)`;
  return vis;
}
function updateLabels() {
  const street = state.mode === 'street' && state.phase === 'main' && !state.inside;
  for (const p of pins) { const v = project(p.p, p.el); p.el.classList.toggle('hidden', !(street && v && camera.position.y > 12 && camera.position.distanceTo(p.p) < 260)); }
  const ex = state.mode === 'explode' && explodeK > .6;
  for (const r of ROOMS) {
    const lvOk = r.lv === 'SITE' ? state.floor === 'all' || state.floor === 'L1' : state.floor === 'all' || state.floor === r.lv;
    let show = ex && lvOk;
    if (show) {
      const base = r.lv === 'SITE' ? (r.key === 'parking' ? .3 : 3.4) : LEVEL_Y[r.lv] + GAP[r.lv] * ease(explodeK) + 1.75;
      const p = B(HX[state.sel] + r.x, r.y, 0); p.y = base;
      show = project(p, r.el);
      if (show) r.el.style.transform = r.el.style.transform.replace('translate(-50%, -100%)', 'translate(-50%, -50%)');
    }
    r.el.classList.toggle('hidden', !show);
  }
}

/* ---------------- picking ---------------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY, performance.now()]; stopAuto(); });
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6 || state.mode !== 'street' || state.phase !== 'main' || state.inside) return;
  const id = pick(e); if (id) select(id);
});
let hoverT = 0;
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || state.mode !== 'street' || state.phase !== 'main' || performance.now() - hoverT < 60) return; hoverT = performance.now();
  canvas.style.cursor = !state.inside && pick(e) ? 'pointer' : '';
});
function pick(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickables, false).find((h) => h.object.visible);
  return hit ? hit.object.userData.house : null;
}

/* ---------------- UI wiring ---------------- */
function buildUnits() {
  $('#units').innerHTML = UNITS.map((u) => `<button data-u="${u.id}" aria-pressed="${u.id === state.sel}"><b>${u.id}</b><span><i></i>${Math.round(u.price / 1000)}k €</span></button>`).join('');
}
$('#units').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { if (state.mode === 'explode') exitExplode(false); select(b.dataset.u); } });
function buildViews() { $('#views').innerHTML = Object.keys(VIEWS).map((k) => `<button data-v="${k}" aria-pressed="${state.view === k && state.phase === 'main'}">${L().views[k]}</button>`).join(''); }
$('#views').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) goView(b.dataset.v); });
$('#cardX').addEventListener('click', () => { $('#card').hidden = true; document.body.classList.remove('carded'); });
$('#cEnter').addEventListener('click', () => enterExplode(state.sel));
$('#exitEx').addEventListener('click', () => exitExplode(true));
$('#replay').addEventListener('click', () => { exitExplode(false); startIntro(true); });
document.querySelectorAll('#floors button[data-f]').forEach((b) => b.addEventListener('click', () => setFloor(b.dataset.f)));
$('#toLiving').addEventListener('click', () => goView('living'));
$('#toBed').addEventListener('click', () => goView('bedroom'));
$('#btnVideo').addEventListener('click', () => { $('#videoModal').hidden = false; const v = $('#vid'); v.currentTime = 0; v.play().catch(() => {}); });
const closeVideo = () => { $('#videoModal').hidden = true; $('#vid').pause(); };
$('#videoX').addEventListener('click', closeVideo); $('#videoModal').addEventListener('click', (e) => { if (e.target.id === 'videoModal') closeVideo(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeVideo(); if (state.mode === 'explode') exitExplode(true); } });
document.querySelectorAll('#langs button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
let hintTimer;
function hint(s) { const h = $('#hint'); clearTimeout(hintTimer); if (!s) { h.classList.add('hidden'); return; } h.textContent = s; h.classList.remove('hidden'); hintTimer = setTimeout(() => h.classList.add('hidden'), 4200); }
function setLang(l) {
  lang = l; document.documentElement.lang = l;
  document.querySelectorAll('#langs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === l));
  document.querySelectorAll('[data-i]').forEach((el) => { const v = TXT[l][el.dataset.i]; if (typeof v === 'string') el.textContent = v; });
  $('#facts').innerHTML = TXT[l].facts(PROMO); $('#cta').href = mailto(TXT[l].mailS);
  buildViews(); labelText(); if (!$('#card').hidden) showCard(state.sel); $('#flT').textContent = `${TXT[l].house} ${state.sel}`;
  if (state.phase === 'intro' && storyIdx >= 0) storyText(storyIdx, true);
}

/* ---------------- intro: blueprint -> construction floor by floor -> finished ---------------- */
const nonHouse = [];
world.children.forEach((o) => { if (!/^House_/.test(o.name)) nonHouse.push(o); });
scene.children.forEach((o) => { if (/^Trees_/.test(o.name) || o.parent === scene && o.isInstancedMesh) nonHouse.push(o); });
let intro = null, storyIdx = -1;
const STORY_T = [0, 3.2, 5.2, 7.2, 9.4], INTRO_LEN = 11.5;
function storyText(i, force) {
  if (i === storyIdx && !force) return; storyIdx = i; const s = L().story[i], card = $('#story .card');
  card.style.opacity = 0; card.style.transform = 'translateY(10px)';
  setTimeout(() => { $('#stK').textContent = s[0]; $('#stH').textContent = s[1]; $('#stP').textContent = s[2]; card.style.opacity = 1; card.style.transform = 'none'; }, force ? 0 : 260);
}
function startIntro(replay = false) {
  state.phase = 'intro'; document.body.classList.add('intro'); $('#card').hidden = true; document.body.classList.remove('carded'); hint('');
  if (state.mode === 'explode') exitExplode(false);
  state.inside = false; outdoorControls(); controls.enabled = false; tween = null;
  intro = { s: performance.now(), replay }; storyIdx = -1;
  setBuildClip(true); lines.forEach((l) => l.visible = true); grid.visible = true;
  IDS.forEach((k) => plots[k].visible = false);
}
function endIntro() {
  if (!intro) return; intro = null; state.phase = 'main'; document.body.classList.remove('intro');
  setBuildClip(false); lines.forEach((l) => l.visible = false); grid.visible = false; nonHouse.forEach((o) => o.visible = true);
  loadSky(state.time).then(({ bg }) => { scene.background = bg; }); scene.fog.far = 7000;
  controls.enabled = true; buildViews(); select(state.sel, false);
  goView('aerial', 1.2); setTimeout(() => hint(L().hintPick), 1300);
}
function stepIntro(now) {
  const t = (now - intro.s) / 1000;
  storyText(STORY_T.reduce((a, v, i) => t >= v ? i : a, 0));
  $('#storybar i').style.width = (clamp01(t / INTRO_LEN) * 100).toFixed(1) + '%';
  // phase 1 (0 - 2.6 s): blueprint lines on navy; phase 2: world fades in and floors rise one by one
  const blue = t < 2.6;
  state.phase = blue ? 'blueprint' : 'intro';
  nonHouse.forEach((o) => o.visible = !blue);
  if (blue) { scene.background = new THREE.Color(0x0c2341); scene.fog.far = 1e6; }
  else if (!(scene.background && scene.background.isTexture)) { loadSky(state.time).then(({ bg }) => { if (intro) scene.background = bg; }); scene.fog.far = 7000; }
  lineMat.opacity = blue ? clamp01(t / 1.2) * .95 : .95 * (1 - clamp01((t - 9.2) / 1.6));
  grid.material.opacity = blue ? clamp01(t / 1.2) * .5 : 0; grid.visible = blue;
  // clip height: rises floor by floor with short holds
  const keys = [[0, -1], [2.6, -.5], [3.6, 3.0], [4.9, 3.0], [5.6, 6.0], [6.9, 6.0], [7.6, 9.0], [8.6, 9.0], [9.4, 13]];
  let h = -1; for (let i = 0; i < keys.length - 1; i++) { const [ta, ha] = keys[i], [tb, hb] = keys[i + 1]; if (t >= ta && t <= tb) h = ha + (hb - ha) * ease((t - ta) / (tb - ta)); } if (t > 9.4) h = 13;
  buildClip.constant = h; lineClip.constant = -h;
  // camera: slow orbit around the row
  const a = -.95 + t * .055, r = 70 - t * 2.2, c = B(-2, 13, 3);
  camera.position.set(c.x + Math.sin(a) * r, 26 + 14 * (1 - clamp01(t / INTRO_LEN)), c.z + Math.cos(a) * r); controls.target.copy(c); camera.lookAt(c);
  if (t > INTRO_LEN) endIntro();
}
function stopAuto() {}
$('#skip').addEventListener('click', () => endIntro());

/* ---------------- loop ---------------- */
function frame(now) {
  requestAnimationFrame(frame);
  if (intro) stepIntro(now); else { stepTween(now); controls.update(); }
  const fw = Math.min(80, baseFov()); if (Math.abs(camera.fov - fw) > .05) { camera.fov += (fw - camera.fov) * .08; camera.updateProjectionMatrix(); }
  // explode easing
  if (explodeK !== explodeTarget) { explodeK += (explodeTarget - explodeK) * .08; if (Math.abs(explodeTarget - explodeK) < .002) explodeK = explodeTarget; applyExplode(); }
  // shutters roll
  const sk = state.shut ? 1 : 0; if (shutK !== sk) { shutK += (sk - shutK) * .1; if (Math.abs(sk - shutK) < .003) shutK = sk; shutters.forEach((s) => s.scale.y = .04 + .96 * shutK); }
  // warm lamps follow the selected house
  warm.forEach((l) => { const p = l.userData.p; l.position.copy(B(HX[state.sel] + p[0], p[1], p[2])); });
  if (plots[state.sel].visible) plotMat.opacity = .22 + .12 * Math.sin(now / 400);
  renderer.render(scene, camera);
  updateLabels();
}

/* ---------------- boot ---------------- */
buildUnits(); setLang(lang); syncToggles(); applyPool();
await setTime(Q.get('time') === 'sunset' ? 'sunset' : 'day');
camera.position.copy(B(42, -44, 30)); controls.target.copy(B(-3, 13, 3));
if (Q.get('house') && IDS.includes(Q.get('house').toUpperCase())) state.sel = Q.get('house').toUpperCase();
requestAnimationFrame(frame);
$('#loading').classList.add('done');
if (Q.has('nointro')) {
  state.phase = 'main'; document.body.classList.remove('intro'); buildViews(); select(state.sel, false);
  const v = Q.get('view'); if (v && VIEWS[v]) goView(v, .01); else goView('aerial', .01);
  if (Q.get('pool') === '1') setPool(true); if (Q.get('shut') === '1') setShut(true); if (Q.get('furn') === '0') setFurn(false);
  if (Q.get('explode')) { enterExplode(state.sel); const f = Q.get('floor'); if (f) setFloor(f); }
  if (Q.get('card') === '0') { $('#card').hidden = true; document.body.classList.remove('carded'); }
} else startIntro();
window.__app = { state, goView, select, enterExplode, exitExplode, setFloor, setTime, setPool, setShut, setFurn, endIntro, camera, controls, scene, renderer };
