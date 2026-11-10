// Samurai Duel: a small two-fighter canvas game for ChaseOS.
// Code written for this site. Art: "Martial Hero" and "Martial Hero 2" by LuizMelo (CC0),
// "Oak Woods" background and shop by brullov (used with credit, see NOTICE.md).
(() => {
  "use strict";
  const W = 1024, H = 576, GROUND = 482, S = 2.5, GRAVITY = 0.7, TICK = 1000 / 60;
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const load = (src) => { const i = new Image(); i.src = src; return i; };
  const sheet = (dir, name, frames, once = false) => ({ img: load(`img/${dir}/${name}.png`), frames, once });

  // anchor = the fighter's feet inside a 200x200 frame; face = way the art looks
  const ART = {
    mack: { anchor: [95, 122], face: 1, hitFrame: { attack1: 4, attack2: 4 }, reach: 150,
      anim: { idle: sheet("mack", "idle", 8), run: sheet("mack", "run", 8), jump: sheet("mack", "jump", 2), fall: sheet("mack", "fall", 2),
        attack1: sheet("mack", "attack1", 6, true), attack2: sheet("mack", "attack2", 6, true), hit: sheet("mack", "hit", 4, true), death: sheet("mack", "death", 6, true) } },
    kenji: { anchor: [102, 128], face: -1, hitFrame: { attack1: 2, attack2: 2 }, reach: 140,
      anim: { idle: sheet("kenji", "idle", 4), run: sheet("kenji", "run", 8), jump: sheet("kenji", "jump", 2), fall: sheet("kenji", "fall", 2),
        attack1: sheet("kenji", "attack1", 4, true), attack2: sheet("kenji", "attack2", 4, true), hit: sheet("kenji", "hit", 3, true), death: sheet("kenji", "death", 7, true) } },
  };
  const bg = load("img/background.png");
  const shop = load("img/shop.png");

  class Fighter {
    constructor(kind, x, dir, name, color) {
      this.art = ART[kind]; this.name = name; this.color = color;
      this.x = x; this.y = GROUND; this.vx = 0; this.vy = 0; this.dir = dir;
      this.hp = 100; this.shownHp = 100;
      this.state = "idle"; this.frame = 0; this.ticks = 0; this.struck = false;
      this.input = { left: false, right: false, jump: false, a1: false, a2: false };
    }
    get busy() { return ["attack1", "attack2", "hit", "death"].includes(this.state); }
    get airborne() { return this.y < GROUND; }
    set(state) { if (this.state !== state) { this.state = state; this.frame = 0; this.ticks = 0; this.struck = false; } }
    update(foe) {
      const inp = this.input;
      if (this.state !== "death") {
        if (!this.busy) {
          this.vx = (inp.right - inp.left) * 5;
          if (this.vx) this.dir = Math.sign(this.vx);
          else if (!this.airborne) this.dir = Math.sign(foe.x - this.x) || this.dir;
          if (inp.jump && !this.airborne) this.vy = -16;
          if (inp.a1) this.set("attack1"); else if (inp.a2) this.set("attack2");
        } else if (this.state !== "hit") this.vx *= 0.8;
        inp.jump = inp.a1 = inp.a2 = false; // presses, not holds
      } else this.vx *= 0.9;

      this.x = Math.max(40, Math.min(W - 40, this.x + this.vx));
      this.vy += GRAVITY; this.y += this.vy;
      if (this.y >= GROUND) { this.y = GROUND; this.vy = 0; }
      if (this.state === "hit") this.vx *= 0.85;

      if (!this.busy) this.set(this.airborne ? (this.vy < 0 ? "jump" : "fall") : (this.vx ? "run" : "idle"));

      // animation, 10 frames a second
      const anim = this.art.anim[this.state];
      if (++this.ticks >= 6) {
        this.ticks = 0;
        if (this.frame < anim.frames - 1) this.frame++;
        else if (!anim.once) this.frame = 0;
        else if (this.state !== "death") this.set("idle");
      }
      // the blade lands on one frame of the swing
      if ((this.state === "attack1" || this.state === "attack2") && !this.struck && this.frame === this.art.hitFrame[this.state]) {
        this.struck = true;
        const near = (foe.x - this.x) * this.dir;
        if (near > -20 && near < this.art.reach && Math.abs(foe.y - this.y) < 110 && foe.state !== "death") foe.takeHit(this.state === "attack2" ? 16 : 10, this.dir);
      }
      this.shownHp += (this.hp - this.shownHp) * 0.15;
    }
    takeHit(dmg, dir) {
      this.hp = Math.max(0, this.hp - dmg);
      this.vx = dir * 7; this.dir = -dir;
      this.set(this.hp ? "hit" : "death");
      game.shake = 8;
    }
    draw() {
      const anim = this.art.anim[this.state], [ax, ay] = this.art.anchor;
      if (!anim.img.complete) return;
      ctx.save();
      ctx.translate(Math.round(this.x), Math.round(this.y));
      if (this.dir !== this.art.face) ctx.scale(-1, 1);
      ctx.drawImage(anim.img, this.frame * 200, 0, 200, 200, -ax * S, -ay * S, 200 * S, 200 * S);
      ctx.restore();
    }
  }

  // --- simple CPU: close in, swing when in reach, sometimes back off or jump
  function cpu(me, foe) {
    const i = me.input, d = foe.x - me.x, dist = Math.abs(d);
    i.left = i.right = false;
    if (me.busy || foe.state === "death") return;
    me.think = (me.think || 0) - 1;
    if (me.retreat > 0) { me.retreat--; (d > 0 ? (i.left = true) : (i.right = true)); return; }
    if (dist > me.art.reach - 30) (d > 0 ? (i.right = true) : (i.left = true));
    if (me.think <= 0) {
      me.think = 14 + Math.random() * 26;
      if (dist < me.art.reach - 10) { Math.random() < 0.6 ? (i.a1 = true) : (i.a2 = true); }
      else if (Math.random() < 0.08) i.jump = true;
      if (Math.random() < 0.12) me.retreat = 20;
    }
  }

  const game = { mode: null, state: "controls", time: 60, clock: 0, shake: 0, winner: "", menu: 0 };
  let p1, p2;
  function start(mode) {
    game.mode = mode; game.state = "fight"; game.time = 60; game.clock = 0; game.winner = "";
    p1 = new Fighter("mack", 260, 1, "MACK", "#2a76d2");
    p2 = new Fighter("kenji", 764, -1, mode === "cpu" ? "KENJI (CPU)" : "KENJI", "#c0c6d0");
  }

  // --- keys
  const P1 = { KeyA: "left", KeyD: "right", KeyW: "jump", Space: "a1", KeyF: "a2" };
  const P2 = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "jump", ArrowDown: "a1", Enter: "a2" };
  function key(e, down) {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    if (game.state !== "fight") {
      if (!down) return;
      if (game.state === "controls") { game.state = "title"; return; }
      if (game.state === "title") {
        if (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "KeyW" || e.code === "KeyS") game.menu ^= 1;
        if (e.code === "Enter" || e.code === "Space") start(game.menu ? "2p" : "cpu");
        if (e.code === "Digit1") start("cpu"); if (e.code === "Digit2") start("2p");
      } else if (e.code === "Enter" || e.code === "Space" || e.code === "KeyR") start(game.mode);
      else if (e.code === "Escape") game.state = "title";
      return;
    }
    if (e.code === "Escape") { game.state = "title"; return; }
    const press = (map, f) => { const a = map[e.code]; if (!a) return; if (["jump", "a1", "a2"].includes(a)) { if (down && !e.repeat) f.input[a] = true; } else f.input[a] = down; };
    press(P1, p1);
    if (game.mode === "2p") press(P2, p2);
  }
  addEventListener("keydown", (e) => key(e, true));
  addEventListener("keyup", (e) => key(e, false));
  canvas.addEventListener("pointerdown", (e) => {
    canvas.focus();
    if (game.state === "controls") { game.state = "title"; return; }
    if (game.state === "title") { const r = canvas.getBoundingClientRect(), y = (e.clientY - r.top) / r.height * H; start(y > 330 ? "2p" : "cpu"); }
    else if (game.state === "over") start(game.mode);
  });
  // touch pad for phones (player 1)
  document.querySelectorAll("[data-pad]").forEach((b) => {
    const a = b.dataset.pad;
    const set = (v) => (e) => { e.preventDefault(); if (game.state !== "fight") return; if (["jump", "a1", "a2"].includes(a)) { if (v) p1.input[a] = true; } else p1.input[a] = v; };
    b.addEventListener("pointerdown", set(true)); b.addEventListener("pointerup", set(false)); b.addEventListener("pointerleave", set(false));
  });

  function step() {
    if (game.state !== "fight") return;
    if (game.mode === "cpu") cpu(p2, p1);
    p1.update(p2); p2.update(p1);
    // bodies don't overlap on the ground
    const gap = p2.x - p1.x, need = 70;
    if (Math.abs(gap) < need && Math.abs(p1.y - p2.y) < 80) {
      const push = (need - Math.abs(gap)) / 2 * (Math.sign(gap) || 1);
      p1.x = Math.max(40, p1.x - push); p2.x = Math.min(W - 40, p2.x + push);
    }
    if (++game.clock >= 60) { game.clock = 0; game.time = Math.max(0, game.time - 1); }
    const ko = p1.hp <= 0 || p2.hp <= 0;
    if ((ko || game.time === 0) && !game.endAt) game.endAt = ko ? 90 : 1;
    if (game.endAt && --game.endAt === 0) {
      game.endAt = 0; game.state = "over";
      game.winner = p1.hp === p2.hp ? "DRAW" : (p1.hp > p2.hp ? p1.name : p2.name.replace(" (CPU)", "")) + " WINS";
    }
  }

  // --- drawing
  const font = (px) => `bold ${px}px "Cascadia Mono", ui-monospace, Menlo, Consolas, monospace`;
  function bar(x, w, f, right) {
    ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(x - 3, 21, w + 6, 30);
    ctx.fillStyle = "#3a0d12"; ctx.fillRect(x, 24, w, 24);
    const lag = w * f.shownHp / 100, now = w * f.hp / 100;
    ctx.fillStyle = "#e6e9ef"; ctx.fillRect(right ? x + w - lag : x, 24, lag, 24);
    ctx.fillStyle = f.color; ctx.fillRect(right ? x + w - now : x, 24, now, 24);
    ctx.fillStyle = "#fff"; ctx.font = font(15); ctx.textAlign = right ? "right" : "left";
    ctx.fillText(f.name, right ? x + w : x, 72);
  }
  function center(text, y, px, color = "#fff") { ctx.font = font(px); ctx.textAlign = "center"; ctx.fillStyle = "#000"; ctx.fillText(text, W / 2 + 3, y + 3); ctx.fillStyle = color; ctx.fillText(text, W / 2, y); }

  let shopFrame = 0, shopTicks = 0;
  function draw() {
    ctx.save();
    if (game.shake > 0) { ctx.translate((Math.random() - .5) * game.shake, (Math.random() - .5) * game.shake); game.shake *= 0.8; if (game.shake < .5) game.shake = 0; }
    if (bg.complete) ctx.drawImage(bg, 0, 0, W, H);
    if (shop.complete) { if (++shopTicks >= 8) { shopTicks = 0; shopFrame = (shopFrame + 1) % 6; } ctx.drawImage(shop, shopFrame * 118, 0, 118, 128, 600, 130, 118 * 2.75, 128 * 2.75); }
    ctx.fillStyle = "rgba(4,8,16,.35)"; ctx.fillRect(0, 0, W, H); // keep it dark like the desktop
    if (p1) { p2.draw(); p1.draw(); }
    ctx.restore();

    if (game.state === "controls") {
      ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0, 0, W, H);
      center("CONTROLS", 110, 40, "#6fb2ff");
      const col = (x, title, rows) => {
        ctx.textAlign = "left"; ctx.font = font(22); ctx.fillStyle = "#fff"; ctx.fillText(title, x, 180);
        rows.forEach(([k, what], i) => {
          const y = 232 + i * 46;
          ctx.font = font(18); const kw = ctx.measureText(k).width + 20;
          ctx.fillStyle = "#1b2433"; ctx.fillRect(x, y - 24, kw, 34); ctx.strokeStyle = "#2a76d2"; ctx.strokeRect(x + .5, y - 23.5, kw - 1, 33);
          ctx.fillStyle = "#cfe3ff"; ctx.fillText(k, x + 10, y);
          ctx.fillStyle = "#c9ced8"; ctx.font = font(17); ctx.fillText(what, x + kw + 14, y);
        });
      };
      col(110, "Player 1", [["A", "Move backwards"], ["W", "Jump"], ["D", "Move forward"], ["SPACE", "Attack"]]);
      col(560, "Player 2", [["←", "Move forward"], ["↑", "Jump"], ["→", "Move backwards"], ["↓", "Attack"]]);
      if (Math.floor(performance.now() / 600) % 2) center("Press any key or click to continue", 470, 18, "#9aa3b2");
      return;
    }
    if (game.state === "title") {
      ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(0, 0, W, H);
      center("SAMURAI DUEL", 200, 56);
      ["1 PLAYER  vs CPU", "2 PLAYERS (same keyboard)"].forEach((t, i) => center((game.menu === i ? "> " : "  ") + t, 300 + i * 60, 26, game.menu === i ? "#6fb2ff" : "#9aa3b2"));
      center("P1  A D move · W jump · SPACE / F attack", 470, 16, "#c9ced8");
      center("P2  ← → move · ↑ jump · ↓ / ENTER attack", 498, 16, "#c9ced8");
      return;
    }
    bar(24, 400, p1, false); bar(W - 424, 400, p2, true);
    ctx.fillStyle = "rgba(0,0,0,.75)"; ctx.fillRect(W / 2 - 46, 16, 92, 40);
    center(String(game.time), 48, 28, game.time <= 10 ? "#ff6b6b" : "#fff");
    if (game.state === "fight" && game.clock < 60 && game.time === 60) center("FIGHT!", 260, 54, "#6fb2ff");
    if (game.state === "over") {
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, 0, W, H);
      center(game.winner, 250, 56, "#6fb2ff");
      center("ENTER / click: rematch    ESC: menu", 320, 18, "#c9ced8");
    }
  }

  let last = performance.now(), acc = 0;
  function loop(now) {
    acc = Math.min(acc + now - last, 250); last = now;
    while (acc >= TICK) { step(); acc -= TICK; }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  canvas.focus();
})();
