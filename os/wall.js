// Animated wave wallpaper (Vanta.js). Falls back to the static background in os.css
// when motion is reduced, WebGL is missing or the CDN did not load.
(() => {
  const el = document.getElementById("wall");
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.VANTA || !window.THREE) return;
  try {
    const fx = window.VANTA.WAVES({
      el,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      color: 0x0d2a4d,
      shininess: 38,
      waveHeight: 16,
      waveSpeed: 0.55,
      zoom: 0.88,
    });
    el.classList.add("is-live");
    // Save the GPU when the tab is hidden.
    document.addEventListener("visibilitychange", () => {
      if (!fx.renderer) return;
      if (document.hidden) fx.renderer.setAnimationLoop?.(null);
    });
  } catch {
    /* keep the static background */
  }
})();
