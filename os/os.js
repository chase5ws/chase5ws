// ChaseOS XP: a simple retro desktop. One icon, one thing.
// Content comes from data.js (window.CHASE), icons from pixels.js (window.PIXELS).
(() => {
  const D = window.CHASE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isNarrow = () => matchMedia("(max-width: 720px)").matches;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  const ext = (href) => (href.startsWith("http") ? ' target="_blank" rel="noopener"' : "");

  // Render a 16×16 pixel icon as crisp SVG (runs of one colour become one rect).
  function pix(name) {
    const P = window.PIXELS[name];
    if (!P) return "";
    let rects = "";
    P.a.forEach((row, y) => {
      for (let x = 0; x < row.length; ) {
        const ch = row[x];
        let end = x;
        while (end + 1 < row.length && row[end + 1] === ch) end++;
        if (ch !== ".") rects += `<rect x="${x}" y="${y}" width="${end - x + 1}" height="1" fill="${P.p[ch]}"/>`;
        x = end + 1;
      }
    });
    return `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }
  const STATUS = { live: "Live", source: "Source on GitHub", private: "Private repo", building: "Building" };

  // ---------- desktop items: each icon is one thing ----------
  const ITEMS = [
    { id: "me", title: "Me", icon: "me", w: 460, h: 360, body: meBody },
    { id: "contact", title: "Contact", icon: "contact", w: 400, h: 260, body: contactBody },
    { id: "experience", title: "Experience", icon: "experience", w: 600, h: 520, body: experienceBody },
    { id: "roadmap", title: "Roadmap", icon: "roadmap", w: 540, h: 520, body: roadmapBody },
    ...D.projects.map((p) => ({ id: p.id, title: p.name, icon: p.icon, live: p.status === "live", w: 520, h: 380, body: () => projectBody(p) })),
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
        <span class="win__icon">${pix(item.icon)}</span>
        <h2 class="win__title" id="${id}-t">${esc(item.title)}</h2>
        <button type="button" class="xp-btn" data-act="min" aria-label="Minimise"><i class="g-min"></i></button>
        <button type="button" class="xp-btn" data-act="max" aria-label="Maximise"><i class="g-max"></i></button>
        <button type="button" class="xp-btn xp-btn--close" data-act="close" aria-label="Close"><i class="g-close"></i></button>
      </header>
      <div class="win__body">${item.body()}</div>`;
    layer.append(el);
    const w = { id, item, el, min: false, max: false };
    wins.set(id, w);
    place(w);
    wire(w);
    focus(w);
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
    if (show && w.min) { w.min = false; w.el.hidden = false; }
    w.el.style.zIndex = ++z;
    $$(".win.is-active").forEach((e) => e.classList.remove("is-active"));
    w.el.classList.add("is-active");
    active = w;
    if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
    renderTasks();
  }

  function minimise(w) {
    w.min = true; w.el.hidden = true;
    if (active === w) active = null;
    renderTasks();
  }

  function close(w) {
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
    $('[data-act="max"]', w.el).setAttribute("aria-label", w.max ? "Restore" : "Maximise");
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
      const go = e.target.closest("[data-open]")?.dataset.open;
      if (go) open(go);
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
        el.style.top = `${clamp(st + ev.clientY - sy, 0, a.height - 30)}px`;
      };
      const up = () => { bar.removeEventListener("pointermove", move); document.body.classList.remove("is-dragging"); };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up, { once: true });
      bar.addEventListener("pointercancel", up, { once: true });
    });
  }

  // ---------- window contents ----------
  function meBody() {
    return `<div class="pad">
      <div class="who"><span class="who__pic">${pix("me")}</span><div><h3>${esc(D.name)}</h3><p>${esc(D.role)}</p><p class="muted">${esc(D.place)}</p></div></div>
      <p>${esc(D.bio)}</p>
      <fieldset class="group"><legend>Running right now</legend>
        <ul class="rows">${D.projects.filter((p) => p.live).map((p) => `<li><span class="dot" aria-hidden="true"></span><span>${esc(p.name)} <small class="muted">${esc(p.where)}</small></span><a class="xp-button" href="${esc(p.live)}" target="_blank" rel="noopener">Open</a></li>`).join("")}</ul>
      </fieldset>
    </div>`;
  }

  function contactBody() {
    return `<div class="pad"><p>Open to cloud, DevOps and AI automation roles.</p>
      <table class="kv">${D.links.map((l) => `<tr><th>${esc(l.label)}</th><td><a href="${esc(l.href)}"${ext(l.href)}>${esc(l.text)}</a></td></tr>`).join("")}</table></div>`;
  }

  function experienceBody() {
    return `<div class="pad">${D.jobs.map((j) => `
      <fieldset class="group"><legend>${esc(j.when)}</legend>
        <h4>${esc(j.role)}</h4><p class="muted">${esc(j.org)}</p>
        <ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </fieldset>`).join("")}</div>`;
  }

  function roadmapBody() {
    return `<div class="pad">
      <ol class="steps">${D.roadmap.map((r, i) => `<li class="${r.now ? "is-now" : ""}"><b class="steps__n">${i + 1}</b><div><h4>${esc(r.title)} <small class="muted">${esc(r.when)}${r.now ? ", in progress" : ""}</small></h4><p>${esc(r.text)}</p></div></li>`).join("")}</ol>
      <fieldset class="group"><legend>Certifications</legend><ul>${D.certs.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></fieldset>
    </div>`;
  }

  function projectBody(p) {
    return `<div class="pad">
      <div class="who"><span class="who__pic">${pix(p.icon)}</span><div><h3>${esc(p.name)}</h3><p class="status status--${p.status}"><span class="dot" aria-hidden="true"></span>${esc(STATUS[p.status])}${p.where ? `, ${esc(p.where)}` : ""}</p></div></div>
      <p>${esc(p.summary)}</p>
      ${p.points.length ? `<ul>${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      <p class="muted">Built with ${esc(p.stack)}</p>
      <div class="actions">
        ${p.live ? `<a class="xp-button xp-button--go" href="${esc(p.live)}" target="_blank" rel="noopener">Open the live site</a>` : ""}
        ${p.source ? `<a class="xp-button" href="${esc(p.source)}" target="_blank" rel="noopener">Source on GitHub</a>` : ""}
      </div>
    </div>`;
  }

  // ---------- desktop icons ----------
  const icons = $("#icons");
  icons.innerHTML = ITEMS.map((i) => `<li><button type="button" class="dicon" data-id="${i.id}"><span class="dicon__img">${pix(i.icon)}${i.live ? '<span class="dicon__live">LIVE</span>' : ""}</span><span class="dicon__label">${esc(i.title)}</span></button></li>`).join("");
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
  $("#start-pic").innerHTML = pix("me");
  $("#start-left").innerHTML = ITEMS.map((i) => `<li><button type="button" data-id="${i.id}">${pix(i.icon)}<span>${esc(i.title)}</span></button></li>`).join("");
  $("#start-right").innerHTML = `<li class="start__h">Live sites</li>` + D.projects.filter((p) => p.live).map((p) => `<li><a href="${esc(p.live)}" target="_blank" rel="noopener">${pix(p.icon)}<span>${esc(p.name)}</span></a></li>`).join("")
    + `<li class="start__sep" role="separator"></li>` + D.links.map((l) => `<li><a href="${esc(l.href)}"${ext(l.href)}><span>${esc(l.label)}</span></a></li>`).join("");
  $("#start-btn-icon").innerHTML = pix("start");
  const setStart = (on) => {
    start.hidden = !on;
    startBtn.setAttribute("aria-expanded", String(on));
    if (on) $("button", start).focus();
  };
  startBtn.addEventListener("click", () => setStart(start.hidden));
  start.addEventListener("click", (e) => { const id = e.target.closest("[data-id]")?.dataset.id; if (id) { setStart(false); open(id); } });
  document.addEventListener("pointerdown", (e) => { if (!start.hidden && !e.target.closest("#start, #start-btn")) setStart(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !start.hidden) { setStart(false); startBtn.focus(); } });

  // ---------- taskbar ----------
  const tasks = $("#tasks");
  function renderTasks() {
    tasks.innerHTML = [...wins.values()].map((w) => `<li><button type="button" class="task${active === w && !w.min ? " is-active" : ""}" data-id="${w.id}">${pix(w.item.icon)}<span>${esc(w.item.title)}</span></button></li>`).join("");
  }
  tasks.addEventListener("click", (e) => {
    const w = wins.get(e.target.closest("[data-id]")?.dataset.id);
    if (!w) return;
    if (active === w && !w.min) minimise(w); else focus(w, true);
  });

  const tick = () => {
    const d = new Date();
    $("#clock").textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    $("#clock").dateTime = d.toISOString();
    $("#clock").title = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };
  tick(); setInterval(tick, 15000);

  // Only a link like #roadmap opens a window on load; otherwise the desktop starts empty.
  const hash = location.hash.slice(1);
  if (byId(hash)) open(hash);
})();
