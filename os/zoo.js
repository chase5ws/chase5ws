// Pixel zoo: little animals walk along the taskbar, between the name and the clock.
// The cast changes with the focused window (os.js fires "chaseos:active" with its id;
// null means the bare desktop). Old animals walk off the nearest edge, new ones walk in.
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
  };

  // Which animals live in which window. Anything not listed gets two picked from its id.
  const CAST = {
    "": ["cat", "dog", "chick"],
    me: ["cat", "dog"],
    contact: ["owl", "chick"],
    experience: ["turtle", "owl"],
    roadmap: ["rabbit", "turtle"],
    stats: ["penguin", "chick"],
    live: ["fox", "rabbit"],
    dev: ["turtle", "chick"],
    "this-pc": ["penguin", "cat"],
    doom: ["bat", "bat", "bat"],
    duel: ["fox", "frog"],
    "asc-bot": ["cat", "owl"],
    "asc-site": ["fox", "chick"],
    mbti: ["owl", "dog"],
    wallpaper: ["penguin", "frog"],
  };
  const NAMES = Object.keys(SPRITES);
  const castOf = (id) => {
    if (CAST[id || ""]) return CAST[id || ""];
    let h = 0;
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return [NAMES[h % NAMES.length], NAMES[(h >>> 8) % NAMES.length]];
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

  const canvas = document.createElement("canvas");
  canvas.className = "zoo";
  canvas.setAttribute("aria-hidden", "true");
  bar.append(canvas);
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;

  function resize() {
    const r = bar.getBoundingClientRect();
    const name = bar.querySelector(".tb-name"), clock = bar.querySelector(".clock");
    const left = name ? name.getBoundingClientRect().right - r.left + 8 : 0;
    const right = clock ? r.right - clock.getBoundingClientRect().left + 8 : 0;
    W = Math.max(0, r.width - left - right);
    H = r.height;
    dpr = devicePixelRatio || 1;
    Object.assign(canvas.style, { left: `${left}px`, width: `${W}px`, height: `${H}px` });
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  let animals = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  function spawn(name, i, n, enter) {
    const s = SPRITES[name], f = art[name][0];
    const dir = enter ? (i % 2 ? -1 : 1) : (Math.random() < 0.5 ? -1 : 1);
    const x = enter ? (dir > 0 ? -f.width - i * 30 : W + i * 30) : ((i + 0.5) / n) * W - f.width / 2;
    return { name, s, x, dir, speed: s.speed * rand(0.8, 1.2), t: rand(0, 1), pause: 0, leaving: false, w: f.width, h: f.height, flyY: rand(0, 6) };
  }

  function setCast(id) {
    const names = castOf(id);
    if (reduceMotion || !W) {
      animals = names.map((n, i) => spawn(n, i, names.length, false));
      draw();
      return;
    }
    // Send the current animals off the nearest edge and bring the new ones in.
    animals.forEach((a) => { if (!a.leaving) { a.leaving = true; a.pause = 0; a.dir = a.x + a.w / 2 < W / 2 ? -1 : 1; a.speed = Math.max(a.speed, 40); } });
    animals = animals.concat(names.map((n, i) => spawn(n, i, names.length, true)));
  }

  function step(dt) {
    for (const a of animals) {
      a.t += dt;
      if (a.pause > 0) { a.pause -= dt; continue; }
      // Hurry while walking in from outside the strip, so slow animals do not take ages.
      const outside = a.x < 0 || a.x + a.w > W;
      a.x += a.dir * a.speed * (outside && !a.leaving ? 4 : 1) * dt;
      if (a.leaving) continue;
      // Turn at the edges of the strip once fully inside it.
      if (a.x < 0 && a.dir < 0) a.dir = 1;
      if (a.x + a.w > W && a.dir > 0) a.dir = -1;
      // Now and then stop to look around, or turn back.
      if (a.x >= 0 && a.x + a.w <= W && Math.random() < dt * 0.25) {
        if (Math.random() < 0.5) a.pause = rand(0.6, 2.2); else a.dir *= -1;
      }
    }
    animals = animals.filter((a) => !a.leaving || (a.x > -a.w - 4 && a.x < W + 4));
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;
    for (const a of animals) {
      const moving = a.pause <= 0 && !reduceMotion;
      const rate = a.s.fly ? 8 : a.s.hop ? 4 : 6;
      const fi = moving ? Math.floor(a.t * rate) % 2 : 0;
      const img = art[a.name][a.s.fly ? Math.floor(a.t * rate) % 2 : fi];
      let y = H - a.h - 4;
      if (a.s.hop && moving) y -= Math.abs(Math.sin(a.t * Math.PI * rate / 2)) * 5;
      if (a.s.fly) y = 4 + a.flyY + Math.sin(a.t * 3) * 3;
      const x = Math.round(a.x), yy = Math.round(y);
      if (a.dir < 0) {
        ctx.save();
        ctx.translate(x + a.w, yy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      } else ctx.drawImage(img, x, yy);
    }
  }

  let last = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
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
