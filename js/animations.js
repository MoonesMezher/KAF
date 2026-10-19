/**
 * GSAP + ScrollTrigger animations
 * Cinematic hero: FRAME → CUT → REVEAL
 */

const Animations = (() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dismissPreloader(preloader) {
    if (!preloader) return;
    preloader.classList.add("is-done");
    preloader.style.display = "none";
    document.body.classList.add("is-loaded");
  }

  function initPreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return Promise.resolve();

    if (reducedMotion || typeof gsap === "undefined") {
      dismissPreloader(preloader);
      return Promise.resolve();
    }

    const playhead = preloader.querySelector(".preloader__playhead");
    const timecode = document.getElementById("preloader-timecode");
    const name = preloader.querySelector(".preloader__name span");
    const mark = preloader.querySelector(".preloader__mark");

    return new Promise((resolve) => {
      // Robust failsafe: dismiss after 1.8s so user is NEVER blocked
      const fallbackTimer = setTimeout(() => {
        dismissPreloader(preloader);
        resolve();
      }, 1800);

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 0.65,
            ease: "power4.inOut",
            onComplete: () => {
              clearTimeout(fallbackTimer);
              dismissPreloader(preloader);
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

    // Minux section titles & headers
    gsap.utils.toArray(".section-title-box, .section-header__title, .video-header-flex, .work-header-flex, .process-title-flex, .testimonials-title-flex").forEach((header) => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: "top 88%",
          toggleActions: "play none none none"
        },
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out"
      });
    });

    // Process cards stagger
    gsap.from(".process-items", {
      scrollTrigger: { trigger: ".process-wrapper", start: "top 80%" },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    });

    // Capabilities reveal
    gsap.utils.toArray(".capability").forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 90%" },
        x: i % 2 === 0 ? -28 : 28,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out"
      });
    });

    // About content
    gsap.from(".about__content > *", {
      scrollTrigger: { trigger: ".about__content", start: "top 75%" },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out"
    });

    // Testimonials section reveal
    gsap.from(".quote-slider", {
      scrollTrigger: { trigger: ".testimonials-section", start: "top 80%" },
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out"
    });

    // CTA section reveal
    gsap.from(".cta__title > *, .cta__button-wrap, .cta__socials-box, .cta__status-badge", {
      scrollTrigger: { trigger: ".cta-section", start: "top 75%" },
      y: 32,
      opacity: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: "power3.out"
    });

    gsap.utils.toArray(".work-item").forEach((item) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 88%" },
        y: 36,
        opacity: 0,
        duration: 0.8,
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
      dismissPreloader(document.getElementById("preloader"));
      return;
    }

    await initPreloader();
    initHero();
    initScrollAnimations();
  }

  return { init, refreshWorkAnimations, reducedMotion };
})();

window.Animations = Animations;
