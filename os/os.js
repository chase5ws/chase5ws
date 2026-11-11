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
    { id: "stats", title: "Languages & activity", icon: "me", image: "./os/icons/stats.png", w: 540, h: 560, body: statsBody },
    ...D.projects.map((p) => ({ id: p.id, title: p.name, icon: p.icon, image: p.image, folder: p.status === "live" ? "live" : "dev", desktop: false, w: 540, h: 420, body: () => projectBody(p) })),
    { id: "live", title: "Live projects", icon: "me", image: "./os/icons/folder.png", live: true, w: 520, h: 300, body: () => folderBody("live") },
    { id: "dev", title: "In progress", icon: "me", image: "./os/icons/folder.png", w: 520, h: 300, body: () => folderBody("dev") },
    { id: "this-pc", title: "Chase.Tseng", icon: "me", image: "./os/icons/win-this-pc.png", desktop: false, w: 440, h: 300, body: thisPcBody }, // opened from the taskbar
    // small JS games anyone can play in a window (games/, credits in NOTICE.md)
    // Nothing of a game loads until its Start button is pressed.
    { id: "doom", title: "Doom", icon: "me", image: "./os/icons/doom.png", frame: "./games/doom/index.html?wad=wad/freedoom1.wad", mouse: true, w: 860, h: 560,
      note: "Freedoom levels, about 35 MB the first time, cached after that.",
      keys: [["W A S D", "Move"], ["Mouse", "Look around (click the game first)"], ["Left click / Q", "Fire"], ["E", "Open doors, press switches"], ["Shift (hold)", "Run"], ["Space", "Jump"], ["F / G", "Previous / next weapon"], ["Tab", "Map"], ["Esc", "Pause and free the mouse"]] },
    { id: "duel", title: "Samurai Duel", icon: "me", image: "./os/icons/duel.png", frame: "./games/fight/index.html", w: 860, h: 520,
      note: "Play the computer, or two players on one keyboard.",
      keys: [["A / D", "Player 1 move"], ["W", "Player 1 jump"], ["Space", "Player 1 attack"], ["← / →", "Player 2 move"], ["↑", "Player 2 jump"], ["↓", "Player 2 attack"]] },
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
      <div class="win__body${item.frame ? " win__body--frame" : ""}">${item.frame ? launchBody(item) : item.body()}</div>`;
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
    const frame = w.el.querySelector("iframe");
    if (frame) frame.focus(); else if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
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
    el.addEventListener("dblclick", (e) => { const b = e.target.closest("[data-open]"); if (b) open(b.dataset.open); });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-open]");
      if (!b) return;
      $$(".is-selected", el).forEach((x) => x.classList.remove("is-selected"));
      b.classList.add("is-selected");
      if (e.detail === 0 || matchMedia("(pointer: coarse)").matches) open(b.dataset.open);
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Escape") close(w); });
    el.addEventListener("click", (e) => { if (e.target.closest("[data-launch]")) launch(w); });
    el.addEventListener("input", (e) => { const r = e.target.closest("[data-mouse]"); if (r) r.nextElementSibling.textContent = `${Number(r.value).toFixed(2)}×`; });
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

  // ---------- game launcher: controls, mouse speed, then Start loads the game ----------
  const MOUSE_KEY = "chaseos.doom.mouse";
  const savedMouse = () => { try { const v = parseFloat(localStorage.getItem(MOUSE_KEY)); return v >= 0.5 && v <= 4 ? v : 2; } catch { return 2; } };
  function launchBody(item) {
    const m = savedMouse();
    return `<div class="launch">
      <div class="launch__head"><span class="launch__pic">${iconOf(item)}</span><div><h3>${esc(item.title)}</h3><p class="muted small">${esc(item.note)}</p></div></div>
      <table class="keys">${item.keys.map(([k, what]) => `<tr><td><kbd>${esc(k)}</kbd></td><td>${esc(what)}</td></tr>`).join("")}</table>
      ${item.mouse ? `<label class="launch__mouse">Mouse speed <input type="range" min="0.5" max="4" step="0.25" value="${m}" data-mouse> <output>${m.toFixed(2)}×</output></label>` : ""}
      <button type="button" class="btn btn--accent launch__go" data-launch>▶ Start</button>
    </div>`;
  }
  function launch(w) {
    const body = $(".win__body", w.el), item = w.item;
    let src = item.frame;
    if (item.mouse) {
      const m = parseFloat($("[data-mouse]", body)?.value) || savedMouse();
      try { localStorage.setItem(MOUSE_KEY, String(m)); } catch {}
      src += (src.includes("?") ? "&" : "?") + "mouse=" + m;
    }
    body.innerHTML = `<iframe class="win__frame" src="${esc(src)}" title="${esc(item.title)}" allow="fullscreen; gamepad; autoplay"></iframe>`;
    $("iframe", body).focus();
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

  // Projects sit in two folders, live and in progress; each still opens its own window.
  function folderBody(kind) {
    const inside = ITEMS.filter((i) => i.folder === kind);
    return `<ul class="folder" aria-label="${kind === "live" ? "Live projects" : "Projects in progress"}">${inside.map((i) => `<li><button type="button" class="dicon dicon--dark" data-open="${i.id}"><span class="dicon__img">${iconOf(i)}</span><span class="dicon__label">${esc(i.title)}</span></button></li>`).join("")}</ul>`;
  }

  // The same card as the GitHub profile README, rebuilt daily by the Metrics workflow.
  function statsBody() {
    return `<div class="pad"><p class="muted small">Recent activity, repositories and languages, refreshed daily from GitHub.</p>
      <div class="stats-card"><img src="./metrics/general.svg" alt="GitHub overview, calendar and languages for chase5ws" width="480" onerror="this.onerror=null;this.src='./metrics/profile.svg'"></div></div>`;
  }

  function thisPcBody() {
    return `<div class="pad"><h4>ChaseOS</h4>
      <ul class="links"><li><span>Built with</span><span>Plain HTML, CSS and JavaScript</span></li><li><span>Background</span><span>Night sky, looping video</span></li><li><span>Hosted on</span><span>GitHub Pages</span></li><li><span>Source</span><a href="https://github.com/chase5ws/chase5ws" target="_blank" rel="noopener">chase5ws/chase5ws</a></li></ul></div>`;
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
  // desktop order, top to bottom then the next column
  const ORDER = ["me", "contact", "experience", "stats", "doom", "duel", "roadmap", "dev", "live"];
  const rank = (i) => { const n = ORDER.indexOf(i.id); return n < 0 ? ORDER.length : n; };
  icons.innerHTML = ITEMS.filter((i) => i.desktop !== false).sort((a, b) => rank(a) - rank(b)).map((i) => `<li><button type="button" class="dicon" data-id="${i.id}"><span class="dicon__img">${iconOf(i)}${i.live ? '<span class="dicon__live">LIVE</span>' : ""}${i.frame ? '<span class="dicon__play">PLAY</span>' : ""}</span><span class="dicon__label">${esc(i.title)}</span></button></li>`).join("");
  icons.addEventListener("dblclick", (e) => { const b = e.target.closest(".dicon"); if (b) open(b.dataset.id); });
  icons.addEventListener("click", (e) => {
    const b = e.target.closest(".dicon");
    if (!b) return;
    $$(".dicon.is-selected").forEach((x) => x.classList.remove("is-selected"));
    b.classList.add("is-selected");
    if (e.detail === 0 || matchMedia("(pointer: coarse)").matches) open(b.dataset.id); // Enter key or touch
  });
  $("#desktop").addEventListener("pointerdown", (e) => { if (!e.target.closest(".dicon")) $$(".dicon.is-selected").forEach((x) => x.classList.remove("is-selected")); });

  // Taskbar: the name on the left opens the "This PC" window
  $("#tb-name").addEventListener("click", () => open("this-pc"));

  // A click inside a game window lands in its iframe: bring that window to the front too.
  addEventListener("blur", () => setTimeout(() => {
    const f = document.activeElement;
    if (f && f.tagName === "IFRAME") { const w = [...wins.values()].find((x) => x.el.contains(f)); if (w && active !== w) focus(w); }
  }));

  // The taskbar stays minimal (start + clock); a minimised window comes back from its desktop icon.
  // It does tell the pixel zoo (zoo.js) which window is in front, so the animals can change.
  function renderTasks() {
    const id = active && !active.min ? active.id : null;
    if (id === window.CHASEOS_ACTIVE) return;
    window.CHASEOS_ACTIVE = id;
    document.dispatchEvent(new CustomEvent("chaseos:active", { detail: id }));
  }

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
