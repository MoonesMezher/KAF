/**
 * Cinematic geometry motion
 * Single RAF loop + mouse/scroll parallax.
 * Pauses when tab is hidden. No mouse parallax on touch.
 */

const Geometry = (() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let layers = [];
  let rafId = null;
  let running = false;
  let scrollTriggerReady = false;
  let scrollDirty = true;

  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const scrollOffset = { y: 0 };

  function initLayers() {
    const root = document.getElementById("cinematic-bg");
    if (!root) return;
    layers = Array.from(root.querySelectorAll(".cinematic-bg__layer")).map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth || "0.02")
    }));
  }

  function onMouseMove(e) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    target.x = (e.clientX - cx) / cx;
    target.y = (e.clientY - cy) / cy;
  }

  function onScroll() {
    scrollDirty = true;
  }

  function readScroll() {
    if (!scrollDirty) return;
    scrollDirty = false;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollOffset.y = (window.scrollY || 0) / max;
  }

  function tick(time) {
    if (!running) return;

    readScroll();

    mouse.x += (target.x - mouse.x) * 0.06;
    mouse.y += (target.y - mouse.y) * 0.06;

    const t = time * 0.001;
    const len = layers.length;

    for (let i = 0; i < len; i++) {
      const layer = layers[i];
      const depth = layer.depth;
      const mx = canHover ? mouse.x * depth * 28 : 0;
      const my = canHover ? mouse.y * depth * 22 : 0;
      const sy = scrollOffset.y * (10 + i * 8);
      const breatheX = Math.sin(t * 0.18 + i * 1.1) * (1.1 + i * 0.45);
      const breatheY = Math.cos(t * 0.14 + i * 0.8) * (0.9 + i * 0.35);
      const rot = Math.sin(t * 0.08 + i) * (0.12 + i * 0.1);

      layer.el.style.transform =
        `translate3d(${mx + breatheX}px, ${my - sy + breatheY}px, 0) rotate(${rot}deg)`;
    }

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion || running || !layers.length) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function initScrollTrigger() {
    if (scrollTriggerReady || reducedMotion) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    scrollTriggerReady = true;
    gsap.registerPlugin(ScrollTrigger);

    const back = document.querySelector(".cinematic-bg__layer--back .cinematic-bg__group");
    const mid = document.querySelector(".cinematic-bg__layer--mid .cinematic-bg__group");
    const fore = document.querySelector(".cinematic-bg__layer--fore .cinematic-bg__group");
    const heroGeom = document.querySelector(".hero__geom-svg");

    if (back) {
      gsap.to(back, {
        y: -50,
        rotation: -1.8,
        transformOrigin: "50% 50%",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    }

    if (mid) {
      gsap.to(mid, {
        y: -95,
        rotation: 2.2,
        transformOrigin: "50% 40%",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    }

    if (fore) {
      gsap.to(fore, {
        y: -140,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    }

    if (heroGeom) {
      gsap.to(heroGeom, {
        yPercent: -10,
        rotation: -1.2,
        transformOrigin: "40% 40%",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    gsap.utils.toArray(".section-geom").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 24, opacity: 0.4 },
        {
          y: -16,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top 85%",
            end: "bottom 25%",
            scrub: true
          }
        }
      );
    });

    const ctaPoly = document.querySelector(".section-geom--cta polygon");
    if (ctaPoly) {
      gsap.from(ctaPoly, {
        opacity: 0,
        scale: 0.94,
        transformOrigin: "50% 50%",
        duration: 1.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cta",
          start: "top 75%"
        }
      });
    }

    const midLayer = document.querySelector(".cinematic-bg__layer--mid");
    if (midLayer) {
      ScrollTrigger.create({
        trigger: "#work",
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            midLayer,
            { opacity: 0.6 },
            { opacity: 1, duration: 1.1, ease: "power2.out" }
          );
        }
      });
    }
  }

  function init() {
    initLayers();
    if (!layers.length) return;

    if (reducedMotion) return;

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (canHover) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    } else {
      document.documentElement.classList.add("is-touch-geometry");
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  return { init, initScrollTrigger, start, stop };
})();

window.Geometry = Geometry;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => Geometry.init());
} else {
  Geometry.init();
}
