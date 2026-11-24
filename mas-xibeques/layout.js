// Mas Xibeques · "Tu fin de semana de boda" layout logic, shared by the web tour (index.html) and the Cycles
// renders (tools/layouts.mjs). Pure math, no three.js. three.js world metres: x east, y up, z south.
// Item = [x, y, z, rotY, sx, sy, sz].
// FACTS (masxibeques.es): sala polivalente 60 seated / 80 standing; 22 beds in the masía + 2 apartments x 4 = 30.
// ESTIMATES: positions and sizes of every zone, pergola capacity, carpa size and capacity.

export const FACTS = { salaSeated: 60, salaStanding: 80, bedsHouse: 22, bedsApts: 8, bedsTotal: 30, rooms: 8, apts: 2 };
export const ZONES = {
  pergola: { x: -25, z: 5.5, W: 16.6, D: 8.2, label: 'pergola' },   // cane pergola west of the house
  sala:    { x: -26, z: -14.5, W: 15.4, D: 8.6, label: 'sala' },    // sala polivalente (covered, 60 seated)
  carpa:   { x: 40, z: -30, W: 14.2, D: 29, label: 'carpa' },       // marquee on the tennis court (estimate)
  aperitivo: { x: 17, z: 33, W: 18, D: 9 },                         // pool lawn
  brunch:  { x: 17, z: 32, W: 18, D: 8 },
};
export const CEREMONY = { x: -44, z: 25.6 };   // clearing in the orchard, arch at the north end, guests face north
export const GUESTS = { min: 20, max: 180, step: 10, def: 90 };
export const STEPS = ['fri', 'cer', 'ape', 'ban', 'dance', 'sun'];
export const STEP_DAY = { fri: 'fri', cer: 'sat', ape: 'sat', ban: 'sat', dance: 'sat', sun: 'sun' };

let seed = 1;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const I = (x, y, z, r = 0, sx = 1, sy = 1, sz = 1) => [x, y, z, r, sx, sy, sz];
const r3 = (v) => Math.round(v * 1000) / 1000;

/** Where the Saturday banquet goes: up to the sala capacity -> pergola (or the sala if it rains); above -> carpa. */
export const banquetSpace = (guests, rain) => guests > FACTS.salaSeated ? 'carpa' : (rain ? 'sala' : 'pergola');
export const stayGuests = (guests) => Math.min(guests, FACTS.bedsTotal);
export const danceSide = (G) => Math.max(4.5, Math.min(8, Math.round(Math.sqrt(G) * .55 * 2) / 2));

function gridFit(n, W, D, sx, sz) {
  let best = null;
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c), w = (c - 1) * sx + 3.1, d = (r - 1) * sz + 3.1, over = Math.max(0, w - W) + Math.max(0, d - D);
    const score = over * 100 + Math.abs(Math.log((w / d) / (W / D)));
    if (!best || score < best.score) best = { c, r, score, over, w, d };
  }
  const pts = [];
  for (let i = 0; i < n; i++) { const r = Math.floor(i / best.c), c = i % best.c, inRow = r === best.r - 1 ? n - r * best.c : best.c; pts.push({ x: (c - (inRow - 1) / 2) * sx, z: (r - (best.r - 1) / 2) * sz }); }
  return { pts, w: best.w, d: best.d, over: best.over };
}

/** imperial rows along x, centred at (ax, cz0), rows spaced in z */
function imperial(o, G, ax, cz0, rows, pitch, decor = true) {
  let left = G; const out = [];
  for (let r = 0; r < rows; r++) {
    const s = Math.min(left, Math.ceil(left / (rows - r))); left -= s; const a = Math.ceil(s / 2), b = s - a, Lr = a * .6 + .4;
    const cz = cz0 + (r - (rows - 1) / 2) * pitch, k = Math.max(1, Math.ceil(Lr / 6.4)), seg = Lr / k;
    for (let j = 0; j < k; j++) o.long.push(I(ax - Lr / 2 + seg * (j + .5), 0, cz, 0, seg / 6.4, 1, 1));
    if (decor) {
      for (let x = -Lr / 2 + .7; x <= Lr / 2 - .7; x += 1) o.garlands.push(I(ax + x, 0, cz, rnd() < .5 ? 0 : Math.PI));
      for (let x = -Lr / 2 + .6; x < Lr / 2 - .3; x += .9) { o.candles.push(I(ax + x, .85, cz)); o.flowers.push(I(ax + x + .45, .8, cz + (rnd() - .5) * .08, 0, .09, .07, .09)); }
    }
    for (const [cnt, sg] of [[a, 1], [b, -1]]) for (let q = 0; q < cnt; q++) { const x = ax + (q - (cnt - 1) / 2) * .6;
      o.chairs.push(I(x, 0, cz + sg * .86, sg > 0 ? 0 : Math.PI)); o.plates.push(I(x, .753, cz + sg * .32)); o.glasses.push(I(x + .16, .753, cz + sg * .14)); }
    out.push({ L: Lr, z: cz });
  }
  return out;
}

function rounds(o, G, ax, az, W, D, per = 10) {
  const n = Math.ceil(G / per); const fit = gridFit(n, W, D, 3.6, 3.6); o.tables = n; o.overflow = Math.max(o.overflow, fit.over);
  fit.pts.forEach((p, i) => {
    const cx = ax + p.x, cz = az + p.z, s = Math.floor(G / n) + (i < G % n ? 1 : 0), off = rnd() * 6;
    o.round.push(I(cx, 0, cz, off)); o.centers.push(I(cx, .752, cz, off));
    for (let k = 0; k < 3; k++) { const a = off + k * 2.09; o.candles.push(I(cx + Math.sin(a) * .36, .83, cz + Math.cos(a) * .36)); }
    for (let k = 0; k < s; k++) { const a = off + k / s * 6.283, sn = Math.sin(a), cs = Math.cos(a);
      o.chairs.push(I(cx + sn * 1.3, 0, cz + cs * 1.3, a)); o.plates.push(I(cx + sn * .68, .753, cz + cs * .68)); o.glasses.push(I(cx + Math.sin(a + .22) * .5, .753, cz + Math.cos(a + .22) * .5)); }
  });
  return fit;
}

/** state: { guests, day: 'fri'|'sat'|'sun', rain } -> everything that is set up on that day */
export function computeLayout(state) {
  seed = 99;
  const G = state.guests, day = state.day || 'sat';
  const o = { chairs: [], round: [], long: [], plates: [], glasses: [], candles: [], centers: [], garlands: [], flowers: [], high: [], bars: [], umbrellas: [],
    cerChairs: [], arch: [], aisle: null, petals: [], dance: null, bulbs: [], wire: [], poles: [], tables: 0, overflow: 0,
    banquet: null, carpa: false, area: null, dinner: 0 };
  const V = (x, y, z) => ({ x, y, z });
  const fest = (a, b, sag, step = .7) => { const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / step)); let prev = null;
    for (let i = 0; i <= n; i++) { const t = i / n, p = V(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - sag * 4 * t * (1 - t), a.z + (b.z - a.z) * t);
      if (prev) o.wire.push(r3(prev.x), r3(prev.y), r3(prev.z), r3(p.x), r3(p.y), r3(p.z)); if (i && i < n) o.bulbs.push(I(r3(p.x), r3(p.y - .07), r3(p.z))); prev = p; } };
  const pergolaFestoons = () => {   // zig-zag under the cane roof, between the two lines of posts (z 1 / z 10)
    const xs = [-34, -29.5, -25, -20.5, -16];
    xs.forEach((x, i) => { if (i) { fest(V(xs[i - 1], 2.85, 1.15), V(x, 2.85, 9.85), .55); fest(V(xs[i - 1], 2.85, 9.85), V(x, 2.85, 1.15), .55); } });
    fest(V(-34, 2.9, 1.15), V(-16, 2.9, 1.15), .3); fest(V(-34, 2.9, 9.85), V(-16, 2.9, 9.85), .3);
  };
  // porch festoon along the beam of the timber-and-cane porch (always on)
  fest(V(-7.5, 2.85, 10.9), V(7.5, 2.85, 10.9), .35, .6);

  if (day === 'fri') {             // welcome dinner under the pergola for the guests staying the weekend
    const n = stayGuests(G); const Z = ZONES.pergola; o.dinner = n;
    const rows = n > 30 ? 2 : 1; imperial(o, n, Z.x, Z.z, rows, 3.6); o.tables = rows; o.banquet = 'pergola';
    pergolaFestoons(); o.area = { x: Z.x, z: Z.z, w: 12, d: 6 };
  }
  if (day === 'sat') {
    const sp = banquetSpace(G, state.rain); o.banquet = sp; o.carpa = sp === 'carpa'; o.dinner = G;
    if (sp === 'pergola') {           // up to 60: two imperial rows under the cane, dance floor at the west end
      const Z = ZONES.pergola, d = 5; o.dance = { x: Z.x - Z.W / 2 + d / 2 + .2, z: Z.z, s: d };
      const ax = Z.x + (d + .6) / 2, rows = G > 30 ? 2 : 1; imperial(o, G, ax, Z.z, rows, 3.7); o.tables = rows;
      o.area = { x: ax, z: Z.z, w: Z.W - d, d: Z.D }; pergolaFestoons();
    } else if (sp === 'sala') {        // rain plan: the sala polivalente, round tables (60 seated)
      const Z = ZONES.sala; const fit = rounds(o, G, Z.x, Z.z, Z.W, Z.D); o.area = { x: Z.x, z: Z.z, w: fit.w, d: fit.d };
    } else {                           // carpa on the tennis court: round tables + dance floor at the north end
      const Z = ZONES.carpa, d = danceSide(G); o.dance = { x: Z.x, z: r3(Z.z - Z.D / 2 + d / 2 + .5), s: d };
      const D = Z.D - d - 1.2, az = Z.z + (d + 1.2) / 2; const fit = rounds(o, G, Z.x, az, Z.W, D); o.area = { x: Z.x, z: az, w: fit.w, d: fit.d };
      for (let k = 0; k < 4; k++) { const x = Z.x - 5.4 + k * 3.6; fest(V(x, 4.3, Z.z - Z.D / 2 + .4), V(x, 4.3, Z.z + Z.D / 2 - .4), .5, .8); }
    }
    // ceremony among the fruit trees
    const C = CEREMONY, side = 7, rows = Math.ceil(G / (side * 2));
    o.arch.push(I(C.x, 0, C.z));
    for (let i = 0; i < G; i++) { const r = Math.floor(i / (side * 2)), c = i % (side * 2), s = c < side ? -1 : 1, k = c % side; o.cerChairs.push(I(C.x + s * (1.1 + k * .5), 0, C.z + 3.5 + r * .95, 0)); }
    o.aisle = { x: C.x, z: C.z + 1.2 + (rows * .95 + 3) / 2, w: 1.5, d: rows * .95 + 3 };
    for (let r = 0; r < rows; r += 2) for (const s of [-1, 1]) o.petals.push(I(C.x + s * .85, .22, C.z + 3.3 + r * .95, 0, .16, .2, .16));
    // aperitivo on the pool lawn: high tables (1 per ~10 guests) + bar
    const A = ZONES.aperitivo, nh = Math.max(3, Math.ceil(G / 10)), cols = Math.ceil(Math.sqrt(nh * 2));
    for (let i = 0; i < nh; i++) { const c = i % cols, r = Math.floor(i / cols); o.high.push(I(r3(A.x - A.W / 2 + 2 + c * (A.W - 4) / Math.max(1, cols - 1) + (r % 2) * 1.1), 0, r3(A.z - 1.5 + r * 2.8 + (rnd() - .5) * .6), rnd() * 6)); }
    o.bars.push(I(A.x, 0, A.z + A.D / 2 + .6, Math.PI));
  }
  if (day === 'sun') {             // pool brunch for the guests who stayed
    const n = stayGuests(G), Z = ZONES.brunch; o.dinner = n;
    const rows = n > 30 ? 2 : 1, R = imperial(o, n, Z.x, Z.z, rows, 3.4, false); o.tables = rows;
    for (const row of R) for (let x = -row.L / 2 + 1.6; x < row.L / 2; x += 3.2) o.umbrellas.push(I(r3(Z.x + x), 0, r3(row.z)));
    o.area = { x: Z.x, z: Z.z, w: 10, d: 4 };
  }
  o.chairCount = o.chairs.length; o.cerCount = o.cerChairs.length;
  return o;
}
