// ChaseOS: a simple dark desktop in the spirit of daedalOS. One icon, one thing.
// Content comes from data.js (window.CHASE). Project icons are the projects' own images;
// the rest are pixel icons drawn for this site and Windows 10 icons the owner supplied (NOTICE.md).
(() => {
  const D = window.CHASE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => matchMedia("(max-width: 720px)").matches;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  const anim = (el, frames, opts) => (reduceMotion || !el.animate ? Promise.resolve() : el.animate(frames, { duration: 160, easing: "cubic-bezier(.1,.9,.2,1)", ...opts }).finished.catch(() => {}));
  const ext = (href) => (href.startsWith("http") ? ' target="_blank" rel="noopener"' : "");

  // ---------- icons: drawn tiles, used only when an item has no image ----------
  let gid = 0;
  const tile = (a, b, inner) => { gid++; return `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="g${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="4" y="4" width="40" height="40" rx="10" fill="url(#g${gid})"/><rect x="4" y="4" width="40" height="20" rx="10" fill="#fff" opacity=".1"/>${inner}</svg>`; };
  const W = 'fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const DRAWN = {
    logo: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 9.4a3.6 3.6 0 1 0 0 5.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    me: () => tile("#5aa2ff", "#2557d6", `<circle cx="24" cy="19" r="6.5" fill="#fff"/><path d="M12.5 37c2.2-5.6 6.4-8.2 11.5-8.2s9.3 2.6 11.5 8.2" fill="#fff"/>`),
    contact: () => tile("#ff8a65", "#d8432b", `<rect x="11" y="15" width="26" height="18" rx="3" fill="#fff"/><path d="M12 17l12 9 12-9" fill="none" stroke="#d8432b" stroke-width="2.6" stroke-linejoin="round"/>`),
    experience: () => tile("#d08a4e", "#8f4f22", `<path d="M18 16v-2.5a2.5 2.5 0 0 1 2.5-2.5h7a2.5 2.5 0 0 1 2.5 2.5V16" ${W}/><rect x="11" y="16" width="26" height="19" rx="3" fill="#fff" opacity=".92"/><rect x="21.5" y="22" width="5" height="6" rx="1" fill="#a3602f"/>`),
    roadmap: () => tile("#3fcf8e", "#13865a", `<path d="M16 36V13m0 0h15l-3.5 5L31 23H16" ${W}/>`),
    swords: () => tile("#c86bff", "#5b21b6", `<path d="M14 14l17 17M34 14L17 31" ${W}/><path d="M28 34l6-6M14 28l6 6" ${W}/>`),
    chip: () => tile("#f472b6", "#be185d", `<rect x="15" y="15" width="18" height="18" rx="3" fill="#fff"/><path d="M19 15v-3M24 15v-3M29 15v-3M19 36v-3M24 36v-3M29 36v-3M15 19h-3M15 24h-3M15 29h-3M36 19h-3M36 24h-3M36 29h-3" ${W}/><rect x="20" y="20" width="8" height="8" rx="1.5" fill="#be185d"/>`),
    chat: () => tile("#38bdf8", "#0369a1", `<path d="M12 15a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H21l-6 5v-5a3 3 0 0 1-3-3z" fill="#fff"/><circle cx="19" cy="21" r="1.8" fill="#0369a1"/><circle cx="24" cy="21" r="1.8" fill="#0369a1"/><circle cx="29" cy="21" r="1.8" fill="#0369a1"/>`),
  };
  const iconOf = (item) => (item.image ? `<img src="${esc(item.image)}" alt="" draggable="false">` : (DRAWN[item.icon] || DRAWN.me)());
  const UI = {
    min: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" stroke="currentColor" stroke-width="1.1"/></svg>`,
    max: `<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
    close: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" stroke-width="1.1"/></svg>`,
    external: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 3h4v4M13 3L7.5 8.5M12 9.5V13H3V4h3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const STATUS = { live: "Live", source: "Source on GitHub", private: "Private repo", building: "Building" };

  // ---------- desktop items: each icon is one thing ----------
  const ITEMS = [
    { id: "me", title: "Me", icon: "me", image: "./os/icons/win-user.png", w: 520, h: 520, body: meBody },
    { id: "contact", title: "Contact", icon: "contact", image: "./os/icons/contact.png", w: 420, h: 280, body: contactBody },
    { id: "experience", title: "Experience", icon: "experience", image: "./os/icons/experience.png", w: 620, h: 560, body: experienceBody },
    { id: "roadmap", title: "Roadmap", icon: "roadmap", image: "./os/icons/roadmap.png", w: 560, h: 540, body: roadmapBody },
    ...D.projects.map((p) => ({ id: p.id, title: p.name, icon: p.icon, image: p.image, live: p.status === "live", w: 540, h: 420, body: () => projectBody(p) })),
    { id: "this-pc", title: "This PC", icon: "me", image: "./os/icons/win-this-pc.png", w: 440, h: 300, body: thisPcBody },
    { id: "recycle-bin", title: "Recycle Bin", icon: "me", image: "./os/icons/win-recycle.png", w: 380, h: 220, body: recycleBody },
  ];
  const byId = (id) => ITEMS.find((i) => i.id === id);

  // ---------- windows ----------
  const layer = $("#windows");
  const wins = new Map();
  let z = 10, active = null;

  function open(id) {
    const item = byId(id);
    if (!item) return;
    if (wins.has(id)) return focus(wins.get(id), true);
    const el = document.createElement("section");
    el.className = "win";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-labelledby", `${id}-t`);
    el.tabIndex = -1;
    el.innerHTML = `
      <header class="win__bar">
        <span class="win__icon">${iconOf(item)}</span>
        <h2 class="win__title" id="${id}-t">${esc(item.title)}</h2>
        <button type="button" class="win__btn" data-act="min" aria-label="Minimise">${UI.min}</button>
        <button type="button" class="win__btn" data-act="max" aria-label="Maximise">${UI.max}</button>
        <button type="button" class="win__btn win__btn--close" data-act="close" aria-label="Close">${UI.close}</button>
      </header>
      <div class="win__body">${item.body()}</div>`;
    layer.append(el);
    const w = { id, item, el, min: false, max: false };
    wins.set(id, w);
    place(w);
    wire(w);
    focus(w);
    anim(el, [{ opacity: 0, transform: "scale(.95)" }, { opacity: 1, transform: "none" }]);
    renderTasks();
  }

  function place(w) {
    if (isNarrow()) { w.max = true; w.el.classList.add("is-max"); return; }
    const a = layer.getBoundingClientRect();
    const width = Math.min(w.item.w, a.width - 32), height = Math.min(w.item.h, a.height - 32);
    const n = wins.size - 1;
    Object.assign(w.el.style, {
      width: `${width}px`, height: `${height}px`,
      left: `${clamp((a.width - width) / 2 + n * 26, 16, a.width - width - 16)}px`,
      top: `${clamp((a.height - height) / 2 + n * 22 - 30, 12, a.height - height - 12)}px`,
    });
  }

  function focus(w, show) {
    if (show && w.min) { w.min = false; w.el.hidden = false; anim(w.el, [{ opacity: 0, transform: "translateY(30px)" }, { opacity: 1, transform: "none" }]); }
    w.el.style.zIndex = ++z;
    $$(".win.is-active").forEach((e) => e.classList.remove("is-active"));
    w.el.classList.add("is-active");
    active = w;
    if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
    renderTasks();
  }

  async function minimise(w) {
    await anim(w.el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(40px) scale(.9)" }], { easing: "ease-in" });
    w.min = true; w.el.hidden = true;
    if (active === w) active = null;
    renderTasks();
  }

  async function close(w) {
    await anim(w.el, [{ opacity: 1 }, { opacity: 0, transform: "scale(.96)" }], { duration: 110, easing: "ease-in" });
    w.el.remove();
    wins.delete(w.id);
    if (active === w) active = null;
    const top = [...wins.values()].filter((x) => !x.min).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    if (top) focus(top); else renderTasks();
  }

  function toggleMax(w) {
    if (isNarrow()) return;
    w.max = !w.max;
    w.el.classList.toggle("is-max", w.max);
  }

  function wire(w) {
    const { el } = w;
    const bar = $(".win__bar", el);
    el.addEventListener("pointerdown", () => { if (active !== w) focus(w); });
    el.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]")?.dataset.act;
      if (act === "min") minimise(w);
      if (act === "max") toggleMax(w);
      if (act === "close") close(w);
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Escape") close(w); });
    bar.addEventListener("dblclick", (e) => { if (!e.target.closest("button")) toggleMax(w); });
    bar.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button") || w.max || isNarrow()) return;
      const sx = e.clientX, sy = e.clientY, sl = el.offsetLeft, st = el.offsetTop, a = layer.getBoundingClientRect();
      bar.setPointerCapture(e.pointerId);
      document.body.classList.add("is-dragging");
      const move = (ev) => {
        el.style.left = `${clamp(sl + ev.clientX - sx, -el.offsetWidth + 100, a.width - 100)}px`;
        el.style.top = `${clamp(st + ev.clientY - sy, 0, a.height - 36)}px`;
      };
      const up = () => { bar.removeEventListener("pointermove", move); document.body.classList.remove("is-dragging"); };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up, { once: true });
      bar.addEventListener("pointercancel", up, { once: true });
    });
  }

  // ---------- window contents ----------
  function meBody() {
    const live = D.projects.filter((p) => p.status === "live");
    return `<div class="pad">
      <div class="who"><span class="who__pic">${iconOf(byId("me"))}</span><div><h3>${esc(D.name)}</h3><p>${esc(D.role)}</p><p class="muted">${esc(D.place)}</p></div></div>
      <p>${esc(D.bio)}</p>
      <h4>Running right now</h4>
      <ul class="rows">${live.map((p) => `<li><span class="rows__pic">${iconOf(p)}</span><span><b>${esc(p.name)}</b><small>${esc(p.where)}</small></span><a class="btn btn--accent" href="${esc(p.live)}" target="_blank" rel="noopener">Open ${UI.external}</a></li>`).join("")}</ul>
    </div>`;
  }

  function contactBody() {
    return `<div class="pad"><p class="muted">Open to cloud, DevOps and AI automation roles.</p>
      <ul class="links">${D.links.map((l) => `<li><span>${esc(l.label)}</span><a href="${esc(l.href)}"${ext(l.href)}>${esc(l.text)}</a></li>`).join("")}</ul></div>`;
  }

  function experienceBody() {
    return `<div class="pad"><ol class="timeline">${D.jobs.map((j) => `
      <li><p class="muted small">${esc(j.when)}</p><h4>${esc(j.role)}</h4><p class="muted">${esc(j.org)}</p>
      <ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></li>`).join("")}</ol></div>`;
  }

  function roadmapBody() {
    return `<div class="pad">
      <ol class="steps">${D.roadmap.map((r, i) => `<li class="${r.now ? "is-now" : ""}"><span class="steps__n">${i + 1}</span><div><p class="muted small">${esc(r.when)}${r.now ? ", in progress" : ""}</p><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p></div></li>`).join("")}</ol>
      <h4>Certifications</h4><ul class="points">${D.certs.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>`;
  }

  function thisPcBody() {
    return `<div class="pad"><h4>ChaseOS</h4>
      <ul class="links"><li><span>Built with</span><span>Plain HTML, CSS and JavaScript</span></li><li><span>Background</span><span>WebGL, drawn live</span></li><li><span>Hosted on</span><span>GitHub Pages</span></li><li><span>Source</span><a href="https://github.com/chase5ws/chase5ws" target="_blank" rel="noopener">chase5ws/chase5ws</a></li></ul></div>`;
  }

  function recycleBody() {
    return `<div class="pad empty"><p>The Recycle Bin is empty.</p><p class="muted small">Every project here is still running.</p></div>`;
  }

  function projectBody(p) {
    return `<div class="pad">
      <div class="who"><span class="who__pic">${iconOf(p)}</span><div><h3>${esc(p.name)}</h3><p class="status status--${p.status}"><span class="dot" aria-hidden="true"></span>${esc(STATUS[p.status])}${p.where ? `, ${esc(p.where)}` : ""}</p></div></div>
      <p class="lede">${esc(p.summary)}</p>
      ${p.points.length ? `<ul class="points">${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      <p class="muted">Built with ${esc(p.stack)}</p>
      <div class="actions">
        ${p.live ? `<a class="btn btn--accent" href="${esc(p.live)}" target="_blank" rel="noopener">Open the live site ${UI.external}</a>` : ""}
        ${p.source ? `<a class="btn" href="${esc(p.source)}" target="_blank" rel="noopener">Source ${UI.external}</a>` : ""}
      </div>
    </div>`;
  }

  // ---------- desktop icons ----------
  const icons = $("#icons");
  icons.innerHTML = ITEMS.map((i) => `<li><button type="button" class="dicon" data-id="${i.id}"><span class="dicon__img">${iconOf(i)}${i.live ? '<span class="dicon__live">LIVE</span>' : ""}</span><span class="dicon__label">${esc(i.title)}</span></button></li>`).join("");
  icons.addEventListener("dblclick", (e) => { const b = e.target.closest(".dicon"); if (b) open(b.dataset.id); });
  icons.addEventListener("click", (e) => {
    const b = e.target.closest(".dicon");
    if (!b) return;
    $$(".dicon.is-selected").forEach((x) => x.classList.remove("is-selected"));
    b.classList.add("is-selected");
    if (e.detail === 0 || matchMedia("(pointer: coarse)").matches) open(b.dataset.id); // Enter key or touch
  });
  $("#desktop").addEventListener("pointerdown", (e) => { if (!e.target.closest(".dicon")) $$(".dicon.is-selected").forEach((x) => x.classList.remove("is-selected")); });

  // ---------- start menu ----------
  const start = $("#start"), startBtn = $("#start-btn");
  startBtn.innerHTML = `<img src="./os/icons/start.png" alt="" draggable="false" class="pixel">`;
  $("#start-list").innerHTML = ITEMS.map((i) => `<li><button type="button" data-id="${i.id}">${iconOf(i)}<span>${esc(i.title)}</span></button></li>`).join("");
  const setStart = (on) => {
    start.hidden = !on; startBtn.setAttribute("aria-expanded", String(on));
    if (on) { anim(start, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 180 }); $("button", start).focus(); }
  };
  startBtn.addEventListener("click", () => setStart(start.hidden));
  start.addEventListener("click", (e) => { const id = e.target.closest("[data-id]")?.dataset.id; if (id) { setStart(false); open(id); } });
  document.addEventListener("pointerdown", (e) => { if (!start.hidden && !e.target.closest("#start, #start-btn")) setStart(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !start.hidden) { setStart(false); startBtn.focus(); } });

  // The taskbar stays minimal (start + clock); a minimised window comes back from its desktop icon.
  function renderTasks() {}

  const tick = () => {
    const d = new Date();
    $("#clock").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    $("#clock").title = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    $("#clock").dateTime = d.toISOString();
  };
  tick(); setInterval(tick, 15000);

  // The desktop starts empty; a link like #roadmap opens that window.
  const hash = location.hash.slice(1);
  if (byId(hash)) open(hash);
})();
