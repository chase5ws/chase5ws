// Pixel zoo: little animals stand on top of the taskbar and walk between the name and the clock.
// Walk past either end (over the buttons) and they fall off the bar, then drop back in from above.
// Mouse: click one to make it jump, or drag it around and throw it.
// The cast changes with the focused window (os.js fires "chaseos:active" with its id;
// null means the bare desktop): the old cast hops off, the new one drops in.
// With reduced motion they stand still.
(() => {
  const bar = document.querySelector(".taskbar");
  if (!bar) return;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const S = 3; // pixel scale

  // Sprites face right. "." is empty; other letters index the palette.
  // walk: rows shared by both frames + two leg variants. hop: bounces instead of stepping.
  const legs = (body, a, b) => [body.concat(a), body.concat(b)];
  const SPRITES = {
    cat: { pal: { o: "#f2a65a", d: "#c97a35", e: "#1b1b1b", p: "#f4a7b9" }, speed: 22, frames: legs([
      "........o..o",
      "........oooo",
      "o.......ooeo",
      "o.......ooop",
      ".oooooooooo.",
      ".oddoooooo..",
      ".oooooooo...",
    ], [".o.o...o.o..", ".o.o...o.o.."], ["..o.o...o.o.", "..o.o...o.o."]) },
    dog: { pal: { b: "#c8955c", d: "#7a5230", e: "#1b1b1b", n: "#1b1b1b" }, speed: 26, frames: legs([
      ".........dd...",
      "........bbbb..",
      "........bbeb..",
      "d.......bbbbbn",
      ".d......bbbb..",
      "..bbbbbbbbb...",
      "..bbdddbbbb...",
      "..bbbbbbbbb...",
    ], ["..b.b...b.b...", "..b.b...b.b..."], ["...b.b...b.b..", "...b.b...b.b.."]) },
    chick: { pal: { y: "#ffd84a", o: "#ff9a2e", e: "#1b1b1b" }, speed: 16, hop: true, frames: legs([
      "...yyy..",
      "..yyyey.",
      "..yyyyyo",
      "yyyyyyy.",
      "yyyyyyy.",
      ".yyyyy..",
    ], ["..o.o..."], ["...o.o.."]) },
    rabbit: { pal: { w: "#f1f1f1", p: "#f4a7b9", e: "#1b1b1b" }, speed: 30, hop: true, frames: legs([
      "......w.w.",
      "......p.p.",
      ".....wwww.",
      ".....wwew.",
      "w....wwwwp",
      "wwwwwwwww.",
      ".wwwwwwww.",
      ".wwwwwww..",
    ], [".ww...ww.."], ["..ww..ww.."]) },
    frog: { pal: { g: "#57c05a", l: "#a6e39a", e: "#1b1b1b" }, speed: 24, hop: true, frames: legs([
      "......ggg.",
      "....gggegg",
      "gggggggggg",
      "gllllllgg.",
      ".gggggggg.",
    ], ["gg....gg.."], [".gg..gg..."]) },
    penguin: { pal: { k: "#4a5568", w: "#f1f1f1", o: "#ff9a2e", e: "#1b1b1b" }, speed: 12, frames: legs([
      "..kkkk...",
      ".kkkkwek.",
      ".kkkkwwoo",
      "kkkwwww..",
      "kkkwwww..",
      "kkkwwww..",
      ".kkwwwk..",
      "..kkkk...",
    ], ["..oo.o..."], ["..o.oo..."]) },
    fox: { pal: { o: "#ff8a3d", w: "#f5efe6", k: "#3a2a20", e: "#1b1b1b" }, speed: 34, frames: legs([
      ".........o.o..",
      ".........ooo..",
      ".........ooeo.",
      "wo.......oowwk",
      ".oo.....oww...",
      "..oooooooo....",
      "..owwwwwoo....",
      "..oooooooo....",
    ], ["..k.k...k.k...", "..k.k...k.k..."], ["...k.k...k.k..", "...k.k...k.k.."]) },
    turtle: { pal: { s: "#8a6d3b", h: "#b38f4f", g: "#6abf69", e: "#1b1b1b" }, speed: 7, frames: legs([
      "...ssss.....",
      "..shhhhs....",
      ".shhsshhsgg.",
      ".sssssssgeg.",
      "ggggggggggg.",
    ], [".gg....gg..."], ["..gg....gg.."]) },
    owl: { pal: { b: "#9b6b43", w: "#e9d8b4", y: "#ffd84a", k: "#1b1b1b", o: "#ff9a2e" }, speed: 10, hop: true, frames: legs([
      ".b...b..",
      ".bbbbb..",
      "bykbykb.",
      "bbbobbb.",
      "bwwwwwb.",
      "bwwwwwb.",
      ".bwwwb..",
    ], ["..o.o..."], ["..o.o..."]) },
    bat: { pal: { d: "#7d6aa8", e: "#ff5a5a" }, speed: 40, fly: true, frames: [[
      "d.......d",
      "dd.d.d.dd",
      "ddddedddd",
      "..ddddd..",
      "...ddd...",
    ], [
      ".........",
      "...d.d...",
      "..ddedd..",
      "ddddddddd",
      "d..ddd..d",
    ]] },
    pig: { pal: { p: "#f7a8b8", d: "#d9778d", e: "#1b1b1b" }, speed: 18, frames: legs([
      "........d...",
      "......ppppp.",
      "......pppep.",
      "d.....ppppdd",
      ".pppppppppd.",
      ".ppppppppp..",
      ".ppppppppp..",
    ], [".d.d...d.d..", ".d.d...d.d.."], ["..d.d...d.d.", "..d.d...d.d."]) },
    sheep: { pal: { w: "#f3f1ea", k: "#3b3b45", e: "#f3f1ea" }, speed: 14, frames: legs([
      "..wwwwww....",
      ".wwwwwwwwkk.",
      "wwwwwwwwkkek",
      "wwwwwwwwwkkk",
      ".wwwwwwwww..",
      "..wwwwwww...",
    ], ["..k.k..k.k..", "..k.k..k.k.."], ["...k.k..k.k.", "...k.k..k.k."]) },
    duck: { pal: { w: "#f6f6f6", o: "#ff9a2e", e: "#1b1b1b" }, speed: 16, frames: legs([
      "......ww..",
      ".....wwew.",
      ".....wwwoo",
      "w....www..",
      "wwwwwwwww.",
      ".wwwwwwww.",
      "..wwwwww..",
    ], ["...o.o...."], ["....o.o..."]) },
    mouse: { pal: { g: "#a7adb8", p: "#f4a7b9", e: "#1b1b1b" }, speed: 46, frames: legs([
      "......gg...",
      ".....gggg..",
      ".....ggegg.",
      "p..ggggggp.",
      ".pgggggggg.",
      "..gggggg...",
    ], ["..p.p.p...."], ["...p.p.p..."]) },
    hedgehog: { pal: { b: "#7a5a3c", s: "#e2c39a", e: "#1b1b1b", k: "#1b1b1b" }, speed: 12, frames: legs([
      "..b.b.b.....",
      ".bbbbbbb....",
      "bbbbbbbbss..",
      "bbbbbbbssesk",
      "bbbbbbbssss.",
      ".bbbbbbbb...",
    ], ["..s.s..s.s..", "..s.s..s.s.."], ["...s.s..s.s.", "...s.s..s.s."]) },
    crab: { pal: { r: "#ff6b4a", k: "#1b1b1b" }, speed: 28, frames: legs([
      "r.......r",
      "rr.k.k.rr",
      ".rrrrrrr.",
      "rrrrrrrrr",
      ".rrrrrrr.",
    ], ["r.r...r.r"], [".r.r.r.r."]) },
  };

  // Which animals live in which window. Anything not listed gets four picked from its id.
  const CAST = {
    "": ["cat", "dog", "chick", "rabbit", "duck", "pig"],
    me: ["cat", "dog", "mouse", "duck", "sheep"],
    contact: ["owl", "chick", "duck", "mouse", "rabbit"],
    experience: ["turtle", "owl", "hedgehog", "sheep", "penguin"],
    roadmap: ["rabbit", "turtle", "rabbit", "turtle", "chick"],
    stats: ["penguin", "chick", "penguin", "owl", "mouse"],
    live: ["fox", "rabbit", "frog", "chick", "pig"],
    dev: ["turtle", "chick", "hedgehog", "mouse", "sheep"],
    "this-pc": ["penguin", "cat", "mouse", "duck"],
    doom: ["bat", "bat", "bat", "bat", "mouse", "mouse"],
    duel: ["fox", "frog", "crab", "duck", "hedgehog"],
    "asc-bot": ["cat", "owl", "dog", "mouse"],
    "asc-site": ["fox", "chick", "cat", "pig"],
    mbti: ["owl", "dog", "sheep", "fox"],
    wallpaper: ["penguin", "frog", "duck", "crab"],
  };
  const NAMES = Object.keys(SPRITES);
  const castOf = (id) => {
    if (CAST[id || ""]) return CAST[id || ""];
    let h = 0;
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return [0, 5, 10, 15].map((k) => NAMES[(h >>> k) % NAMES.length]);
  };

  // Pre-render every frame to a small canvas.
  const art = {};
  for (const [name, s] of Object.entries(SPRITES)) {
    art[name] = s.frames.map((rows) => {
      const c = document.createElement("canvas");
      c.width = Math.max(...rows.map((r) => r.length)) * S;
      c.height = rows.length * S;
      const g = c.getContext("2d");
      rows.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch === "." || !s.pal[ch]) return;
        g.fillStyle = s.pal[ch];
        g.fillRect(x * S, y * S, S, S);
      }));
      return c;
    });
  }

  const heart = (() => {
    const rows = [".rr.rr.", "rrrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."];
    const c = document.createElement("canvas");
    c.width = 7 * 2; c.height = 6 * 2;
    const g = c.getContext("2d");
    g.fillStyle = "#ff5c8a";
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "r") g.fillRect(x * 2, y * 2, 2, 2); }));
    return c;
  })();

  // The canvas covers the whole screen (it ignores the mouse itself), so an animal stays
  // visible wherever it is thrown; it stands on the bar's top edge and falls past the buttons.
  const canvas = document.createElement("canvas");
  canvas.className = "zoo";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, ground = 0, left = 0, right = 0;

  function resize() {
    const r = bar.getBoundingClientRect();
    const name = bar.querySelector(".tb-name"), clock = bar.querySelector(".clock");
    W = innerWidth;
    H = innerHeight;
    ground = r.top; // the bar's top edge, in canvas pixels
    left = name ? name.getBoundingClientRect().right + 4 : 0;
    right = clock ? clock.getBoundingClientRect().left - 4 : W;
    dpr = devicePixelRatio || 1;
    Object.assign(canvas.style, { width: `${W}px`, height: `${H}px` });
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  const GRAVITY = 1100;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  let animals = [], hearts = [], now = 0, drag = null;

  function make(name) {
    const s = SPRITES[name], f = art[name][0];
    return { name, s, w: f.width, h: f.height, x: 0, y: 0, dir: Math.random() < 0.5 ? -1 : 1, speed: s.speed * rand(0.8, 1.2),
      state: "gone", vx: 0, vy: 0, t: rand(0, 1), pause: 0, spin: 0, vspin: 0, falling: false, leaving: false, back: 0, flyY: rand(30, 90) };
  }
  // Drop in from above at a random spot over the bar.
  function dropIn(a) {
    a.x = rand(left, Math.max(left, right - a.w));
    a.y = -a.h - rand(0, 40);
    a.vx = 0; a.vy = 0; a.spin = 0; a.vspin = 0; a.falling = false; a.state = "air";
  }
  // Off the bar: tumble down past the taskbar.
  function fallOff(a, vx, vy) {
    a.state = "air"; a.falling = true; a.vx = vx; a.vy = vy; a.vspin = (vx >= 0 ? 1 : -1) * rand(5, 9);
  }
  const onBar = (a) => a.x + a.w / 2 >= left && a.x + a.w / 2 <= right;
  const standY = (a) => (a.s.fly ? ground - a.h - a.flyY : ground - a.h);

  function setCast(id) {
    // About one animal per 45px of bar, so a phone gets a smaller crowd.
    const names = castOf(id).slice(0, Math.max(2, Math.floor((right - left) / 45)));
    if (reduceMotion || !W) {
      animals = names.map((n, i) => { const a = make(n); a.x = left + ((i + 0.5) / names.length) * (right - left) - a.w / 2; a.y = standY(a); a.state = "walk"; return a; });
      draw();
      return;
    }
    // The old cast hops off the bar; the new one drops in, one after another.
    animals.forEach((a) => { if (!a.leaving) { a.leaving = true; fallOff(a, (a.x + a.w / 2 < (left + right) / 2 ? -1 : 1) * rand(80, 140), -rand(280, 380)); } });
    names.forEach((n, i) => { const a = make(n); a.back = now + 0.25 + i * 0.45; animals.push(a); });
  }

  function step(dt) {
    for (const a of animals) {
      a.t += dt;
      if (a.state === "gone") { if (now >= a.back) dropIn(a); continue; }
      if (a.state === "held") { if (!drag || drag.a !== a) { a.state = "air"; a.vx = 0; a.vy = 0; } continue; }
      if (a.state === "air") {
        a.vy += GRAVITY * dt * (a.s.fly && !a.falling ? 0.35 : 1);
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.spin += a.vspin * dt;
        // Bounce off the sides and top of the screen so a thrown animal never leaves the view.
        if (!a.leaving) {
          if (a.x < 0 && a.vx < 0) { a.x = 0; a.vx = -a.vx * 0.6; a.vspin = -a.vspin; }
          if (a.x + a.w > W && a.vx > 0) { a.x = W - a.w; a.vx = -a.vx * 0.6; a.vspin = -a.vspin; }
          if (a.y < 0 && a.vy < 0) { a.y = 0; a.vy = -a.vy * 0.4; }
        }
        const land = standY(a);
        if (!a.falling && a.vy > 0 && a.y >= land) {
          if (onBar(a) || a.s.fly) {
            a.y = land; a.state = "walk"; a.vx = 0; a.spin = 0; a.vspin = 0; a.pause = rand(0.2, 0.8);
            if (a.s.fly) a.x = clamp(a.x, left, right - a.w);
          } else a.falling = true, a.vspin = (a.vx >= 0 ? 1 : -1) * rand(5, 9);
        }
        if (a.y > H + 20 || a.x < -a.w - 80 || a.x > W + 80) {
          if (a.leaving) a.state = "dead";
          else { a.state = "gone"; a.back = now + rand(1, 2.5); }
        }
        continue;
      }
      // walking
      if (a.pause > 0) { a.pause -= dt; continue; }
      a.x += a.dir * a.speed * dt;
      if (a.s.fly) {
        if (a.x < left && a.dir < 0) a.dir = 1;
        if (a.x + a.w > right && a.dir > 0) a.dir = -1;
      } else if (!onBar(a)) {
        fallOff(a, a.dir * Math.max(a.speed, 30), -90); // walked off the end of the bar
        continue;
      }
      if (Math.random() < dt * 0.2) { if (Math.random() < 0.5) a.pause = rand(0.6, 2.2); else a.dir *= -1; }
    }
    animals = animals.filter((a) => a.state !== "dead");
    hearts = hearts.filter((h) => (h.t += dt) < 1);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;
    for (const a of animals) {
      if (a.state === "gone") continue;
      const held = a.state === "held", walking = a.state === "walk" && a.pause <= 0 && !reduceMotion;
      const rate = held ? 14 : a.s.fly ? 8 : a.s.hop ? 4 : 6;
      const fi = (a.s.fly && !reduceMotion) || walking || held ? Math.floor(a.t * rate) % 2 : 0;
      const img = art[a.name][fi];
      let y = a.y;
      if (a.state === "walk" && a.s.fly && !reduceMotion) y += Math.sin(a.t * 3) * 3;
      if (a.s.hop && walking) y -= Math.abs(Math.sin(a.t * Math.PI * rate / 2)) * 5;
      ctx.save();
      ctx.translate(Math.round(a.x + a.w / 2), Math.round(y + a.h / 2));
      if (a.spin) ctx.rotate(a.spin);
      if (a.dir < 0) ctx.scale(-1, 1);
      ctx.drawImage(img, -a.w / 2, -a.h / 2);
      ctx.restore();
    }
    for (const h of hearts) {
      ctx.globalAlpha = 1 - h.t;
      ctx.drawImage(heart, Math.round(h.x - heart.width / 2), Math.round(h.y - h.t * 34));
      ctx.globalAlpha = 1;
    }
  }

  // ---------- mouse: click to make one jump, drag to carry and throw ----------
  const coarse = matchMedia("(pointer: coarse)");
  const hitAt = (e) => {
    const pad = coarse.matches ? 16 : 4; // fingers need a bigger target
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    // Of the animals under the pointer, take the one whose middle is closest.
    let best = null, bestD = Infinity;
    for (const a of animals) {
      if (a.state === "gone" || a.leaving) continue;
      if (x < a.x - pad || x > a.x + a.w + pad || y < a.y - pad || y > a.y + a.h + pad) continue;
      const d = Math.hypot(x - (a.x + a.w / 2), y - (a.y + a.h / 2));
      if (d < bestD) { best = a; bestD = d; }
    }
    return best && { a: best, x, y };
  };
  let swallowClick = false;
  if (!reduceMotion) {
    addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const hit = hitAt(e);
      if (!hit) return;
      e.preventDefault(); e.stopPropagation();
      drag = { a: hit.a, ox: hit.x - hit.a.x, oy: hit.y - hit.a.y, sx: hit.x, sy: hit.y, lx: hit.x, ly: hit.y, lt: performance.now(), vx: 0, vy: 0, moved: false };
    }, true);
    addEventListener("pointermove", (e) => {
      if (!drag) { document.documentElement.classList.toggle("zoo-hover", !!hitAt(e)); return; }
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, a = drag.a;
      if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 4) { drag.moved = true; a.state = "held"; a.spin = 0; a.vspin = 0; a.falling = false; document.documentElement.classList.add("zoo-grabbing"); }
      if (!drag.moved) return;
      const t = performance.now(), k = Math.max(1, t - drag.lt) / 1000;
      drag.vx = drag.vx * 0.5 + ((x - drag.lx) / k) * 0.5;
      drag.vy = drag.vy * 0.5 + ((y - drag.ly) / k) * 0.5;
      drag.lx = x; drag.ly = y; drag.lt = t;
      a.x = x - drag.ox; a.y = y - drag.oy;
      if (Math.abs(x - drag.sx) > 2) a.dir = x > drag.sx ? 1 : -1;
    }, true);
    addEventListener("pointerup", (e) => {
      if (!drag) return;
      const a = drag.a;
      e.preventDefault(); e.stopPropagation();
      swallowClick = true; setTimeout(() => { swallowClick = false; }, 0);
      document.documentElement.classList.remove("zoo-grabbing");
      if (drag.moved) {
        a.state = "air"; a.falling = false;
        a.vx = clamp(drag.vx, -900, 900); a.vy = clamp(drag.vy, -900, 900);
        a.vspin = a.vx / 120;
      } else if (a.state === "walk") {
        a.state = "air"; a.vx = 0; a.vy = -340; a.pause = 0; // a happy little jump
        hearts.push({ x: a.x + a.w / 2, y: a.y - 6, t: 0 });
      }
      drag = null;
    }, true);
    // On a touch screen a finger drag is a scroll gesture by default: the browser would cancel
    // the pointer and the animal would drop. Claim touches that start on an animal instead.
    addEventListener("touchstart", (e) => { if (e.touches.length === 1 && hitAt(e.touches[0])) e.preventDefault(); }, { capture: true, passive: false });
    addEventListener("touchmove", (e) => { if (drag) e.preventDefault(); }, { capture: true, passive: false });
    // Let go if the pointer is lost (released outside the window, tab switched).
    const drop = () => { drag = null; document.documentElement.classList.remove("zoo-grabbing"); };
    addEventListener("pointercancel", drop, true);
    addEventListener("blur", drop);
    // A click or double-click that landed on an animal should not also open a desktop icon.
    for (const type of ["click", "dblclick"]) addEventListener(type, (e) => { if (swallowClick) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  let last = 0;
  function loop(t) {
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t; now += dt;
    step(dt);
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  addEventListener("resize", () => { resize(); draw(); });
  document.addEventListener("chaseos:active", (e) => setCast(e.detail));
  setCast(window.CHASEOS_ACTIVE || null);
  if (!reduceMotion) requestAnimationFrame(loop);
})();
