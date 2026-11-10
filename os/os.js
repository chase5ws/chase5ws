// ChaseOS: a small desktop in the browser. Content comes from data.js (window.CHASE).
(() => {
  const D = window.CHASE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => matchMedia("(max-width: 720px)").matches;

  // ---------- icons (drawn for this site) ----------
  const ICON = {
    logo: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent)"/><path d="M15.5 8.6a4.6 4.6 0 1 0 0 6.8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    about: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="7" fill="#4f8cff"/><circle cx="16" cy="13" r="5" fill="#fff"/><path d="M7.5 26c1.6-4.4 4.8-6.4 8.5-6.4s6.9 2 8.5 6.4" fill="#fff"/></svg>`,
    folder: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 8a3 3 0 0 1 3-3h6l3 3h11a3 3 0 0 1 3 3v1H3z" fill="#e8a317"/><rect x="3" y="10" width="26" height="17" rx="3" fill="#ffc83d"/></svg>`,
    briefcase: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" fill="none" stroke="#7a4f2a" stroke-width="2"/><rect x="3" y="9" width="26" height="18" rx="4" fill="#a8693a"/><rect x="3" y="15" width="26" height="3" fill="#8c5530"/><rect x="14" y="14" width="4" height="5" rx="1" fill="#f3d9a8"/></svg>`,
    map: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="7" fill="#22a06b"/><path d="M9 23V9m0 0h11l-2.5 3.5L20 16H9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
    terminal: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="5" width="26" height="22" rx="5" fill="#1f2430"/><path d="M9 12l4 4-4 4" fill="none" stroke="#7ee787" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 20h7" stroke="#c9d1d9" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    browser: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#0ea5a4"/><path d="M3 16h26M16 3c4 4 4 22 0 26M16 3c-4 4-4 22 0 26" fill="none" stroke="#e6fffb" stroke-width="1.8"/></svg>`,
    link: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="6" fill="#fff" stroke="#c7cdd6"/><circle cx="16" cy="16" r="7" fill="#0ea5a4"/><path d="M9 16h14M16 9c2.4 2 2.4 12 0 14M16 9c-2.4 2-2.4 12 0 14" fill="none" stroke="#e6fffb" stroke-width="1.3"/><path d="M5 27l6-6M5 27h5M5 27v-5" stroke="#3b82f6" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
    file: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 3h11l7 7v17a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#fff" stroke="#b8c0cc"/><path d="M19 3v7h7" fill="#e5e9f0" stroke="#b8c0cc"/></svg>`,
    search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    min: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" stroke="currentColor" stroke-width="1.2"/></svg>`,
    max: `<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`,
    close: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" stroke-width="1.2"/></svg>`,
    external: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 3h4v4M13 3L7.5 8.5M12 9.5V13H3V4h3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    power: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M7 6.5a7 7 0 1 0 10 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  };
  const STATUS = { live: "Live", source: "Source only", private: "Private repo", building: "Building" };

  // ---------- apps ----------
  const APPS = {
    about: { title: "About Chase", icon: "about", w: 560, h: 600, render: renderAbout },
    projects: { title: "Projects", icon: "folder", w: 900, h: 580, render: renderProjects },
    experience: { title: "Experience", icon: "briefcase", w: 680, h: 560, render: renderExperience },
    roadmap: { title: "Roadmap", icon: "map", w: 620, h: 560, render: renderRoadmap },
    terminal: { title: "Terminal", icon: "terminal", w: 640, h: 420, render: renderTerminal },
    browser: { title: "Browser", icon: "browser", w: 960, h: 640, render: renderBrowser, multi: true },
  };
  const DESKTOP = ["about", "projects", "experience", "roadmap", "terminal", "browser"];
  const PINNED = ["projects", "about", "experience", "terminal", "browser"];
  const liveProjects = () => D.projects.filter((p) => p.live);

  // ---------- window manager ----------
  const layer = $("#windows");
  const wins = new Map(); // key -> { el, app, key, minimized, max, restore }
  let z = 10, seq = 0, active = null;

  function openApp(appId, opts = {}) {
    const app = APPS[appId];
    if (!app) return;
    const key = app.multi ? `${appId}-${++seq}` : appId;
    if (!app.multi && wins.has(key)) {
      const w = wins.get(key);
      if (opts.select && w.select) w.select(opts.select);
      return focusWin(w, true);
    }
    const el = document.createElement("section");
    el.className = "win";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-labelledby", `${key}-title`);
    el.tabIndex = -1;
    el.innerHTML = `
      <header class="win__bar">
        <span class="win__icon">${ICON[app.icon]}</span>
        <h2 class="win__title" id="${key}-title">${esc(opts.title || app.title)}</h2>
        <div class="win__ctrls">
          <button type="button" class="win__btn" data-act="min" aria-label="Minimise">${ICON.min}</button>
          <button type="button" class="win__btn" data-act="max" aria-label="Maximise">${ICON.max}</button>
          <button type="button" class="win__btn win__btn--close" data-act="close" aria-label="Close">${ICON.close}</button>
        </div>
      </header>
      <div class="win__body"></div>
      <div class="win__grip" aria-hidden="true"></div>`;
    layer.append(el);
    const w = { el, app, key, appId, minimized: false, max: false };
    wins.set(key, w);
    place(w, opts);
    app.render($(".win__body", el), w, opts);
    wire(w);
    focusWin(w, true);
    if (!reduceMotion) el.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" });
    renderTaskbar();
    return w;
  }

  function place(w, opts) {
    const area = layer.getBoundingClientRect();
    if (isNarrow()) { setMax(w, true); return; }
    const width = Math.min(w.app.w, area.width - 24), height = Math.min(w.app.h, area.height - 24);
    const n = wins.size - 1;
    const left = opts.left ?? Math.max(12, (area.width - width) / 2 + n * 28 - 60);
    const top = opts.top ?? Math.max(12, (area.height - height) / 2 + n * 24 - 40);
    Object.assign(w.el.style, { width: `${width}px`, height: `${height}px`, left: `${Math.min(left, area.width - width - 12)}px`, top: `${Math.min(top, area.height - height - 12)}px` });
  }

  function focusWin(w, show) {
    if (show && w.minimized) { w.minimized = false; w.el.hidden = false; }
    w.el.style.zIndex = ++z;
    document.querySelectorAll(".win.is-active").forEach((e) => e.classList.remove("is-active"));
    w.el.classList.add("is-active");
    active = w;
    if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
    renderTaskbar();
  }

  function minimize(w) {
    w.minimized = true; w.el.hidden = true;
    if (active === w) active = null;
    renderTaskbar();
  }

  function setMax(w, on) {
    if (on && !w.max) w.restore = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height };
    w.max = on;
    w.el.classList.toggle("is-max", on);
    if (!on && w.restore) Object.assign(w.el.style, w.restore);
    $('[data-act="max"]', w.el)?.setAttribute("aria-label", on ? "Restore" : "Maximise");
  }

  function closeWin(w) {
    w.onClose?.();
    w.el.remove();
    wins.delete(w.key);
    if (active === w) active = null;
    const top = [...wins.values()].filter((x) => !x.minimized).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    if (top) focusWin(top); else renderTaskbar();
  }

  function wire(w) {
    const { el } = w;
    const bar = $(".win__bar", el);
    el.addEventListener("pointerdown", () => { if (active !== w) focusWin(w); });
    el.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]")?.dataset.act;
      if (act === "min") minimize(w);
      if (act === "max") setMax(w, !w.max);
      if (act === "close") closeWin(w);
    });
    bar.addEventListener("dblclick", (e) => { if (!e.target.closest("button") && !isNarrow()) setMax(w, !w.max); });
    el.addEventListener("keydown", (e) => { if (e.key === "Escape" && e.target.tagName !== "INPUT") closeWin(w); });

    drag(bar, (dx, dy, start) => {
      if (w.max || isNarrow()) return false;
      const area = layer.getBoundingClientRect();
      el.style.left = `${Math.min(Math.max(start.left + dx, -el.offsetWidth + 120), area.width - 120)}px`;
      el.style.top = `${Math.min(Math.max(start.top + dy, 0), area.height - 40)}px`;
    }, () => ({ left: el.offsetLeft, top: el.offsetTop }));

    drag($(".win__grip", el), (dx, dy, start) => {
      if (w.max) return false;
      el.style.width = `${Math.max(320, start.w + dx)}px`;
      el.style.height = `${Math.max(220, start.h + dy)}px`;
    }, () => ({ w: el.offsetWidth, h: el.offsetHeight }));
  }

  function drag(handle, onMove, getStart) {
    handle.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      const sx = e.clientX, sy = e.clientY, start = getStart();
      handle.setPointerCapture(e.pointerId);
      document.body.classList.add("is-dragging");
      const move = (ev) => onMove(ev.clientX - sx, ev.clientY - sy, start);
      const up = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        document.body.classList.remove("is-dragging");
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
    });
  }

  // ---------- taskbar ----------
  const tasks = $("#tasks");
  function renderTaskbar() {
    const running = [...wins.values()];
    const ids = [...PINNED, ...running.map((w) => w.appId).filter((id) => !PINNED.includes(id))];
    tasks.innerHTML = [...new Set(ids)].map((id) => {
      const mine = running.filter((w) => w.appId === id);
      const isActive = active && active.appId === id && !active.minimized;
      const state = mine.length ? (isActive ? " is-active" : " is-open") : "";
      return `<li><button type="button" class="task${state}" data-app="${id}" aria-label="${esc(APPS[id].title)}${mine.length ? " (open)" : ""}" title="${esc(APPS[id].title)}">${ICON[APPS[id].icon]}</button></li>`;
    }).join("");
  }
  tasks.addEventListener("click", (e) => {
    const id = e.target.closest("[data-app]")?.dataset.app;
    if (!id) return;
    closeStart();
    const mine = [...wins.values()].filter((w) => w.appId === id);
    if (!mine.length) return openApp(id);
    const w = mine.sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    if (active === w && !w.minimized) minimize(w); else focusWin(w, true);
  });

  // ---------- clock ----------
  function tick() {
    const d = new Date();
    $("#clock-time").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    $("#clock-date").textContent = d.toLocaleDateString();
    $("#clock").dateTime = d.toISOString();
  }
  tick(); setInterval(tick, 15000);

  // ---------- start menu ----------
  const start = $("#start"), startBtn = $("#start-btn"), search = $("#start-search");
  function openStart() {
    start.hidden = false; startBtn.setAttribute("aria-expanded", "true");
    search.value = ""; renderStart(""); search.focus();
  }
  function closeStart() {
    if (start.hidden) return;
    start.hidden = true; startBtn.setAttribute("aria-expanded", "false");
  }
  startBtn.addEventListener("click", () => (start.hidden ? openStart() : closeStart()));
  $("#search-btn").addEventListener("click", openStart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !start.hidden) { closeStart(); startBtn.focus(); } });
  document.addEventListener("pointerdown", (e) => { if (!start.hidden && !start.contains(e.target) && !e.target.closest("#start-btn, #search-btn")) closeStart(); });
  search.addEventListener("input", () => renderStart(search.value.trim().toLowerCase()));
  search.addEventListener("keydown", (e) => { if (e.key === "Enter") $("#start [data-open]")?.click(); });

  function renderStart(q) {
    const apps = Object.entries(APPS).filter(([, a]) => !q || a.title.toLowerCase().includes(q));
    const projects = D.projects.filter((p) => !q || `${p.name} ${p.summary} ${p.stack}`.toLowerCase().includes(q));
    $("#start-pinned").innerHTML = apps.map(([id, a]) =>
      `<li><button type="button" class="tile" data-open="app:${id}">${ICON[a.icon]}<span>${esc(a.title)}</span></button></li>`).join("") || `<li class="muted">No apps match.</li>`;
    $("#start-rec").innerHTML = projects.map((p) =>
      `<li><button type="button" class="rec" data-open="project:${p.id}">${ICON[p.live ? "link" : "file"]}<span><b>${esc(p.name)}</b><small>${esc(STATUS[p.status])}${p.where ? `, ${esc(p.where)}` : ""}</small></span></button></li>`).join("") || `<li class="muted">No projects match.</li>`;
  }
  start.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open]")?.dataset.open;
    if (!t) return;
    const [kind, id] = t.split(":");
    closeStart();
    if (kind === "app") openApp(id);
    else openApp("projects", { select: id });
  });
  $("#restart").addEventListener("click", () => location.reload());

  // ---------- desktop ----------
  const icons = $("#icons");
  icons.innerHTML = [
    ...DESKTOP.map((id) => ({ open: `app:${id}`, icon: APPS[id].icon, label: APPS[id].title })),
    ...liveProjects().map((p) => ({ open: `url:${p.id}`, icon: "link", label: p.name })),
  ].map((i) => `<li><button type="button" class="dicon" data-open="${i.open}">${ICON[i.icon]}<span>${esc(i.label)}</span></button></li>`).join("");
  function openTarget(t) {
    const [kind, id] = t.split(":");
    if (kind === "app") return openApp(id);
    const p = D.projects.find((x) => x.id === id);
    if (p) openBrowser(p.live, p.name);
  }
  icons.addEventListener("dblclick", (e) => { const b = e.target.closest("[data-open]"); if (b) openTarget(b.dataset.open); });
  icons.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (!b) return;
    icons.querySelectorAll(".is-selected").forEach((x) => x.classList.remove("is-selected"));
    b.classList.add("is-selected");
    if (e.detail === 0 || matchMedia("(pointer: coarse)").matches) openTarget(b.dataset.open); // keyboard Enter or touch
  });

  // widget: live sites
  $("#widget-rows").innerHTML = liveProjects().map((p) => `
    <li>
      <span class="dot" aria-hidden="true"></span>
      <span class="w-name"><b>${esc(p.name)}</b><small>${esc(p.where)}</small></span>
      <button type="button" class="w-open" data-url="${p.id}">Open<span class="sr"> ${esc(p.name)} here</span></button>
      <a class="w-ext" href="${esc(p.live)}" target="_blank" rel="noopener" aria-label="Open ${esc(p.name)} in a new tab">${ICON.external}</a>
    </li>`).join("");
  $("#widget-rows").addEventListener("click", (e) => {
    const id = e.target.closest("[data-url]")?.dataset.url;
    const p = D.projects.find((x) => x.id === id);
    if (p) openBrowser(p.live, p.name);
  });

  function openBrowser(url, name) {
    return openApp("browser", { url, title: name ? `${name} — Browser` : "Browser" });
  }

  // ---------- app renderers ----------
  function linkList() {
    return `<ul class="links">${D.links.map((l) => `<li><span>${esc(l.label)}</span><a href="${esc(l.href)}"${l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${esc(l.text)}</a></li>`).join("")}</ul>`;
  }

  function renderAbout(body) {
    body.classList.add("pad", "about");
    body.innerHTML = `
      <div class="about__head">
        <div class="avatar" aria-hidden="true">CT</div>
        <div><h3>${esc(D.name)}</h3><p class="muted">${esc(D.role)}, ${esc(D.place)}</p></div>
      </div>
      <p>${esc(D.bio)}</p>
      <div class="card">
        <h4>Live right now</h4>
        <p class="muted small">Public pages, nothing to sign in to.</p>
        <ul class="plain">${liveProjects().map((p) => `<li><button type="button" class="linkish" data-url="${p.id}">${esc(p.name)}</button> <span class="muted small">${esc(p.where)}</span></li>`).join("")}</ul>
      </div>
      <div class="card"><h4>Get in touch</h4>${linkList()}</div>
      <div class="row-btns">
        <button type="button" class="btn btn--accent" data-app="projects">Browse projects</button>
        <button type="button" class="btn" data-app="experience">Experience</button>
      </div>`;
    body.addEventListener("click", (e) => {
      const url = e.target.closest("[data-url]")?.dataset.url;
      if (url) { const p = D.projects.find((x) => x.id === url); openBrowser(p.live, p.name); }
      const app = e.target.closest("[data-app]")?.dataset.app;
      if (app) openApp(app);
    });
  }

  function renderProjects(body, w, opts) {
    body.classList.add("explorer");
    const sections = [
      { id: "now", label: "Building now", items: D.projects.map((p) => ({ ...p, kind: "project" })) },
      { id: "tools", label: "Shipped tools", items: D.tools.map((t, i) => ({ ...t, id: `tool-${i}`, kind: "tool", status: "source", summary: t.what })) },
    ];
    let current = sections[0], selected = null;
    body.innerHTML = `
      <div class="ex-tabs" role="tablist" aria-label="Project folders">
        ${sections.map((s, i) => `<button type="button" role="tab" class="ex-tab" id="${w.key}-tab-${s.id}" aria-selected="${i === 0}" data-sec="${s.id}">${ICON.folder}<span>${esc(s.label)}</span></button>`).join("")}
      </div>
      <div class="ex-path"><span>Chase</span><span aria-hidden="true">›</span><span class="ex-crumb">${esc(current.label)}</span></div>
      <div class="ex-main">
        <ul class="ex-list" role="listbox" aria-label="Items"></ul>
        <aside class="ex-detail" aria-live="polite"></aside>
      </div>`;
    const list = $(".ex-list", body), detail = $(".ex-detail", body);

    function drawList() {
      $(".ex-crumb", body).textContent = current.label;
      body.querySelectorAll(".ex-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.sec === current.id)));
      list.innerHTML = current.items.map((it) => `
        <li><button type="button" role="option" class="ex-item${selected?.id === it.id ? " is-selected" : ""}" aria-selected="${selected?.id === it.id}" data-id="${it.id}">
          ${ICON[it.live ? "link" : it.kind === "tool" ? "file" : "folder"]}
          <span class="ex-name">${esc(it.name)}</span>
          <span class="badge badge--${it.status}">${esc(STATUS[it.status])}</span>
        </button></li>`).join("");
    }
    function drawDetail() {
      const it = selected;
      if (!it) { detail.innerHTML = `<p class="muted">Select an item to see what it is${current.id === "now" ? " and open the live site" : ""}.</p>`; return; }
      detail.innerHTML = `
        <h3>${esc(it.name)}</h3>
        <p class="badge badge--${it.status}">${esc(STATUS[it.status])}${it.where ? `, ${esc(it.where)}` : ""}</p>
        <p>${esc(it.summary)}</p>
        ${it.points?.length ? `<ul>${it.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        <dl><dt>Built with</dt><dd>${esc(it.stack)}</dd></dl>
        <div class="row-btns">
          ${it.live ? `<button type="button" class="btn btn--accent" data-live="${it.id}">Open live site</button><a class="btn" href="${esc(it.live)}" target="_blank" rel="noopener">New tab ${ICON.external}</a>` : ""}
          ${it.source ? `<a class="btn" href="${esc(it.source)}" target="_blank" rel="noopener">Source ${ICON.external}</a>` : ""}
        </div>`;
    }
    function select(id) {
      for (const s of sections) { const f = s.items.find((x) => x.id === id); if (f) { current = s; selected = f; } }
      drawList(); drawDetail();
    }
    w.select = select;
    body.addEventListener("click", (e) => {
      const sec = e.target.closest("[data-sec]")?.dataset.sec;
      if (sec) { current = sections.find((s) => s.id === sec); selected = null; drawList(); drawDetail(); }
      const id = e.target.closest(".ex-item")?.dataset.id;
      if (id) select(id);
      const live = e.target.closest("[data-live]")?.dataset.live;
      if (live) { const p = D.projects.find((x) => x.id === live); openBrowser(p.live, p.name); }
    });
    list.addEventListener("dblclick", (e) => {
      const id = e.target.closest(".ex-item")?.dataset.id;
      const p = D.projects.find((x) => x.id === id);
      if (p?.live) openBrowser(p.live, p.name);
    });
    list.addEventListener("keydown", (e) => {
      if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const items = [...list.querySelectorAll(".ex-item")];
      const i = items.indexOf(document.activeElement);
      items[Math.min(items.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
    });
    if (opts.select) select(opts.select); else { drawList(); drawDetail(); }
  }

  function renderExperience(body) {
    body.classList.add("pad", "doc");
    body.innerHTML = `<h3>Experience</h3>` + D.jobs.map((j) => `
      <article class="job">
        <p class="muted small">${esc(j.when)}</p>
        <h4>${esc(j.role)}</h4>
        <p class="job__org">${esc(j.org)}</p>
        <ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </article>`).join("");
  }

  function renderRoadmap(body) {
    body.classList.add("pad", "doc");
    body.innerHTML = `
      <h3>Where I am heading</h3>
      <p class="muted">From IT infrastructure to cloud, DevOps and AI automation, shipping something public at each stop.</p>
      <ol class="steps">${D.roadmap.map((r) => `
        <li class="${r.now ? "is-now" : ""}">
          <p class="muted small">${esc(r.when)}${r.now ? ` <span class="badge badge--live">In progress</span>` : ""}</p>
          <h4>${esc(r.title)}</h4><p>${esc(r.text)}</p>
        </li>`).join("")}</ol>
      <h4 class="certs-h">Certifications</h4>
      <ul>${D.certs.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
  }

  function renderTerminal(body) {
    body.classList.add("term");
    body.innerHTML = `<div class="term__out" aria-live="polite"></div>
      <form class="term__in"><label for="term-input" class="term__ps">chase@os:~$</label><input id="term-input" autocomplete="off" spellcheck="false" aria-label="Command"></form>`;
    const out = $(".term__out", body), input = $("input", body);
    const print = (html) => { out.insertAdjacentHTML("beforeend", `<div>${html}</div>`); body.scrollTop = body.scrollHeight; };
    const cmds = {
      help: () => "Commands: <b>whoami</b>, <b>projects</b>, <b>live</b>, <b>open</b> &lt;name&gt;, <b>experience</b>, <b>contact</b>, <b>date</b>, <b>clear</b>",
      whoami: () => `${esc(D.name)}, ${esc(D.role)} (${esc(D.place)})`,
      projects: () => D.projects.map((p) => `${esc(p.id.padEnd(14, " "))} ${esc(STATUS[p.status])}`).join("<br>"),
      live: () => liveProjects().map((p) => `<a href="${esc(p.live)}" target="_blank" rel="noopener">${esc(p.live)}</a>`).join("<br>"),
      experience: () => D.jobs.map((j) => `${esc(j.when)}  ${esc(j.role)}, ${esc(j.org)}`).join("<br>"),
      contact: () => D.links.map((l) => `${esc(l.label.padEnd(9, " "))}<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.text)}</a>`).join("<br>"),
      date: () => esc(new Date().toString()),
      clear: () => { out.innerHTML = ""; return null; },
      open: (arg) => {
        if (APPS[arg]) { openApp(arg); return `Opening ${esc(APPS[arg].title)}…`; }
        const p = D.projects.find((x) => x.id === arg || x.name.toLowerCase() === arg);
        if (!p) return `No app or project called “${esc(arg)}”. Try <b>projects</b>.`;
        if (p.live) { openBrowser(p.live, p.name); return `Opening ${esc(p.name)}…`; }
        openApp("projects", { select: p.id }); return `${esc(p.name)} has no live site; showing it in Projects.`;
      },
    };
    print(`ChaseOS terminal. Type <b>help</b>.`);
    $("form", body).addEventListener("submit", (e) => {
      e.preventDefault();
      const line = input.value.trim(); input.value = "";
      if (!line) return;
      print(`<span class="term__ps">chase@os:~$</span> ${esc(line)}`);
      const [cmd, ...rest] = line.split(/\s+/);
      const fn = cmds[cmd.toLowerCase()];
      const res = fn ? fn(rest.join(" ").toLowerCase()) : `${esc(cmd)}: command not found. Type <b>help</b>.`;
      if (res) print(res);
    });
    body.addEventListener("click", () => input.focus());
    setTimeout(() => input.focus(), 0);
  }

  function renderBrowser(body, w, opts) {
    body.classList.add("browser");
    const start = opts.url || "";
    body.innerHTML = `
      <form class="br-bar">
        <button type="button" class="br-btn" data-b="reload" aria-label="Reload">⟳</button>
        <label class="sr" for="${w.key}-url">Address</label>
        <input id="${w.key}-url" class="br-url" value="${esc(start)}" placeholder="Pick a live site below" spellcheck="false">
        <a class="br-btn br-ext" href="${esc(start || "#")}" target="_blank" rel="noopener" aria-label="Open in a new tab">${ICON.external}</a>
      </form>
      <div class="br-view">
        ${start ? `<iframe title="${esc(opts.title || "Web page")}" src="${esc(start)}" loading="lazy" referrerpolicy="no-referrer"></iframe>` : ""}
        <div class="br-home"${start ? " hidden" : ""}>
          <h3>Live sites</h3>
          <ul class="plain">${liveProjects().map((p) => `<li><button type="button" class="linkish" data-go="${esc(p.live)}">${esc(p.name)}</button> <span class="muted small">${esc(p.where)}</span></li>`).join("")}</ul>
        </div>
      </div>
      <p class="br-note">Some sites refuse to load inside another page. If this stays blank, use the new-tab button.</p>`;
    const view = $(".br-view", body), url = $(".br-url", body), ext = $(".br-ext", body);
    const go = (u) => {
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      url.value = u; ext.href = u;
      $(".br-home", body).hidden = true;
      let f = $("iframe", view);
      if (!f) { f = document.createElement("iframe"); f.title = "Web page"; f.referrerPolicy = "no-referrer"; view.prepend(f); }
      f.src = u;
    };
    $("form", body).addEventListener("submit", (e) => { e.preventDefault(); if (url.value.trim()) go(url.value.trim()); });
    body.addEventListener("click", (e) => {
      if (e.target.closest('[data-b="reload"]')) { const f = $("iframe", view); if (f) f.src = f.src; }
      const g = e.target.closest("[data-go]")?.dataset.go;
      if (g) go(g);
    });
  }

  // ---------- boot ----------
  document.documentElement.classList.add("os-ready");
  renderTaskbar();
  const hash = location.hash.slice(1);
  if (APPS[hash]) openApp(hash);
  else if (D.projects.some((p) => p.id === hash)) openApp("projects", { select: hash });
  else openApp("about", isNarrow() ? {} : { left: 220, top: 48 });
})();
