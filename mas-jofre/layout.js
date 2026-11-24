// Mas Jofre · event layout logic shared by the web tour (index.html) and the Cycles renders (tools/layouts.mjs).
// Pure math, no three.js. Coordinates are three.js world units (metres): x east, y up, z south.
// Item = [x, y, z, rotY, sx, sy, sz]. All zone sizes/capacities are ESTIMATES (not published by the venue).

export const ZONES = {
  jardin: { x: 2, z: 24, W: 38, D: 26, cap: 200 },        // jardín exterior, lawn south of the patio wall
  patio:  { x: 2.3, z: -6.1, W: 19.4, D: 12, cap: 120 },  // jardín interior between El Mas, the tower and La Pahissa
  sala:   { x: 0, z: -20, W: 17.4, D: 9.6, cap: 80 },    // Sala grande, ground floor of El Mas (rain plan)
};
export const CEREMONY = { x: 38, z: -16 };       // east lawn, guests face north towards the Montgrí
export const GUESTS = { min: 40, max: 200, step: 10 };

let seed = 1;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const I = (x, y, z, r = 0, sx = 1, sy = 1, sz = 1) => [x, y, z, r, sx, sy, sz];
const r3 = (v) => Math.round(v * 1000) / 1000;

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

export const danceSide = (G) => Math.max(4.5, Math.min(8, Math.round(Math.sqrt(G) * .55 * 2) / 2));

/** state: { guests, space, style: 'imperial'|'round', ceremony, dance, festoons } */
export function computeLayout(state) {
  seed = 99;
  const Z = ZONES[state.space], G = state.guests;
  const o = { chairs: [], round: [], long: [], plates: [], glasses: [], candles: [], centers: [], garlands: [], flowers: [],
    cerChairs: [], arch: [], aisle: null, petals: [], dance: null, bulbs: [], wire: [], poles: [], tables: 0, overflow: 0, area: { x: Z.x, z: Z.z, w: 0, d: 0 } };
  // dance floor at the east end of the space; tables use the rest
  let ax = Z.x, aw = Z.W;
  if (state.dance) { const d = danceSide(G); o.dance = { x: r3(Z.x + Z.W / 2 - d / 2), z: Z.z, s: d }; aw = Z.W - d - 1.0; ax = Z.x - (d + 1.0) / 2; }
  if (state.style === 'round') {
    const n = Math.ceil(G / 10); const fit = gridFit(n, aw, Z.D, 3.6, 3.6); o.tables = n; o.overflow = fit.over;
    o.area = { x: ax, z: Z.z, w: fit.w, d: fit.d };
    fit.pts.forEach((p, i) => {
      const cx = ax + p.x, cz = Z.z + p.z, s = Math.floor(G / n) + (i < G % n ? 1 : 0), off = rnd() * 6;
      o.round.push(I(cx, 0, cz, off)); o.centers.push(I(cx, .752, cz, off));
      for (let k = 0; k < 3; k++) { const a = off + k * 2.09; o.candles.push(I(cx + Math.sin(a) * .36, .83, cz + Math.cos(a) * .36)); }
      for (let k = 0; k < s; k++) { const a = off + k / s * 6.283, sn = Math.sin(a), cs = Math.cos(a);
        o.chairs.push(I(cx + sn * 1.3, 0, cz + cs * 1.3, a)); o.plates.push(I(cx + sn * .68, .753, cz + cs * .68)); o.glasses.push(I(cx + Math.sin(a + .22) * .5, .753, cz + Math.cos(a + .22) * .5)); }
    });
  } else {
    // imperial: as few long rows as fit the width (their signature look); each row = joined 6.4 m cloth segments
    let rows = 1, per, L;
    for (; ; rows++) { per = Math.ceil(G / rows); L = Math.ceil(per / 2) * .6 + .4; if (L <= aw - .6 || rows > 12) break; }
    const pitch = Math.min(3.6, Math.max(3.1, (Z.D - .6) / Math.max(1, rows))), dd = (rows - 1) * pitch + 2.9;
    o.overflow = Math.max(0, L + .6 - aw) + Math.max(0, dd - Z.D); o.tables = rows; o.area = { x: ax, z: Z.z, w: L + .6, d: dd };
    let left = G;
    for (let r = 0; r < rows; r++) {
      const s = Math.min(left, Math.ceil(left / (rows - r))); left -= s; const a = Math.ceil(s / 2), b = s - a, Lr = Math.ceil(a) * .6 + .4;
      const cz = Z.z + (r - (rows - 1) / 2) * pitch, k = Math.max(1, Math.ceil(Lr / 6.4)), seg = Lr / k;
      for (let j = 0; j < k; j++) o.long.push(I(ax - Lr / 2 + seg * (j + .5), 0, cz, 0, seg / 6.4, 1, 1));
      for (let x = -Lr / 2 + .7; x <= Lr / 2 - .7; x += 1) o.garlands.push(I(ax + x, 0, cz, rnd() < .5 ? 0 : Math.PI));
      for (let x = -Lr / 2 + .6; x < Lr / 2 - .3; x += .9) { o.candles.push(I(ax + x, .85, cz)); o.flowers.push(I(ax + x + .45, .8, cz + (rnd() - .5) * .08, 0, .09, .07, .09)); }
      for (const [cnt, sg] of [[a, 1], [b, -1]]) for (let q = 0; q < cnt; q++) { const x = ax + (q - (cnt - 1) / 2) * .6;
        o.chairs.push(I(x, 0, cz + sg * .86, sg > 0 ? 0 : Math.PI)); o.plates.push(I(x, .753, cz + sg * .32)); o.glasses.push(I(x + .16, .753, cz + sg * .14)); }
    }
  }
  // ceremony on the east lawn (rows of 2 x 8 chairs, aisle in the middle)
  if (state.ceremony) {
    const C = CEREMONY, side = 8, rows = Math.ceil(G / (side * 2));
    o.arch.push(I(C.x, 0, C.z));
    for (let i = 0; i < G; i++) { const r = Math.floor(i / (side * 2)), c = i % (side * 2), s = c < side ? -1 : 1, k = c % side; o.cerChairs.push(I(C.x + s * (1.1 + k * .5), 0, C.z + 3.5 + r * .95, 0)); }
    o.aisle = { x: C.x, z: C.z + 1.2 + (rows * .95 + 3) / 2, w: 1.5, d: rows * .95 + 3 };
    for (let r = 0; r < rows; r += 2) for (const s of [-1, 1]) o.petals.push(I(C.x + s * .85, .22, C.z + 3.3 + r * .95, 0, .16, .2, .16));
  }
  // festoon lights (bulb positions + wire segments + poles)
  const V = (x, y, z) => ({ x, y, z });
  const fest = (a, b, sag, step = .7) => { const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / step)); let prev = null;
    for (let i = 0; i <= n; i++) { const t = i / n, p = V(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - sag * 4 * t * (1 - t), a.z + (b.z - a.z) * t);
      if (prev) o.wire.push(r3(prev.x), r3(prev.y), r3(prev.z), r3(p.x), r3(p.y), r3(p.z)); if (i && i < n) o.bulbs.push(I(r3(p.x), r3(p.y - .07), r3(p.z))); prev = p; } };
  if (state.festoons) {
    for (let i = 0; i < 4; i++) fest(V(26.3, 3.0, 1.6 - i * 4), V(26.3, 3.0, 1.6 - (i + 1) * 4 + (i === 3 ? .8 : 0)), .3);   // Pahissa porch beam
    if (state.space === 'jardin') {
      let x0 = Z.x - Z.W / 2 - .5, x1 = Z.x + Z.W / 2 + .5; const zN = Z.z - Z.D / 2 - .4, zS = Z.z + Z.D / 2 + .4, H = 4.6;
      const np = Math.max(3, Math.round((x1 - x0) / 6.5) + 1), xs = [...Array(np)].map((_, i) => x0 + i * (x1 - x0) / (np - 1));
      xs.forEach((x, i) => { o.poles.push(I(x, H / 2, zN, 0, .12, H, .12), I(x, H / 2, zS, 0, .12, H, .12));
        if (i) { fest(V(xs[i - 1], H, zN), V(x, H, zN), .35); fest(V(xs[i - 1], H, zS), V(x, H, zS), .35);
          fest(i % 2 ? V(xs[i - 1], H - .1, zN) : V(xs[i - 1], H - .1, zS), i % 2 ? V(x, H - .1, zS) : V(x, H - .1, zN), 1.4, .75); } });
      fest(V(x0, H - .1, zN), V(x0, H - .1, zS), 1.2, .75); fest(V(x1, H - .1, zN), V(x1, H - .1, zS), 1.2, .75);
    } else if (state.space === 'patio') {
      // zig-zag between the Mas facade and the south patio wall
      const xs = [-8.2, -4.4, -.6, 3.2, 7.0, 10.8], zN = -13.75, zS = 1.75;
      xs.forEach((x, i) => { if (i) fest(i % 2 ? V(xs[i - 1], 3.5, zN) : V(xs[i - 1], 2.75, zS), i % 2 ? V(x, 2.75, zS) : V(x, 3.5, zN), 1.0, .7); });
      fest(V(-9.3, 2.75, zS), V(13.9, 2.75, zS), .5, .7);
    }
  }
  o.chairCount = o.chairs.length; o.cerCount = o.cerChairs.length;
  return o;
}

/** Largest guest count (multiple of step) that fits a space with the given options. */
export function capacity(space, style, dance) {
  let best = 0;
  for (let g = GUESTS.min; g <= Math.min(GUESTS.max, ZONES[space].cap); g += GUESTS.step) { if (computeLayout({ guests: g, space, style, dance, ceremony: false, festoons: false }).overflow < .01) best = g; }
  return best;
}
