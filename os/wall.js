// Background: a rotating 3D ASCII sphere ("3D ASCII Sphere" by Filispeen, CC0; frames in
// sphere-frames.js). It reacts to the mouse on empty desktop space:
//   hold the button  → spins faster, glows and shifts colour
//   drag             → spin follows the drag (left/right = direction, speed = drag speed)
//   move             → the sphere leans gently toward the pointer
// With reduced motion the sphere shows one still frame.
(() => {
  const host = document.getElementById("wall");
  const frames = window.SPHERE_FRAMES;
  if (!host || !frames || !frames.length) return;

  const pre = document.createElement("pre");
  pre.className = "sphere";
  pre.setAttribute("aria-hidden", "true");
  pre.textContent = frames[0];
  host.append(pre);
  host.classList.add("is-live");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const BASE = 1;            // frames per 10 ms at rest (the original speed)
  let pos = 0;               // fractional frame index
  let speed = BASE, target = BASE;
  let glow = 0, glowTarget = 0;
  let hue = 210;
  let lean = { x: 0, y: 0 }, leanTarget = { x: 0, y: 0 };
  let down = false, lastX = 0, lastT = 0;

  const onDesktop = (e) => !e.target.closest(".win, .dicon, .taskbar, .start, a, button");

  addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !onDesktop(e)) return;
    down = true; lastX = e.clientX; lastT = performance.now();
    target = 6; glowTarget = 1;
  });
  addEventListener("pointermove", (e) => {
    leanTarget.x = (e.clientX / innerWidth - 0.5) * 2;
    leanTarget.y = (e.clientY / innerHeight - 0.5) * 2;
    if (!down) return;
    const now = performance.now(), dt = Math.max(now - lastT, 1);
    const v = (e.clientX - lastX) / dt;            // px per ms, signed
    lastX = e.clientX; lastT = now;
    if (Math.abs(v) > 0.05) target = Math.max(-14, Math.min(14, v * 9));
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
      hue = (hue + glow * dt * 0.12) % 360;
      const light = 88 - glow * 18;
      pre.style.color = `hsl(${hue.toFixed(0)} ${(glow * 90).toFixed(0)}% ${light.toFixed(0)}%)`;
      pre.style.textShadow = glow > 0.02 ? `0 0 ${(4 + glow * 18).toFixed(1)}px hsl(${hue.toFixed(0)} 90% 60% / ${(glow * 0.9).toFixed(2)})` : "none";
      pre.style.transform = `translate(-50%, -50%) translate(${(lean.x * 14).toFixed(1)}px, ${(lean.y * 10).toFixed(1)}px) scale(${(1 + glow * 0.08).toFixed(3)})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
