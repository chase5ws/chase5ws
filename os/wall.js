// Background: a rotating 3D ASCII sphere ("3D ASCII Sphere" by Filispeen, CC0; frames in
// sphere-frames.js). It reacts to the mouse on empty desktop space:
//   hold the button  → spins faster and glows from grey to blue
//   drag             → spin follows the drag (left/right = direction, speed = drag speed)
//   move             → the sphere leans gently toward the pointer and the pointer drags a glowing deep-blue streak
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

  // Glowing deep-blue streak behind the pointer, on its own canvas under the icons and windows.
  const trail = document.createElement("canvas");
  trail.className = "trail";
  host.append(trail);
  const tx = trail.getContext("2d");
  const pts = [];                       // recent pointer positions {x, y, t}
  const LIFE = 600;                     // ms a point stays in the streak
  let tw = 0, th = 0, dpr = 1;
  function sizeTrail() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    tw = innerWidth; th = innerHeight;
    trail.width = tw * dpr; trail.height = th * dpr;
    tx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeTrail();
  addEventListener("resize", sizeTrail);
  function addPoint(x, y) {
    const last = pts[pts.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < 2) return;
    pts.push({ x, y, t: performance.now() });
    if (pts.length > 80) pts.shift();
  }
  // one pass of the streak: segments get thicker and brighter toward the pointer
  function stroke(now, width, color, blur) {
    tx.shadowColor = blur ? "rgba(20, 70, 255, 0.95)" : "transparent";
    tx.shadowBlur = blur;
    for (let i = 1; i < pts.length; i++) {
      const a = 1 - (now - pts[i].t) / LIFE;
      if (a <= 0) continue;
      tx.strokeStyle = `rgba(${color}, ${(a * a).toFixed(3)})`;
      tx.lineWidth = width * (0.25 + 0.75 * a);
      tx.beginPath(); tx.moveTo(pts[i - 1].x, pts[i - 1].y); tx.lineTo(pts[i].x, pts[i].y); tx.stroke();
    }
  }
  function drawTrail(now) {
    while (pts.length && now - pts[0].t > LIFE) pts.shift();
    tx.clearRect(0, 0, tw, th);
    if (pts.length < 2) return;
    tx.save();
    tx.lineCap = "round"; tx.lineJoin = "round";
    tx.globalCompositeOperation = "lighter";
    stroke(now, 10, "18, 60, 230", 22);   // wide deep-blue glow
    stroke(now, 4, "60, 130, 255", 8);    // brighter blue body
    stroke(now, 1.6, "190, 220, 255", 0); // thin hot core
    tx.restore();
  }

  const onDesktop = (e) => !e.target.closest(".win, .dicon, .taskbar, .start, a, button");

  addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !onDesktop(e)) return;
    down = true; lastX = e.clientX; lastT = performance.now();
    target = 3; glowTarget = 1;
  });
  addEventListener("pointermove", (e) => {
    addPoint(e.clientX, e.clientY);
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
      drawTrail(now);
      pre.style.transform = `translate(-50%, -50%) translate(${(lean.x * 14).toFixed(1)}px, ${(lean.y * 10).toFixed(1)}px) scale(${(1 + glow * 0.08).toFixed(3)})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
