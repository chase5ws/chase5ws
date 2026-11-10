// ChaseOS: a desktop in the browser. Content comes from data.js (window.CHASE).
(() => {
  const D = window.CHASE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => matchMedia("(max-width: 720px)").matches;
  const anim = (el, frames, opts) => (reduceMotion || !el.animate ? Promise.resolve() : el.animate(frames, { duration: 180, easing: "cubic-bezier(.1,.9,.2,1)", ...opts }).finished.catch(() => {}));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(`chaseos.${k}`)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(`chaseos.${k}`, JSON.stringify(v)); } catch {} },
  };

  // ---------- icons (drawn for this site) ----------
  const G = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let gid = 0;
  const ic = (body, defs = "") => { const n = ++gid; return `<svg viewBox="0 0 48 48" aria-hidden="true"><defs>${defs.replaceAll("$", n)}</defs>${body.replaceAll("$", n)}</svg>`; };
  const ICON = {
    logo: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><defs>${G("lg", "#6aa8ff", "#2259d6")}</defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#lg)"/><path d="M15.6 8.4a4.7 4.7 0 1 0 0 7.2" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    about: () => ic(`<rect x="4" y="4" width="40" height="40" rx="11" fill="url(#a$)"/><circle cx="24" cy="19" r="7" fill="#fff"/><path d="M11 38c2.6-6.4 7.4-9.3 13-9.3s10.4 2.9 13 9.3" fill="#fff"/>`, G("a$", "#6ea8ff", "#2f6fde")),
    folder: () => ic(`<path d="M4 13a4 4 0 0 1 4-4h10l4 4h18a4 4 0 0 1 4 4v2H4z" fill="url(#f$)"/><rect x="4" y="16" width="40" height="25" rx="4" fill="url(#g$)"/><rect x="4" y="16" width="40" height="3" fill="#fff" opacity=".35"/>`, G("f$", "#e9a514", "#d58a06") + G("g$", "#ffd765", "#f6b62c")),
    briefcase: () => ic(`<path d="M17 13v-2.5A3.5 3.5 0 0 1 20.5 7h7a3.5 3.5 0 0 1 3.5 3.5V13" fill="none" stroke="#8a5a32" stroke-width="3"/><rect x="5" y="13" width="38" height="27" rx="5" fill="url(#b$)"/><rect x="5" y="22" width="38" height="4" fill="#000" opacity=".12"/><rect x="21" y="20" width="6" height="8" rx="1.5" fill="#ffe6b8"/>`, G("b$", "#c98448", "#9a5b2c")),
    map: () => ic(`<rect x="4" y="4" width="40" height="40" rx="11" fill="url(#m$)"/><path d="M15 36V12m0 0h17l-4 5.5L32 23H15" fill="none" stroke="#fff" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`, G("m$", "#3fcf8e", "#13865a")),
    terminal: () => ic(`<rect x="4" y="7" width="40" height="34" rx="7" fill="url(#t$)"/><rect x="4" y="7" width="40" height="7" rx="7" fill="#fff" opacity=".08"/><path d="M13 20l6 5-6 5" fill="none" stroke="#7ee787" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 31h11" stroke="#d6dde8" stroke-width="3.2" stroke-linecap="round"/>`, G("t$", "#3a4152", "#14181f")),
    browser: () => ic(`<circle cx="24" cy="24" r="19" fill="url(#w$)"/><path d="M5 24h38M24 5c6 6 6 32 0 38M24 5c-6 6-6 32 0 38M8 14h32M8 34h32" fill="none" stroke="#e6fffb" stroke-width="2" opacity=".9"/>`, G("w$", "#2dd4bf", "#0b7f8a")),
    settings: () => ic(`<circle cx="24" cy="24" r="19" fill="url(#s$)"/><path d="M24 14.5l2 .3.7 2.6 2.3 1.3 2.6-.8 1.4 1.5-.8 2.6 1.3 2.3 2.6.7.3 2-.3 2-2.6.7-1.3 2.3.8 2.6-1.4 1.5-2.6-.8-2.3 1.3-.7 2.6-2 .3-2-.3-.7-2.6-2.3-1.3-2.6.8-1.4-1.5.8-2.6-1.3-2.3-2.6-.7-.3-2 .3-2 2.6-.7 1.3-2.3-.8-2.6 1.4-1.5 2.6.8 2.3-1.3.7-2.6z" fill="#fff" opacity=".95"/><circle cx="24" cy="24" r="4.2" fill="url(#s$)"/>`, G("s$", "#8c9bb3", "#556178")),
    file: () => ic(`<path d="M12 4h17l9 9v28a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#fff" stroke="#b8c0cc"/><path d="M29 4v9h9" fill="#e5e9f0" stroke="#b8c0cc"/><path d="M15 22h17M15 28h17M15 34h11" stroke="#9aa6b8" stroke-width="2" stroke-linecap="round"/>`),
    site: () => ic(`<rect x="5" y="7" width="38" height="34" rx="6" fill="#fff" stroke="#c9d1dd"/><path d="M5 13a6 6 0 0 1 6-6h26a6 6 0 0 1 6 6v3H5z" fill="url(#x$)"/><circle cx="10" cy="11.5" r="1.4" fill="#fff"/><circle cx="14.5" cy="11.5" r="1.4" fill="#fff"/><rect x="10" y="21" width="16" height="3" rx="1.5" fill="#c6d4ea"/><rect x="10" y="27" width="26" height="3" rx="1.5" fill="#e1e8f3"/><rect x="10" y="33" width="20" height="3" rx="1.5" fill="#e1e8f3"/>`, G("x$", "#4f8cff", "#2f6fde")),
  };
  const SHORTCUT = `<svg class="badge-shortcut" viewBox="0 0 16 16" aria-hidden="true"><rect x=".5" y=".5" width="15" height="15" rx="3" fill="#fff" stroke="#b9c2cf"/><path d="M5 11.5c0-4 2.5-6 6.5-6M8.5 3.5l3 2-3 2" fill="none" stroke="#2f6fde" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const UI = {
    min: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" stroke="currentColor" stroke-width="1.1"/></svg>`,
    max: `<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
    restore: `<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="3.5" width="6.5" height="6.5" rx="1.3" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M4 2h4.5A1.5 1.5 0 0 1 10 3.5V8" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
    close: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" stroke-width="1.1"/></svg>`,
    external: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 3h4v4M13 3L7.5 8.5M12 9.5V13H3V4h3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    reload: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const STATUS = { live: "Live", source: "Source only", private: "Private repo", building: "Building" };

  // ---------- settings: theme and wallpaper ----------
  const WALLS = { bloom: "Bloom blue", dusk: "Dusk" };
  const settings = { theme: store.get("theme", "system"), wall: store.get("wall", "bloom") };
  const darkMQ = matchMedia("(prefers-color-scheme: dark)");
  function applySettings() {
    const dark = settings.theme === "dark" || (settings.theme === "system" && darkMQ.matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    const wall = WALLS[settings.wall] ? settings.wall : "bloom";
    document.documentElement.style.setProperty("--wallpaper", `url("${new URL(`os/wallpapers/${wall}-${dark ? "dark" : "light"}.svg`, document.baseURI).href}")`);
  }
  darkMQ.addEventListener?.("change", applySettings);
  function setSetting(k, v) { settings[k] = v; store.set(k, v); applySettings(); renderQuick(); $$(".settings-host").forEach((h) => h.refresh?.()); }
  applySettings();

  // ---------- apps ----------
  const APPS = {
    about: { title: "About Chase", icon: "about", w: 580, h: 620, render: renderAbout },
    projects: { title: "Projects", icon: "folder", w: 920, h: 600, render: renderProjects },
    experience: { title: "Experience", icon: "briefcase", w: 700, h: 580, render: renderExperience },
    roadmap: { title: "Roadmap", icon: "map", w: 640, h: 580, render: renderRoadmap },
    terminal: { title: "Terminal", icon: "terminal", w: 680, h: 440, render: renderTerminal },
    browser: { title: "Browser", icon: "browser", w: 1000, h: 660, render: renderBrowser, multi: true },
    settings: { title: "Settings", icon: "settings", w: 760, h: 520, render: renderSettings },
  };
  const DESKTOP = ["about", "projects", "experience", "roadmap", "terminal", "browser", "settings"];
  const PINNED = ["projects", "about", "experience", "terminal", "browser", "settings"];
  const liveProjects = () => D.projects.filter((p) => p.live);
  const findProject = (id) => D.projects.find((p) => p.id === id);

  // ---------- window manager ----------
  const layer = $("#windows");
  const wins = new Map();
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
        <span class="win__icon">${ICON[app.icon]()}</span>
        <h2 class="win__title" id="${key}-title">${esc(opts.title || app.title)}</h2>
        <div class="win__ctrls">
          <button type="button" class="win__btn" data-act="min" aria-label="Minimise">${UI.min}</button>
          <button type="button" class="win__btn" data-act="max" aria-label="Maximise">${UI.max}</button>
          <button type="button" class="win__btn win__btn--close" data-act="close" aria-label="Close">${UI.close}</button>
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
    anim(el, [{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 200 });
    renderTaskbar();
    return w;
  }

  function place(w, opts) {
    if (isNarrow()) { setMax(w, true); return; }
    const area = layer.getBoundingClientRect();
    const width = Math.min(w.app.w, area.width - 24), height = Math.min(w.app.h, area.height - 24);
    const n = Math.max(0, wins.size - 1);
    const left = opts.left ?? (area.width - width) / 2 + n * 28 - 40;
    const top = opts.top ?? (area.height - height) / 2 + n * 24 - 30;
    setRect(w, { left: clamp(left, 12, area.width - width - 12), top: clamp(top, 12, area.height - height - 12), width, height });
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  const setRect = (w, r) => Object.assign(w.el.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });

  function focusWin(w, show) {
    if (show && w.minimized) {
      w.minimized = false; w.el.hidden = false;
      anim(w.el, [{ opacity: 0, transform: "translateY(40px) scale(.9)" }, { opacity: 1, transform: "none" }]);
    }
    w.el.style.zIndex = ++z;
    $$(".win.is-active").forEach((e) => e.classList.remove("is-active"));
    w.el.classList.add("is-active");
    active = w;
    if (!w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
    renderTaskbar();
  }

  async function minimize(w) {
    await anim(w.el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(60px) scale(.85)" }], { duration: 160, easing: "ease-in" });
    w.minimized = true; w.el.hidden = true;
    if (active === w) active = null;
    renderTaskbar();
  }

  function setMax(w, on) {
    if (on && !w.max && !w.snapped) w.restore = { left: w.el.offsetLeft, top: w.el.offsetTop, width: w.el.offsetWidth, height: w.el.offsetHeight };
    w.max = on;
    if (on) w.snapped = false;
    w.el.classList.toggle("is-max", on);
    if (!on && w.restore) setRect(w, w.restore);
    const b = $('[data-act="max"]', w.el);
    if (b) { b.setAttribute("aria-label", on ? "Restore" : "Maximise"); b.innerHTML = on ? UI.restore : UI.max; }
  }

  function snapTo(w, zone) {
    const area = layer.getBoundingClientRect();
    const W = area.width, H = area.height, h2 = W / 2, v2 = H / 2;
    const zones = {
      left: [0, 0, h2, H], right: [h2, 0, h2, H],
      tl: [0, 0, h2, v2], tr: [h2, 0, h2, v2], bl: [0, v2, h2, v2], br: [h2, v2, h2, v2],
      big: [0, 0, W * 0.62, H], side: [W * 0.62, 0, W * 0.38, H],
    };
    const r = zones[zone];
    if (!r) return;
    if (w.max) setMax(w, false);
    if (!w.snapped) w.restore = { left: w.el.offsetLeft, top: w.el.offsetTop, width: w.el.offsetWidth, height: w.el.offsetHeight };
    w.snapped = true;
    setRect(w, { left: r[0], top: r[1], width: r[2], height: r[3] });
    w.el.classList.add("is-snapped");
    focusWin(w);
  }

  async function closeWin(w) {
    await anim(w.el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.95)" }], { duration: 120, easing: "ease-in" });
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
      if (act === "max") { hideSnap(); setMax(w, !w.max); }
      if (act === "close") closeWin(w);
    });
    bar.addEventListener("dblclick", (e) => { if (!e.target.closest("button") && !isNarrow()) setMax(w, !w.max); });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) closeWin(w);
      if (e.metaKey || e.ctrlKey) return;
      if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); snapTo(w, "left"); }
      if (e.altKey && e.key === "ArrowRight") { e.preventDefault(); snapTo(w, "right"); }
      if (e.altKey && e.key === "ArrowUp") { e.preventDefault(); setMax(w, true); }
    });

    // snap layouts flyout on hovering the maximise button
    const maxBtn = $('[data-act="max"]', el);
    let hoverT;
    maxBtn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !isNarrow()) hoverT = setTimeout(() => showSnap(w, maxBtn), 450); });
    maxBtn.addEventListener("pointerleave", () => clearTimeout(hoverT));

    // drag the title bar; dropping at the top edge maximises, at a side edge snaps half
    const preview = $("#snap-preview");
    drag(bar, (dx, dy, start, ev) => {
      if (isNarrow()) return;
      const area = layer.getBoundingClientRect();
      if (w.max || w.snapped) {
        const r = w.restore || { width: 800, height: 520 };
        w.max = false; w.snapped = false; el.classList.remove("is-max", "is-snapped");
        $('[data-act="max"]', el).innerHTML = UI.max;
        const ratio = (start.x - area.left - start.left) / start.width;
        start.left = start.x - area.left - r.width * ratio; start.top = 0;
        Object.assign(el.style, { width: `${r.width}px`, height: `${r.height}px` });
        start.width = r.width;
      }
      el.style.left = `${clamp(start.left + dx, -el.offsetWidth + 120, area.width - 120)}px`;
      el.style.top = `${clamp(start.top + dy, 0, area.height - 40)}px`;
      const x = ev.clientX - area.left, y = ev.clientY - area.top;
      const zone = y < 6 ? "max" : x < 8 ? "left" : x > area.width - 8 ? "right" : null;
      w.dropZone = zone;
      if (zone) {
        const r = zone === "max" ? [0, 0, area.width, area.height] : zone === "left" ? [0, 0, area.width / 2, area.height] : [area.width / 2, 0, area.width / 2, area.height];
        Object.assign(preview.style, { left: `${r[0] + 8}px`, top: `${r[1] + 8}px`, width: `${r[2] - 16}px`, height: `${r[3] - 16}px` });
        preview.hidden = false;
      } else preview.hidden = true;
    }, (ev) => ({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, x: ev.clientX }), () => {
      preview.hidden = true;
      if (w.dropZone === "max") setMax(w, true);
      else if (w.dropZone) snapTo(w, w.dropZone);
      w.dropZone = null;
    });

    drag($(".win__grip", el), (dx, dy, start) => {
      if (w.max) return;
      el.style.width = `${Math.max(320, start.w + dx)}px`;
      el.style.height = `${Math.max(220, start.h + dy)}px`;
    }, () => ({ w: el.offsetWidth, h: el.offsetHeight }));
  }

  function drag(handle, onMove, getStart, onEnd) {
    handle.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      const sx = e.clientX, sy = e.clientY, start = getStart(e);
      let moved = false;
      handle.setPointerCapture(e.pointerId);
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 3) return;
        moved = true; document.body.classList.add("is-dragging");
        onMove(ev.clientX - sx, ev.clientY - sy, start, ev);
      };
      const up = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        document.body.classList.remove("is-dragging");
        if (moved) onEnd?.();
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
    });
  }

  // ---------- flyouts (start, widgets, quick settings, context menu, snap) ----------
  const flyouts = { start: $("#start"), widgets: $("#widgets-panel"), quick: $("#quick"), ctx: $("#ctx"), snap: $("#snap") };
  const owners = { start: $("#start-btn"), widgets: $("#widgets-btn"), quick: $("#tray-btn") };
  function openFly(name) {
    closeFlys(name);
    const f = flyouts[name];
    f.hidden = false;
    owners[name]?.setAttribute("aria-expanded", "true");
    const from = name === "widgets" ? "translateX(-24px)" : name === "ctx" || name === "snap" ? "scale(.97)" : "translateY(24px)";
    anim(f, [{ opacity: 0, transform: `${f.dataset.base || ""} ${from}` }, { opacity: 1, transform: f.dataset.base || "none" }], { duration: 220 });
  }
  function closeFlys(except) {
    for (const [name, f] of Object.entries(flyouts)) {
      if (name === except || f.hidden) continue;
      f.hidden = true;
      owners[name]?.setAttribute("aria-expanded", "false");
    }
  }
  const toggleFly = (name) => (flyouts[name].hidden ? openFly(name) : closeFlys());
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = Object.entries(flyouts).find(([, f]) => !f.hidden);
    if (open) { closeFlys(); owners[open[0]]?.focus(); }
  });
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".flyout, #start-btn, #search-btn, #widgets-btn, #tray-btn")) return;
    closeFlys();
  });

  // start menu
  const search = $("#start-search");
  $("#start-btn").innerHTML = ICON.logo();
  $("#start-btn").addEventListener("click", () => { toggleFly("start"); if (!flyouts.start.hidden) { search.value = ""; renderStart(""); search.focus(); } });
  $("#search-btn").addEventListener("click", () => { openFly("start"); search.value = ""; renderStart(""); search.focus(); });
  search.addEventListener("input", () => renderStart(search.value.trim().toLowerCase()));
  search.addEventListener("keydown", (e) => { if (e.key === "Enter") $("#start [data-open]")?.click(); });
  function renderStart(q) {
    const apps = Object.entries(APPS).filter(([, a]) => !q || a.title.toLowerCase().includes(q));
    const projects = D.projects.filter((p) => !q || `${p.name} ${p.summary} ${p.stack}`.toLowerCase().includes(q));
    $("#start-pinned").innerHTML = apps.map(([id, a]) =>
      `<li><button type="button" class="tile" data-open="app:${id}">${ICON[a.icon]()}<span>${esc(a.title)}</span></button></li>`).join("") || `<li class="muted">No apps match.</li>`;
    $("#start-rec").innerHTML = projects.map((p) =>
      `<li><button type="button" class="rec" data-open="project:${p.id}">${ICON[p.live ? "site" : "file"]()}<span><b>${esc(p.name)}</b><small>${esc(STATUS[p.status])}${p.where ? `, ${esc(p.where)}` : ""}</small></span></button></li>`).join("") || `<li class="muted">No projects match.</li>`;
  }
  flyouts.start.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open]")?.dataset.open;
    if (!t) return;
    const [kind, id] = t.split(":");
    closeFlys();
    if (kind === "app") openApp(id); else openApp("projects", { select: id });
  });
  $("#restart").addEventListener("click", () => { closeFlys(); lock(); });

  // widgets panel
  $("#widgets-btn").addEventListener("click", () => toggleFly("widgets"));
  $("#tb-live").textContent = liveProjects().length;
  $("#live-count").textContent = liveProjects().length;
  flyouts.widgets.innerHTML = `
    <div class="wp__head"><h2>Widgets</h2><time class="muted" id="wp-date"></time></div>
    <section class="wp-card wp-card--live">
      <h3>Live now</h3><p class="muted small">Open any of these, no sign-in.</p>
      <ul class="plain">${liveProjects().map((p) => `<li class="wp-row"><span class="dot" aria-hidden="true"></span><span class="w-name"><b>${esc(p.name)}</b><small>${esc(p.where)}</small></span><button type="button" class="btn btn--accent btn--s" data-url="${p.id}">Open</button></li>`).join("")}</ul>
    </section>
    <div class="wp-grid">
      <section class="wp-card"><h3>Now</h3>${D.roadmap.filter((r) => r.now).map((r) => `<p><b>${esc(r.title)}</b></p><p class="muted small">${esc(r.when)}</p><p class="small">${esc(r.text)}</p>`).join("")}</section>
      <section class="wp-card"><h3>Building</h3><p class="wp-big">${D.projects.length}</p><p class="muted small">projects, ${liveProjects().length} live</p><button type="button" class="linkish small" data-app="projects">Open Projects</button></section>
    </div>
    <section class="wp-card"><h3>Contact</h3><ul class="links">${D.links.map((l) => `<li><span>${esc(l.label)}</span><a href="${esc(l.href)}"${l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${esc(l.text)}</a></li>`).join("")}</ul></section>`;
  flyouts.widgets.addEventListener("click", (e) => {
    const url = e.target.closest("[data-url]")?.dataset.url;
    if (url) { closeFlys(); const p = findProject(url); openBrowser(p.live, p.name); }
    const app = e.target.closest("[data-app]")?.dataset.app;
    if (app) { closeFlys(); openApp(app); }
  });

  // quick settings + calendar
  $("#tray-btn").addEventListener("click", () => toggleFly("quick"));
  function renderQuick() {
    const d = new Date(), y = d.getFullYear(), m = d.getMonth();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    const cells = Array.from({ length: first }, () => "<span></span>").concat(Array.from({ length: days }, (_, i) => `<span class="${i + 1 === d.getDate() ? "is-today" : ""}">${i + 1}</span>`));
    flyouts.quick.innerHTML = `
      <section class="q-card">
        <h3 class="q-h">Theme</h3>
        <div class="seg" role="radiogroup" aria-label="Theme">${["system", "light", "dark"].map((t) => `<button type="button" role="radio" aria-checked="${settings.theme === t}" data-theme="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div>
        <h3 class="q-h">Wallpaper</h3>
        <div class="walls">${Object.entries(WALLS).map(([k, label]) => `<button type="button" class="wall-thumb${settings.wall === k ? " is-on" : ""}" data-wall="${k}" aria-pressed="${settings.wall === k}" style="background-image:url('./os/wallpapers/${k}-${document.documentElement.dataset.theme}.svg')"><span>${esc(label)}</span></button>`).join("")}</div>
      </section>
      <section class="q-card">
        <h3 class="q-h">${d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
        <div class="cal" aria-hidden="true">${["S", "M", "T", "W", "T", "F", "S"].map((x) => `<b>${x}</b>`).join("")}${cells.join("")}</div>
      </section>`;
  }
  flyouts.quick.addEventListener("click", (e) => {
    const t = e.target.closest("[data-theme]")?.dataset.theme;
    if (t) setSetting("theme", t);
    const wv = e.target.closest("[data-wall]")?.dataset.wall;
    if (wv) setSetting("wall", wv);
  });
  renderQuick();

  // desktop context menu
  const desktopEl = $("#desktop");
  desktopEl.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".win, .widget")) return;
    e.preventDefault();
    const ctx = flyouts.ctx;
    ctx.innerHTML = [
      ["refresh", "Refresh"], ["personalize", "Personalise"], ["terminal", "Open in Terminal"], ["projects", "Open Projects"], ["source", "View source on GitHub"],
    ].map(([a, l]) => `<li role="none"><button type="button" role="menuitem" data-ctx="${a}">${l}</button></li>`).join("");
    openFly("ctx");
    const r = ctx.getBoundingClientRect();
    ctx.style.left = `${Math.min(e.clientX, innerWidth - r.width - 8)}px`;
    ctx.style.top = `${Math.min(e.clientY, innerHeight - r.height - 56)}px`;
    $("button", ctx).focus();
  });
  flyouts.ctx.addEventListener("click", (e) => {
    const a = e.target.closest("[data-ctx]")?.dataset.ctx;
    if (!a) return;
    closeFlys();
    if (a === "refresh") { anim(desktopEl, [{ opacity: 0.6 }, { opacity: 1 }], { duration: 200 }); }
    if (a === "personalize") openApp("settings");
    if (a === "terminal") openApp("terminal");
    if (a === "projects") openApp("projects");
    if (a === "source") window.open("https://github.com/chase5ws/chase5ws", "_blank", "noopener");
  });

  // snap layouts flyout
  function showSnap(w, btn) {
    const snap = flyouts.snap;
    snap.innerHTML = `
      <div class="snap__g" aria-label="Halves"><button type="button" data-z="left" aria-label="Left half"></button><button type="button" data-z="right" aria-label="Right half"></button></div>
      <div class="snap__g snap__g--62" aria-label="Main and side"><button type="button" data-z="big" aria-label="Wide left"></button><button type="button" data-z="side" aria-label="Narrow right"></button></div>
      <div class="snap__g snap__g--q" aria-label="Quarters"><button type="button" data-z="tl" aria-label="Top left"></button><button type="button" data-z="tr" aria-label="Top right"></button><button type="button" data-z="bl" aria-label="Bottom left"></button><button type="button" data-z="br" aria-label="Bottom right"></button></div>`;
    snap.snapTarget = w;
    openFly("snap");
    const b = btn.getBoundingClientRect(), r = snap.getBoundingClientRect();
    snap.style.left = `${clamp(b.left + b.width / 2 - r.width / 2, 8, innerWidth - r.width - 8)}px`;
    snap.style.top = `${b.bottom + 6}px`;
  }
  function hideSnap() { if (!flyouts.snap.hidden) closeFlys(); }
  flyouts.snap.addEventListener("click", (e) => {
    const zn = e.target.closest("[data-z]")?.dataset.z;
    if (zn && flyouts.snap.snapTarget) snapTo(flyouts.snap.snapTarget, zn);
    closeFlys();
  });
  flyouts.snap.addEventListener("pointerleave", () => setTimeout(() => { if (!flyouts.snap.matches(":hover")) closeFlys(); }, 300));

  // ---------- taskbar ----------
  const tasks = $("#tasks");
  function renderTaskbar() {
    const running = [...wins.values()];
    const ids = [...new Set([...PINNED, ...running.map((w) => w.appId)])];
    tasks.innerHTML = ids.map((id) => {
      const mine = running.filter((w) => w.appId === id);
      const isActive = active && active.appId === id && !active.minimized;
      const state = mine.length ? (isActive ? " is-active" : " is-open") : "";
      return `<li><button type="button" class="task${state}" data-app="${id}" aria-label="${esc(APPS[id].title)}${mine.length ? " (open)" : ""}"><span class="tip" aria-hidden="true">${esc(APPS[id].title)}</span>${ICON[APPS[id].icon]()}</button></li>`;
    }).join("");
  }
  tasks.addEventListener("click", (e) => {
    const id = e.target.closest("[data-app]")?.dataset.app;
    if (!id) return;
    closeFlys();
    const mine = [...wins.values()].filter((w) => w.appId === id);
    if (!mine.length) return openApp(id);
    const w = mine.sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    if (active === w && !w.minimized) minimize(w); else focusWin(w, true);
  });

  // ---------- clock ----------
  function tick() {
    const d = new Date();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    $("#clock-time").textContent = time;
    $("#clock-date").textContent = d.toLocaleDateString();
    $("#clock").dateTime = d.toISOString();
    $("#lock-time").textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    $("#lock-date").textContent = d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const wd = $("#wp-date"); if (wd) wd.textContent = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  }
  tick(); setInterval(tick, 15000);

  // ---------- lock screen ----------
  const lockEl = $("#lock"), face = $("#lock-face"), login = $("#lock-login");
  function lock() {
    lockEl.hidden = false; face.hidden = false; login.hidden = true;
    anim(lockEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    face.focus();
  }
  function showLogin() {
    if (face.hidden) return;
    anim(face, [{ transform: "none", opacity: 1 }, { transform: "translateY(-60px)", opacity: 0 }], { duration: 220, easing: "ease-in" }).then(() => {
      face.hidden = true; login.hidden = false; lockEl.classList.add("is-login");
      anim(login, [{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 220 });
      $("#sign-in").focus();
    });
  }
  function unlock() {
    try { sessionStorage.setItem("chaseos.unlocked", "1"); } catch {}
    anim(lockEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }).then(() => { lockEl.hidden = true; lockEl.classList.remove("is-login"); boot(); });
  }
  face.addEventListener("click", showLogin);
  lockEl.addEventListener("keydown", (e) => { if (!face.hidden && e.key !== "Tab") { e.preventDefault(); showLogin(); } });
  $("#sign-in").addEventListener("click", unlock);

  // ---------- desktop ----------
  const icons = $("#icons");
  icons.innerHTML = [
    ...DESKTOP.map((id) => ({ open: `app:${id}`, icon: APPS[id].icon, label: APPS[id].title, sc: false })),
    ...liveProjects().map((p) => ({ open: `url:${p.id}`, icon: "site", label: p.name, sc: true })),
  ].map((i) => `<li><button type="button" class="dicon" data-open="${i.open}"><span class="dicon__img">${ICON[i.icon]()}${i.sc ? SHORTCUT : ""}</span><span class="dicon__label">${esc(i.label)}</span></button></li>`).join("");
  function openTarget(t) {
    const [kind, id] = t.split(":");
    if (kind === "app") return openApp(id);
    const p = findProject(id);
    if (p) openBrowser(p.live, p.name);
  }
  icons.addEventListener("dblclick", (e) => { const b = e.target.closest("[data-open]"); if (b) openTarget(b.dataset.open); });
  icons.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (!b) return;
    $$(".is-selected", icons).forEach((x) => x.classList.remove("is-selected"));
    b.classList.add("is-selected");
    if (e.detail === 0 || matchMedia("(pointer: coarse)").matches) openTarget(b.dataset.open);
  });
  desktopEl.addEventListener("pointerdown", (e) => { if (!e.target.closest(".dicon")) $$(".is-selected", icons).forEach((x) => x.classList.remove("is-selected")); });

  $("#widget-rows").innerHTML = liveProjects().map((p) => `
    <li>
      <span class="dot" aria-hidden="true"></span>
      <span class="w-name"><b>${esc(p.name)}</b><small>${esc(p.where)}</small></span>
      <button type="button" class="btn btn--accent btn--s" data-url="${p.id}">Open<span class="sr"> ${esc(p.name)} here</span></button>
      <a class="icon-btn" href="${esc(p.live)}" target="_blank" rel="noopener" aria-label="Open ${esc(p.name)} in a new tab">${UI.external}</a>
    </li>`).join("");
  $("#widget-rows").addEventListener("click", (e) => {
    const p = findProject(e.target.closest("[data-url]")?.dataset.url);
    if (p) openBrowser(p.live, p.name);
  });

  function openBrowser(url, name) {
    return openApp("browser", { url, title: name ? `${name} · Browser` : "Browser" });
  }

  // ---------- app renderers ----------
  function linkList() {
    return `<ul class="links">${D.links.map((l) => `<li><span>${esc(l.label)}</span><a href="${esc(l.href)}"${l.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${esc(l.text)}</a></li>`).join("")}</ul>`;
  }

  function renderAbout(body) {
    body.classList.add("pad", "about");
    body.innerHTML = `
      <div class="hero-card">
        <div class="avatar avatar--l" aria-hidden="true">CT</div>
        <div><h3>${esc(D.name)}</h3><p>${esc(D.role)}</p><p class="muted small">${esc(D.place)}</p></div>
      </div>
      <p class="about__bio">${esc(D.bio)}</p>
      <div class="card">
        <h4>Live right now</h4>
        <p class="muted small">Public pages, nothing to sign in to.</p>
        <ul class="plain">${liveProjects().map((p) => `<li class="wp-row"><span class="dot" aria-hidden="true"></span><span class="w-name"><b>${esc(p.name)}</b><small>${esc(p.where)}</small></span><button type="button" class="btn btn--s" data-url="${p.id}">Open</button></li>`).join("")}</ul>
      </div>
      <div class="card"><h4>Get in touch</h4>${linkList()}</div>
      <div class="row-btns">
        <button type="button" class="btn btn--accent" data-app="projects">Browse projects</button>
        <button type="button" class="btn" data-app="experience">Experience</button>
      </div>`;
    body.addEventListener("click", (e) => {
      const p = findProject(e.target.closest("[data-url]")?.dataset.url);
      if (p) openBrowser(p.live, p.name);
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
        ${sections.map((s, i) => `<button type="button" role="tab" class="ex-tab" aria-selected="${i === 0}" data-sec="${s.id}">${ICON.folder()}<span>${esc(s.label)}</span></button>`).join("")}
      </div>
      <div class="ex-path"><span>This PC</span><span aria-hidden="true">›</span><span>Chase</span><span aria-hidden="true">›</span><span class="ex-crumb"></span><span class="ex-count muted"></span></div>
      <div class="ex-main">
        <nav class="ex-nav" aria-label="Quick access">${sections.map((s) => `<button type="button" data-sec="${s.id}">${ICON.folder()}<span>${esc(s.label)}</span></button>`).join("")}</nav>
        <ul class="ex-list" role="listbox" aria-label="Items"></ul>
        <aside class="ex-detail" aria-live="polite"></aside>
      </div>`;
    const list = $(".ex-list", body), detail = $(".ex-detail", body);
    function drawList() {
      $(".ex-crumb", body).textContent = current.label;
      $(".ex-count", body).textContent = `${current.items.length} items`;
      $$("[data-sec]", body).forEach((t) => { t.setAttribute("aria-selected", String(t.dataset.sec === current.id)); t.classList.toggle("is-on", t.dataset.sec === current.id); });
      list.innerHTML = current.items.map((it) => `
        <li><button type="button" role="option" class="ex-item${selected?.id === it.id ? " is-selected" : ""}" aria-selected="${selected?.id === it.id}" data-id="${it.id}">
          ${ICON[it.live ? "site" : it.kind === "tool" ? "file" : "folder"]()}
          <span class="ex-name">${esc(it.name)}</span>
          <span class="badge badge--${it.status}">${esc(STATUS[it.status])}</span>
        </button></li>`).join("");
    }
    function drawDetail() {
      const it = selected;
      if (!it) { detail.innerHTML = `<div class="ex-empty">${ICON.folder()}<p class="muted">Select an item to see what it is${current.id === "now" ? " and open the live site" : ""}.</p></div>`; return; }
      detail.innerHTML = `
        <div class="ex-detail__icon">${ICON[it.live ? "site" : it.kind === "tool" ? "file" : "folder"]()}</div>
        <h3>${esc(it.name)}</h3>
        <p class="badge badge--${it.status}">${esc(STATUS[it.status])}${it.where ? `, ${esc(it.where)}` : ""}</p>
        <p>${esc(it.summary)}</p>
        ${it.points?.length ? `<ul>${it.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        <dl><dt>Built with</dt><dd>${esc(it.stack)}</dd></dl>
        <div class="row-btns">
          ${it.live ? `<button type="button" class="btn btn--accent" data-live="${it.id}">Open live site</button><a class="btn" href="${esc(it.live)}" target="_blank" rel="noopener">New tab ${UI.external}</a>` : ""}
          ${it.source ? `<a class="btn" href="${esc(it.source)}" target="_blank" rel="noopener">Source ${UI.external}</a>` : ""}
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
      const p = findProject(e.target.closest("[data-live]")?.dataset.live);
      if (p) openBrowser(p.live, p.name);
    });
    list.addEventListener("dblclick", (e) => {
      const p = findProject(e.target.closest(".ex-item")?.dataset.id);
      if (p?.live) openBrowser(p.live, p.name);
    });
    list.addEventListener("keydown", (e) => {
      if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const items = $$(".ex-item", list);
      items[clamp(items.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1), 0, items.length - 1)]?.focus();
    });
    if (opts.select) select(opts.select); else { drawList(); drawDetail(); }
  }

  function renderExperience(body) {
    body.classList.add("pad", "doc");
    body.innerHTML = `<h3>Experience</h3><ol class="timeline">` + D.jobs.map((j) => `
      <li class="job">
        <p class="muted small">${esc(j.when)}</p>
        <h4>${esc(j.role)}</h4>
        <p class="job__org">${esc(j.org)}</p>
        <ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </li>`).join("") + `</ol>`;
  }

  function renderRoadmap(body) {
    body.classList.add("pad", "doc");
    body.innerHTML = `
      <h3>Where I am heading</h3>
      <p class="muted">From IT infrastructure to cloud, DevOps and AI automation, shipping something public at each stop.</p>
      <ol class="steps">${D.roadmap.map((r, i) => `
        <li class="${r.now ? "is-now" : ""}">
          <span class="steps__n" aria-hidden="true">${i + 1}</span>
          <div><p class="muted small">${esc(r.when)}${r.now ? ` <span class="badge badge--live">In progress</span>` : ""}</p>
          <h4>${esc(r.title)}</h4><p>${esc(r.text)}</p></div>
        </li>`).join("")}</ol>
      <h4 class="certs-h">Certifications</h4>
      <ul>${D.certs.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
  }

  function renderSettings(body) {
    body.classList.add("settings", "settings-host");
    body.innerHTML = `
      <nav class="set-nav" aria-label="Settings">
        <div class="set-user"><span class="avatar avatar--m" aria-hidden="true">CT</span><span><b>${esc(D.name)}</b><small class="muted">${esc(D.links[0].text)}</small></span></div>
        <button type="button" class="is-on" data-page="person">Personalisation</button>
        <button type="button" data-page="system">About ChaseOS</button>
      </nav>
      <div class="set-page"></div>`;
    const page = $(".set-page", body);
    let current = "person";
    body.refresh = () => {
      $$("[data-page]", body).forEach((b) => b.classList.toggle("is-on", b.dataset.page === current));
      page.innerHTML = current === "person" ? `
        <h3>Personalisation</h3>
        <div class="set-preview" style="background-image:var(--wallpaper)"><div class="set-preview__win"></div><div class="set-preview__bar"></div></div>
        <div class="set-row"><div><b>Colour mode</b><p class="muted small">Follow the system, or pick one.</p></div>
          <div class="seg" role="radiogroup" aria-label="Colour mode">${["system", "light", "dark"].map((t) => `<button type="button" role="radio" aria-checked="${settings.theme === t}" data-theme="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div></div>
        <div class="set-row"><div><b>Background</b><p class="muted small">Drawn for this site.</p></div>
          <div class="walls">${Object.entries(WALLS).map(([k, label]) => `<button type="button" class="wall-thumb${settings.wall === k ? " is-on" : ""}" data-wall="${k}" aria-pressed="${settings.wall === k}" style="background-image:url('./os/wallpapers/${k}-${document.documentElement.dataset.theme}.svg')"><span>${esc(label)}</span></button>`).join("")}</div></div>`
        : `
        <h3>About ChaseOS</h3>
        <div class="set-row"><div><b>Version</b><p class="muted small">2026.11</p></div></div>
        <div class="set-row"><div><b>Built with</b><p class="muted small">Plain HTML, CSS and JavaScript on GitHub Pages. No framework, no tracking.</p></div></div>
        <div class="set-row"><div><b>Source</b><p class="muted small"><a href="https://github.com/chase5ws/chase5ws" target="_blank" rel="noopener">github.com/chase5ws/chase5ws</a></p></div></div>
        <div class="set-row"><div><b>Shortcuts</b><p class="muted small">Double-click a title bar to maximise. Alt + arrow keys snap a window. Drag a window to the screen edge to snap it. Right-click the desktop for more.</p></div></div>`;
    };
    body.addEventListener("click", (e) => {
      const pg = e.target.closest("[data-page]")?.dataset.page;
      if (pg) { current = pg; body.refresh(); }
      const t = e.target.closest("[data-theme]")?.dataset.theme;
      if (t) setSetting("theme", t);
      const wv = e.target.closest("[data-wall]")?.dataset.wall;
      if (wv) setSetting("wall", wv);
    });
    body.refresh();
  }

  function renderTerminal(body) {
    body.classList.add("term");
    body.innerHTML = `<div class="term__out" aria-live="polite"></div>
      <form class="term__in"><label for="term-input" class="term__ps">chase@os:~$</label><input id="term-input" autocomplete="off" spellcheck="false" aria-label="Command"></form>`;
    const out = $(".term__out", body), input = $("input", body);
    const history = []; let hi = 0;
    const print = (html) => { out.insertAdjacentHTML("beforeend", `<div>${html}</div>`); body.scrollTop = body.scrollHeight; };
    const cmds = {
      help: () => "Commands: <b>whoami</b>, <b>neofetch</b>, <b>projects</b>, <b>live</b>, <b>open</b> &lt;name&gt;, <b>experience</b>, <b>contact</b>, <b>theme</b> light|dark|system, <b>date</b>, <b>clear</b>",
      whoami: () => `${esc(D.name)}, ${esc(D.role)} (${esc(D.place)})`,
      neofetch: () => `<span class="nf"><span class="nf__logo">  ▄▄▄▄▄▄\n ██▀▀▀▀▀\n ██\n ██▄▄▄▄▄\n  ▀▀▀▀▀▀</span><span><b>chase@chaseos</b>\n-------------\nOS: ChaseOS 2026.11\nRole: ${esc(D.role)}\nLocation: ${esc(D.place)}\nProjects: ${D.projects.length} (${liveProjects().length} live)\nShell: chsh 1.0\nTheme: ${esc(document.documentElement.dataset.theme)}</span></span>`,
      projects: () => D.projects.map((p) => `${esc(p.id.padEnd(14, " "))} ${esc(STATUS[p.status])}`).join("<br>"),
      live: () => liveProjects().map((p) => `<a href="${esc(p.live)}" target="_blank" rel="noopener">${esc(p.live)}</a>`).join("<br>"),
      experience: () => D.jobs.map((j) => `${esc(j.when.padEnd(20, " "))} ${esc(j.role)}, ${esc(j.org)}`).join("<br>"),
      contact: () => D.links.map((l) => `${esc(l.label.padEnd(9, " "))}<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.text)}</a>`).join("<br>"),
      date: () => esc(new Date().toString()),
      theme: (arg) => { if (!["light", "dark", "system"].includes(arg)) return "Usage: theme light|dark|system"; setSetting("theme", arg); return `Theme set to ${arg}.`; },
      clear: () => { out.innerHTML = ""; return null; },
      open: (arg) => {
        if (APPS[arg]) { openApp(arg); return `Opening ${esc(APPS[arg].title)}…`; }
        const p = D.projects.find((x) => x.id === arg || x.name.toLowerCase() === arg);
        if (!p) return `No app or project called “${esc(arg)}”. Try <b>projects</b>.`;
        if (p.live) { openBrowser(p.live, p.name); return `Opening ${esc(p.name)}…`; }
        openApp("projects", { select: p.id }); return `${esc(p.name)} has no live site; showing it in Projects.`;
      },
    };
    print(`ChaseOS terminal. Type <b>help</b>, or try <b>neofetch</b>.`);
    $("form", body).addEventListener("submit", (e) => {
      e.preventDefault();
      const line = input.value.trim(); input.value = "";
      if (!line) return;
      history.push(line); hi = history.length;
      print(`<span class="term__ps">chase@os:~$</span> ${esc(line)}`);
      const [cmd, ...rest] = line.split(/\s+/);
      const fn = cmds[cmd.toLowerCase()];
      const res = fn ? fn(rest.join(" ").toLowerCase()) : `${esc(cmd)}: command not found. Type <b>help</b>.`;
      if (res) print(res);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && hi > 0) { e.preventDefault(); input.value = history[--hi]; }
      if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(history.length, hi + 1); input.value = history[hi] || ""; }
    });
    body.addEventListener("click", () => { if (!getSelection().toString()) input.focus(); });
    setTimeout(() => input.focus(), 0);
  }

  function renderBrowser(body, w, opts) {
    body.classList.add("browser");
    const start = opts.url || "";
    body.innerHTML = `
      <form class="br-bar">
        <button type="button" class="icon-btn" data-b="reload" aria-label="Reload">${UI.reload}</button>
        <label class="sr" for="${w.key}-url">Address</label>
        <input id="${w.key}-url" class="br-url" value="${esc(start)}" placeholder="Pick a live site below" spellcheck="false">
        <a class="icon-btn br-ext" href="${esc(start || "#")}" target="_blank" rel="noopener" aria-label="Open in a new tab">${UI.external}</a>
      </form>
      <div class="br-view">
        ${start ? `<iframe title="${esc(opts.title || "Web page")}" src="${esc(start)}" referrerpolicy="no-referrer"></iframe>` : ""}
        <div class="br-home"${start ? " hidden" : ""}>
          <h3>Live sites</h3>
          <ul class="plain">${liveProjects().map((p) => `<li class="wp-row"><span class="dot" aria-hidden="true"></span><span class="w-name"><b>${esc(p.name)}</b><small>${esc(p.where)}</small></span><button type="button" class="btn btn--s" data-go="${esc(p.live)}">Open</button></li>`).join("")}</ul>
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
  let booted = false;
  function boot() {
    if (booted) return; booted = true;
    const hash = location.hash.slice(1);
    if (APPS[hash]) openApp(hash);
    else if (findProject(hash)) openApp("projects", { select: hash });
    else openApp("about", isNarrow() ? {} : { left: 220, top: 40 });
  }
  let unlocked = false;
  try { unlocked = sessionStorage.getItem("chaseos.unlocked") === "1"; } catch {}
  if (unlocked || location.hash.length > 1) boot(); else lock();
})();
