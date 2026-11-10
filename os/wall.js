// Background: a rotating 3D ASCII sphere ("3D ASCII Sphere" by Filispeen, CC0; frames in
// sphere-frames.js). It reacts to the mouse on empty desktop space:
//   hold the button  → spins faster and glows from grey to blue
//   drag             → spin follows the drag (left/right = direction, speed = drag speed)
//   move             → the sphere leans gently toward the pointer and the pointer leaves an ASCII trail
// With reduced motion the sphere shows one still frame.
(() => {
  const host = document.getElementById("wall");
  const source = window.SPHERE_FRAMES;
  if (!host || !source || !source.length) return;

  // The original frames shade with one character per brightness level, which repeats a lot
  // ("@@@@$$$888WWW"). Swap each level for a small set of look-alike glyphs, picked by a
  // hash of the cell and the frame, so the surface reads as mixed symbols and digits.
  const SHADES = {
    ".": ".,`'", ":": ":;-~", "!": "!i|+", "/": "/\\=<", "r": "rcv*", "(": "(){}", "l": "lt[]",
    "1": "17jI", "Z": "Z2S5", "4": "4AY%", "H": "HKX#", "9": "906G", "W": "WMN3", "8": "8B&E", "$": "$D0Q", "@": "@#&M",
  };
  const hash = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; };
  const frames = source.map((f, fi) => {
    let out = "", x = 0, y = 0;
    for (const ch of f) {
      if (ch === "\n") { out += ch; y++; x = 0; continue; }
      const set = SHADES[ch];
      out += set ? set[hash(x, y, fi >> 2) % set.length] : ch;
      x++;
    }
    return out;
  });

  const pre = document.createElement("pre");
  pre.className = "sphere";
  pre.setAttribute("aria-hidden", "true");
  pre.textContent = frames[0];
  host.append(pre);
  host.classList.add("is-live");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const BASE = 0.5;          // frames per 10 ms at rest (half the original speed)
  let pos = 0;               // fractional frame index
  let speed = BASE, target = BASE;
  let glow = 0, glowTarget = 0;
  const GREY = [96, 104, 116], BLUE = [42, 118, 210];
  let lean = { x: 0, y: 0 }, leanTarget = { x: 0, y: 0 };
  let down = false, lastX = 0, lastT = 0;

  // ASCII trail behind the pointer, drawn on its own canvas under the icons and windows.
  const trail = document.createElement("canvas");
  trail.className = "trail";
  host.append(trail);
  const tx = trail.getContext("2d");
  const CHARS = ".:!/r(l1Z4H9W8$@";
  const dots = [];
  let tw = 0, th = 0, dpr = 1, lastDot = { x: -99, y: -99 };
  function sizeTrail() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    tw = innerWidth; th = innerHeight;
    trail.width = tw * dpr; trail.height = th * dpr;
    tx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeTrail();
  addEventListener("resize", sizeTrail);
  function addDots(x, y) {
    const dist = Math.hypot(x - lastDot.x, y - lastDot.y);
    if (dist < 9) return;
    const steps = Math.min(6, Math.floor(dist / 9));
    for (let i = 1; i <= steps; i++) {
      const px = lastDot.x < -50 ? x : lastDot.x + (x - lastDot.x) * (i / steps);
      const py = lastDot.y < -50 ? y : lastDot.y + (y - lastDot.y) * (i / steps);
      dots.push({ x: px, y: py, born: performance.now(), ch: CHARS[(Math.random() * CHARS.length) | 0], vy: -0.02 - Math.random() * 0.03 });
    }
    lastDot = { x, y };
    if (dots.length > 140) dots.splice(0, dots.length - 140);
  }

  const onDesktop = (e) => !e.target.closest(".win, .dicon, .taskbar, .start, a, button");

  addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !onDesktop(e)) return;
    down = true; lastX = e.clientX; lastT = performance.now();
    target = 3; glowTarget = 1;
  });
  addEventListener("pointermove", (e) => {
    addDots(e.clientX, e.clientY);
    leanTarget.x = (e.clientX / innerWidth - 0.5) * 2;
    leanTarget.y = (e.clientY / innerHeight - 0.5) * 2;
    if (!down) return;
    const now = performance.now(), dt = Math.max(now - lastT, 1);
    const v = (e.clientX - lastX) / dt;            // px per ms, signed
    lastX = e.clientX; lastT = now;
    if (Math.abs(v) > 0.05) target = Math.max(-7, Math.min(7, v * 4.5));
  });
  const release = () => { if (!down) return; down = false; target = BASE; glowTarget = 0; };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
  addEventListener("blur", release);

  let prev = performance.now();
  function frame(now) {
    const dt = Math.min(now - prev, 64); prev = now;
    if (!document.hidden) {
      const k = 1 - Math.pow(0.001, dt / 1000);      // smooth easing, frame-rate independent
      speed += (target - speed) * Math.min(1, k * 3);
      glow += (glowTarget - glow) * Math.min(1, k * 4);
      lean.x += (leanTarget.x - lean.x) * k; lean.y += (leanTarget.y - lean.y) * k;
      pos = (pos + speed * dt / 10) % frames.length;
      if (pos < 0) pos += frames.length;
      pre.textContent = frames[Math.floor(pos)];
      const c = GREY.map((g, i) => Math.round(g + (BLUE[i] - g) * glow));
      pre.style.color = `rgb(${c.join(",")})`;
      pre.style.textShadow = glow > 0.02 ? `0 0 ${(4 + glow * 18).toFixed(1)}px rgba(42, 118, 210, ${(glow * 0.85).toFixed(2)})` : "none";
      // trail: each character fades over ~900 ms, drifting up a little
      tx.clearRect(0, 0, tw, th);
      tx.font = "600 14px Cascadia Mono, SF Mono, Menlo, Consolas, monospace";
      tx.textAlign = "center"; tx.textBaseline = "middle";
      const life = 900;
      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i], age = now - d.born;
        if (age > life) { dots.splice(i, 1); continue; }
        const a = 1 - age / life;
        const cc = GREY.map((g, j) => Math.round(g + (BLUE[j] - g) * Math.max(glow, 0.55)));
        tx.fillStyle = `rgba(${cc.join(",")}, ${(a * 0.9).toFixed(3)})`;
        tx.fillText(d.ch, d.x, d.y + d.vy * age);
      }
      pre.style.transform = `translate(-50%, -50%) translate(${(lean.x * 14).toFixed(1)}px, ${(lean.y * 10).toFixed(1)}px) scale(${(1 + glow * 0.08).toFixed(3)})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
