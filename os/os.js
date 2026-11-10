// ChaseOS: a simple desktop. One icon, one thing. Content comes from data.js (window.CHASE).
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

  // ---------- icons (drawn for this site) ----------
  let gid = 0;
  const lin = (a, b) => `<linearGradient id="g${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const tile = (a, b, inner) => { gid++; return `<svg viewBox="0 0 48 48" aria-hidden="true"><defs>${lin(a, b)}</defs><rect x="4" y="4" width="40" height="40" rx="10" fill="url(#g${gid})"/><rect x="4" y="4" width="40" height="20" rx="10" fill="#fff" opacity=".1"/>${inner}</svg>`; };
  const W = 'fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const ICON = {
    logo: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 9.4a3.6 3.6 0 1 0 0 5.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    about: () => tile("#5aa2ff", "#2557d6", `<circle cx="24" cy="19" r="6.5" fill="#fff"/><path d="M12.5 37c2.2-5.6 6.4-8.2 11.5-8.2s9.3 2.6 11.5 8.2" fill="#fff"/>`),
    experience: () => tile("#d08a4e", "#8f4f22", `<path d="M18 16v-2.5a2.5 2.5 0 0 1 2.5-2.5h7a2.5 2.5 0 0 1 2.5 2.5V16" ${W}/><rect x="11" y="16" width="26" height="19" rx="3" fill="#fff" opacity=".92"/><rect x="21.5" y="22" width="5" height="6" rx="1" fill="#a3602f"/>`),
    roadmap: () => tile("#3fcf8e", "#13865a", `<path d="M16 36V13m0 0h15l-3.5 5L31 23H16" ${W}/>`),
    contact: () => tile("#ff8a65", "#d8432b", `<rect x="11" y="15" width="26" height="18" rx="3" fill="#fff"/><path d="M12 17l12 9 12-9" fill="none" stroke="#d8432b" stroke-width="2.6" stroke-linejoin="round"/>`),
    terminal: () => tile("#3a4152", "#0f1218", `<path d="M14 18l6 6-6 6" fill="none" stroke="#7ee787" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 31h11" stroke="#d6dde8" stroke-width="3" stroke-linecap="round"/>`),
    tools: () => tile("#9aa7bd", "#4f5b70", `<path d="M30.5 13.5a6 6 0 0 0-7.6 7.6L13 31l4 4 9.9-9.9a6 6 0 0 0 7.6-7.6l-3.6 3.6-3.4-.6-.6-3.4z" fill="#fff"/>`),
    bot: () => tile("#7c8cff", "#4338ca", `<rect x="13" y="17" width="22" height="16" rx="5" fill="#fff"/><circle cx="19.5" cy="25" r="2.4" fill="#4338ca"/><circle cx="28.5" cy="25" r="2.4" fill="#4338ca"/><path d="M24 17v-4" ${W}/><circle cx="24" cy="12" r="2" fill="#fff"/>`),
    coin: () => tile("#ffcf4d", "#e08a00", `<circle cx="24" cy="24" r="11" fill="#fff" opacity=".95"/><circle cx="24" cy="24" r="7.5" fill="none" stroke="#e08a00" stroke-width="2.4"/><path d="M24 19.5v9" stroke="#e08a00" stroke-width="2.4" stroke-linecap="round"/>`),
    quiz: () => tile("#c86bff", "#7b2fd0", `<path d="M19 19a5 5 0 1 1 7 4.6c-1.3.6-2 1.6-2 3V28" ${W}/><circle cx="24" cy="33.5" r="2" fill="#fff"/>`),
    monitor: () => tile("#2dd4bf", "#0b7f8a", `<rect x="11" y="13" width="26" height="17" rx="2.5" fill="#fff"/><path d="M13.5 27l6-6 4 4 3-3 7 5" fill="none" stroke="#0b7f8a" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 35h8M24 30v5" ${W}/>`),
    form: () => tile("#4ade80", "#15803d", `<rect x="14" y="11" width="20" height="26" rx="3" fill="#fff"/><path d="M18.5 19h11M18.5 24h11M18.5 29h7" stroke="#15803d" stroke-width="2.2" stroke-linecap="round"/>`),
    chip: () => tile("#f472b6", "#be185d", `<rect x="15" y="15" width="18" height="18" rx="3" fill="#fff"/><path d="M19 15v-3M24 15v-3M29 15v-3M19 36v-3M24 36v-3M29 36v-3M15 19h-3M15 24h-3M15 29h-3M36 19h-3M36 24h-3M36 29h-3" ${W}/><rect x="20" y="20" width="8" height="8" rx="1.5" fill="#be185d"/>`),
    chat: () => tile("#38bdf8", "#0369a1", `<path d="M12 15a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H21l-6 5v-5h0a3 3 0 0 1-3-3z" fill="#fff"/><circle cx="19" cy="21" r="1.8" fill="#0369a1"/><circle cx="24" cy="21" r="1.8" fill="#0369a1"/><circle cx="29" cy="21" r="1.8" fill="#0369a1"/>`),
  };
  const UI = {
    min: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" stroke="currentColor" stroke-width="1.1"/></svg>`,
    max: `<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>`,
    close: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7m0-7l-7 7" stroke="currentColor" stroke-width="1.1"/></svg>`,
    external: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 3h4v4M13 3L7.5 8.5M12 9.5V13H3V4h3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const STATUS = { live: "Live", source: "Source on GitHub", private: "Private repo", building: "Building" };

  // ---------- desktop items: each icon is one thing ----------
  const ITEMS = [
    { id: "about", title: "About me", icon: "about", w: 520, h: 520, render: aboutBody },
    ...D.projects.map((p) => ({ id: p.id, title: p.name, icon: p.icon, live: p.status === "live", w: 560, h: 500, render: () => projectBody(p) })),
    { id: "experience", title: "Experience", icon: "experience", w: 620, h: 560, render: experienceBody },
    { id: "roadmap", title: "Roadmap", icon: "roadmap", w: 560, h: 540, render: roadmapBody },
    { id: "tools", title: "Earlier tools", icon: "tools", w: 620, h: 480, render: toolsBody },
    { id: "contact", title: "Contact", icon: "contact", w: 420, h: 300, render: contactBody },
    { id: "terminal", title: "Terminal", icon: "terminal", w: 640, h: 400, render: null, terminal: true },
  ];
  const byId = (id) => ITEMS.find((i) => i.id === id);

  // ---------- window manager ----------
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
        <span class="win__icon">${ICON[item.icon]()}</span>
        <h2 class="win__title" id="${id}-t">${esc(item.title)}</h2>
        <button type="button" class="win__btn" data-act="min" aria-label="Minimise">${UI.min}</button>
        <button type="button" class="win__btn" data-act="max" aria-label="Maximise">${UI.max}</button>
        <button type="button" class="win__btn win__btn--close" data-act="close" aria-label="Close">${UI.close}</button>
      </header>
      <div class="win__body${item.terminal ? " term" : ""}"></div>`;
    layer.append(el);
    const w = { id, item, el, min: false, max: false };
    wins.set(id, w);
    const body = $(".win__body", el);
    if (item.terminal) terminal(body); else body.innerHTML = item.render();
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
      left: `${clamp((a.width - width) / 2 + n * 26 - 20, 16, a.width - width - 16)}px`,
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
      const go = e.target.closest("[data-open]")?.dataset.open;
      if (go) open(go);
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Escape" && e.target.tagName !== "INPUT") close(w); });
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
  function aboutBody() {
    const live = D.projects.filter((p) => p.status === "live");
    return `<div class="pad">
      <div class="who"><span class="avatar avatar--l" aria-hidden="true">CT</span><div><h3>${esc(D.name)}</h3><p>${esc(D.role)}</p><p class="muted">${esc(D.place)}</p></div></div>
      <p>${esc(D.bio)}</p>
      <h4>Running right now</h4>
      <p class="muted small">Public sites, nothing to sign in to.</p>
      <ul class="rows">${live.map((p) => `<li><span class="dot" aria-hidden="true"></span><span><b>${esc(p.name)}</b><small>${esc(p.where)}</small></span><a class="btn btn--accent" href="${esc(p.live)}" target="_blank" rel="noopener">Open ${UI.external}</a></li>`).join("")}</ul>
      <p class="muted small hint">Double-click any icon on the desktop to open it.</p>
    </div>`;
  }

  function projectBody(p) {
    return `<div class="pad">
      <p class="status status--${p.status}"><span class="dot" aria-hidden="true"></span>${esc(STATUS[p.status])}${p.where ? `, ${esc(p.where)}` : ""}</p>
      <h3>${esc(p.name)}</h3>
      <p class="lede">${esc(p.summary)}</p>
      ${p.points.length ? `<ul class="points">${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      <p class="stack"><span class="muted">Built with</span> ${esc(p.stack)}</p>
      <div class="actions">
        ${p.live ? `<a class="btn btn--accent" href="${esc(p.live)}" target="_blank" rel="noopener">Open the live site ${UI.external}</a>` : ""}
        ${p.source ? `<a class="btn" href="${esc(p.source)}" target="_blank" rel="noopener">Source ${UI.external}</a>` : ""}
      </div>
    </div>`;
  }

  function experienceBody() {
    return `<div class="pad"><h3>Experience</h3><ol class="timeline">${D.jobs.map((j) => `
      <li><p class="muted small">${esc(j.when)}</p><h4>${esc(j.role)}</h4><p class="muted">${esc(j.org)}</p>
      <ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></li>`).join("")}</ol></div>`;
  }

  function roadmapBody() {
    return `<div class="pad"><h3>Where I am heading</h3>
      <ol class="steps">${D.roadmap.map((r, i) => `<li class="${r.now ? "is-now" : ""}"><span class="steps__n">${i + 1}</span><div><p class="muted small">${esc(r.when)}${r.now ? ", in progress" : ""}</p><h4>${esc(r.title)}</h4><p>${esc(r.text)}</p></div></li>`).join("")}</ol>
      <h4>Certifications</h4><ul class="points">${D.certs.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>`;
  }

  function toolsBody() {
    return `<div class="pad"><h3>Earlier tools</h3><p class="muted">Finished and on GitHub.</p>
      <ul class="tools">${D.tools.map((t) => `<li><a href="${esc(t.source)}" target="_blank" rel="noopener"><b>${esc(t.name)}</b> ${UI.external}</a><p>${esc(t.what)}</p><p class="muted small">${esc(t.stack)}</p></li>`).join("")}</ul></div>`;
  }

  function contactBody() {
    return `<div class="pad"><h3>Contact</h3><p class="muted">Open to cloud, DevOps and AI automation roles.</p>
      <ul class="links">${D.links.map((l) => `<li><span>${esc(l.label)}</span><a href="${esc(l.href)}"${ext(l.href)}>${esc(l.text)}</a></li>`).join("")}</ul></div>`;
  }

  function terminal(body) {
    body.innerHTML = `<div class="term__out" aria-live="polite"></div><form class="term__in"><label for="term-in" class="term__ps">chase@os:~$</label><input id="term-in" autocomplete="off" spellcheck="false" aria-label="Command"></form>`;
    const out = $(".term__out", body), input = $("input", body);
    const print = (h) => { out.insertAdjacentHTML("beforeend", `<div>${h}</div>`); body.scrollTop = body.scrollHeight; };
    const cmds = {
      help: () => "Commands: <b>whoami</b>, <b>ls</b>, <b>open</b> &lt;name&gt;, <b>live</b>, <b>contact</b>, <b>date</b>, <b>clear</b>",
      whoami: () => `${esc(D.name)}, ${esc(D.role)} (${esc(D.place)})`,
      ls: () => ITEMS.map((i) => esc(i.id)).join("  "),
      live: () => D.projects.filter((p) => p.live).map((p) => `<a href="${esc(p.live)}" target="_blank" rel="noopener">${esc(p.live)}</a>`).join("<br>"),
      contact: () => D.links.map((l) => `${esc(l.label.padEnd(9, " "))}<a href="${esc(l.href)}"${ext(l.href)}>${esc(l.text)}</a>`).join("<br>"),
      date: () => esc(new Date().toString()),
      clear: () => { out.innerHTML = ""; return ""; },
      open: (a) => (byId(a) ? (open(a), `Opening ${esc(byId(a).title)}…`) : `No icon called “${esc(a)}”. Try <b>ls</b>.`),
    };
    print("ChaseOS terminal. Type <b>help</b>.");
    $("form", body).addEventListener("submit", (e) => {
      e.preventDefault();
      const line = input.value.trim(); input.value = "";
      if (!line) return;
      print(`<span class="term__ps">chase@os:~$</span> ${esc(line)}`);
      const [c, ...rest] = line.split(/\s+/);
      const fn = cmds[c.toLowerCase()];
      const r = fn ? fn(rest.join(" ").toLowerCase()) : `${esc(c)}: command not found. Type <b>help</b>.`;
      if (r) print(r);
    });
    body.addEventListener("click", () => { if (!getSelection().toString()) input.focus(); });
    setTimeout(() => input.focus(), 0);
  }

  // ---------- desktop icons ----------
  const icons = $("#icons");
  icons.innerHTML = ITEMS.map((i) => `<li><button type="button" class="dicon" data-id="${i.id}"><span class="dicon__img">${ICON[i.icon]()}${i.live ? '<span class="dicon__live" title="Live">LIVE</span>' : ""}</span><span class="dicon__label">${esc(i.title)}</span></button></li>`).join("");
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
  startBtn.innerHTML = ICON.logo();
  $("#start-list").innerHTML = ITEMS.map((i) => `<li><button type="button" data-id="${i.id}">${ICON[i.icon]()}<span>${esc(i.title)}</span></button></li>`).join("");
  const setStart = (on) => {
    start.hidden = !on; startBtn.setAttribute("aria-expanded", String(on));
    if (on) { anim(start, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 180 }); $("button", start).focus(); }
  };
  startBtn.addEventListener("click", () => setStart(start.hidden));
  start.addEventListener("click", (e) => { const id = e.target.closest("[data-id]")?.dataset.id; if (id) { setStart(false); open(id); } });
  document.addEventListener("pointerdown", (e) => { if (!start.hidden && !e.target.closest("#start, #start-btn")) setStart(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !start.hidden) { setStart(false); startBtn.focus(); } });

  // ---------- taskbar: one button per open window ----------
  const tasks = $("#tasks");
  function renderTasks() {
    tasks.innerHTML = [...wins.values()].map((w) => `<li><button type="button" class="task${active === w && !w.min ? " is-active" : ""}" data-id="${w.id}">${ICON[w.item.icon]()}<span>${esc(w.item.title)}</span></button></li>`).join("");
  }
  tasks.addEventListener("click", (e) => {
    const w = wins.get(e.target.closest("[data-id]")?.dataset.id);
    if (!w) return;
    if (active === w && !w.min) minimise(w); else focus(w, true);
  });

  // ---------- clock ----------
  const tick = () => {
    const d = new Date();
    $("#clock-time").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    $("#clock-date").textContent = d.toLocaleDateString();
    $("#clock").dateTime = d.toISOString();
  };
  tick(); setInterval(tick, 15000);

  // ---------- boot ----------
  const hash = location.hash.slice(1);
  open(byId(hash) ? hash : "about");
})();
