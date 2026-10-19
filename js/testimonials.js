/**
 * Cinematic quote / testimonial slider
 */

const QuoteSlider = (() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let root;
  let slides = [];
  let current = 0;
  let timer = null;
  let progressEl;
  let currentEl;
  let totalEl;
  let locked = false;
  const INTERVAL = 6500;

  function pad(n) {
    return String(n + 1).padStart(2, "0");
  }

  function updateChrome() {
    if (currentEl) currentEl.textContent = pad(current);
    if (totalEl) totalEl.textContent = String(slides.length).padStart(2, "0");
    if (progressEl) {
      const pct = ((current + 1) / slides.length) * 100;
      progressEl.style.width = `${pct}%`;
    }
  }

  function goTo(index, dir = 1) {
    if (locked || slides.length < 2) return;
    const next = (index + slides.length) % slides.length;
    if (next === current) return;

    locked = true;
    const prev = slides[current];
    const upcoming = slides[next];

    prev.classList.remove("is-active");
    prev.classList.add("is-exit");
    prev.setAttribute("aria-hidden", "true");

    upcoming.style.transform = reducedMotion
      ? "none"
      : `translateX(${dir > 0 ? 40 : -40}px) scale(0.985)`;
    upcoming.classList.add("is-active");
    upcoming.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      upcoming.style.transform = "";
    });

    window.setTimeout(() => {
      prev.classList.remove("is-exit");
      locked = false;
    }, reducedMotion ? 200 : 850);

    current = next;
    updateChrome();
    restartAutoplay();
  }

  function next() {
    goTo(current + 1, 1);
  }

  function prev() {
    goTo(current - 1, -1);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    if (reducedMotion || slides.length < 2) return;
    timer = setInterval(next, INTERVAL);
  }

  function bindSwipe() {
    const viewport = root.querySelector(".quote-slider__viewport");
    if (!viewport) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    viewport.addEventListener(
      "pointerdown",
      (e) => {
        tracking = true;
        startX = e.clientX;
        startY = e.clientY;
      },
      { passive: true }
    );

    viewport.addEventListener("pointerup", (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) next();
      else prev();
    });
  }

  function init() {
    root = document.getElementById("quote-slider");
    if (!root) return;

    slides = Array.from(root.querySelectorAll(".quote-slide"));
    progressEl = document.getElementById("quote-progress");
    currentEl = document.getElementById("quote-current");
    totalEl = document.getElementById("quote-total");

    document.getElementById("quote-next")?.addEventListener("click", next);
    document.getElementById("quote-prev")?.addEventListener("click", prev);

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    });

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", restartAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget)) restartAutoplay();
    });

    bindSwipe();
    updateChrome();

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) restartAutoplay();
          else stopAutoplay();
        },
        { threshold: 0.15 }
      );
      io.observe(root);
    } else {
      restartAutoplay();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else if (root.getBoundingClientRect().top < window.innerHeight) restartAutoplay();
    });
  }

  return { init, next, prev, goTo };
})();

window.QuoteSlider = QuoteSlider;
