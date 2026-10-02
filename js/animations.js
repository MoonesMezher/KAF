/**
 * GSAP + ScrollTrigger animations
 * Cinematic hero: FRAME → CUT → REVEAL
 */

const Animations = (() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initPreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return Promise.resolve();

    if (reducedMotion) {
      preloader.classList.add("is-done");
      preloader.style.display = "none";
      document.body.classList.add("is-loaded");
      return Promise.resolve();
    }

    const playhead = preloader.querySelector(".preloader__playhead");
    const timecode = document.getElementById("preloader-timecode");
    const name = preloader.querySelector(".preloader__name span");
    const mark = preloader.querySelector(".preloader__mark");

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 0.85,
            ease: "power4.inOut",
            onComplete: () => {
              preloader.classList.add("is-done");
              preloader.style.display = "none";
              document.body.classList.add("is-loaded");
              resolve();
            }
          });
        }
      });

      if (mark) {
        tl.to(mark, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power3.out"
        }, 0);
      }

      const tc = { f: 0 };
      tl.to(tc, {
        f: 48,
        duration: 0.85,
        ease: "none",
        onUpdate: () => {
          const frames = Math.floor(tc.f) % 24;
          const secs = Math.floor(tc.f / 24);
          if (timecode) {
            timecode.textContent = `00:00:0${secs}:${String(frames).padStart(2, "0")}`;
          }
        }
      }, 0.12);

      tl.to(playhead, { width: "100%", duration: 0.85, ease: "power2.inOut" }, 0.12);

      tl.to(name, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out"
      }, 0.4);

      tl.to({}, { duration: 0.25 });
    });
  }

  function initHero() {
    if (typeof gsap === "undefined") return;

    const panel = document.getElementById("hero-panel");
    const scroll = document.querySelector(".hero__scroll");

    if (!panel) return;

    if (reducedMotion) {
      gsap.set([panel, scroll], { clearProps: "all", opacity: 1, y: 0 });
      return;
    }

    gsap.set(panel, { opacity: 0, y: 28 });
    gsap.set(scroll, { opacity: 0 });

    const tl = gsap.timeline({ delay: 0.08 });

    tl.to(panel, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: "power3.out"
    });

    tl.to(
      scroll,
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      },
      "-=0.25"
    );
  }

  function initScrollAnimations() {
    if (reducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".section-header").forEach((header) => {
      gsap.from(header.children, {
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 36,
        opacity: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out"
      });
    });

    const creatorLines = document.querySelectorAll(".creator__line");
    if (creatorLines.length) {
      gsap.from(creatorLines, {
        scrollTrigger: {
          trigger: ".creator",
          start: "top 70%"
        },
        y: 70,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out"
      });
    }

    gsap.from(".creator__statement", {
      scrollTrigger: { trigger: ".creator__statement", start: "top 85%" },
      y: 28,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out"
    });

    gsap.from(".creator__platforms li", {
      scrollTrigger: { trigger: ".creator__platforms", start: "top 90%" },
      y: 18,
      opacity: 0,
      duration: 0.55,
      stagger: 0.05,
      ease: "power3.out"
    });

    gsap.utils.toArray(".capability").forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 90%" },
        x: i % 2 === 0 ? -36 : 36,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    });

    gsap.from(".process__stage", {
      scrollTrigger: { trigger: ".process__stages", start: "top 80%" },
      y: 44,
      opacity: 0,
      duration: 0.75,
      stagger: 0.08,
      ease: "power3.out"
    });

    gsap.from(".about__content > *", {
      scrollTrigger: { trigger: ".about__content", start: "top 75%" },
      y: 32,
      opacity: 0,
      duration: 0.8,
      stagger: 0.09,
      ease: "power3.out"
    });

    const philA = document.querySelector(".philosophy__line--a");
    const philB = document.querySelector(".philosophy__line--b");
    const philSign = document.querySelector(".philosophy__sign");

    if (philA && philB) {
      const philTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".philosophy",
          start: "top 60%",
          toggleActions: "play none none reverse"
        }
      });

      philTl.from(philA, { opacity: 0, y: 36, duration: 0.95, ease: "power3.out" });
      philTl.from(philB, { opacity: 0, y: 48, duration: 1.05, ease: "power3.out" }, "+=0.2");
      philTl.from(philSign, { opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.25");
    }

    // Testimonials section reveal
    gsap.from(".quote-slider", {
      scrollTrigger: { trigger: ".testimonials", start: "top 80%" },
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out"
    });

    gsap.from(".cta__index, .cta__title span, .cta__sub span, .cta .btn, .cta__socials, .cta__note", {
      scrollTrigger: { trigger: ".cta", start: "top 75%" },
      y: 36,
      opacity: 0,
      duration: 0.85,
      stagger: 0.07,
      ease: "power3.out"
    });

    gsap.utils.toArray(".work-item").forEach((item) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 88%" },
        y: 44,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out"
      });
    });

    const aboutMedia = document.querySelector(".about__media");
    if (aboutMedia) {
      gsap.to(aboutMedia.querySelectorAll(".about__video, .about__image, .about__placeholder"), {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: ".about",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }

    if (window.Geometry?.initScrollTrigger) {
      Geometry.initScrollTrigger();
    }
  }

  function refreshWorkAnimations() {
    if (reducedMotion || typeof ScrollTrigger === "undefined") return;
    ScrollTrigger.refresh();

    gsap.utils.toArray(".work-item").forEach((item) => {
      if (item.dataset.animated) return;
      item.dataset.animated = "true";
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 90%" },
        y: 36,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out"
      });
    });
  }

  async function init() {
    if (typeof gsap === "undefined") {
      document.body.classList.add("is-loaded");
      return;
    }

    await initPreloader();
    initHero();
    initScrollAnimations();
  }

  return { init, refreshWorkAnimations, reducedMotion };
})();

window.Animations = Animations;
