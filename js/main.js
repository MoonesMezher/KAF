/**
 * Main interactions:
 * Lenis smooth scroll, custom cursor, menu, before/after,
 * video management, modal, capabilities, nav behavior
 */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let lenis = null;

  /* ------------------------------------------
     Smooth Scroll (Lenis)
  ------------------------------------------ */
  function initLenis() {
    if (reducedMotion || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Anchor links via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        closeModal();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      });
    });
  }

  /* ------------------------------------------
     Custom Cursor
  ------------------------------------------ */
  function initCursor() {
    const cursor = document.querySelector(".cursor");
    if (!cursor || !isFinePointer || reducedMotion) return;

    document.body.classList.add("has-custom-cursor");

    const label = cursor.querySelector(".cursor__label");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    let rafId = null;

    let firstMove = false;
    cursor.style.opacity = "0";

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!firstMove) {
        firstMove = true;
        pos.x = e.clientX;
        pos.y = e.clientY;
        cursor.classList.add("is-active");
        cursor.style.opacity = "1";
      }
    });

    function tick() {
      pos.x += (mouse.x - pos.x) * 0.22;
      pos.y += (mouse.y - pos.y) * 0.22;
      cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      rafId = requestAnimationFrame(tick);
    }
    tick();

    function setLabel(text) {
      if (!text) {
        cursor.classList.remove("is-label", "is-hover");
        label.textContent = "";
        return;
      }
      label.textContent = text;
      cursor.classList.add("is-label", "is-hover");
    }

    document.addEventListener("mouseover", (e) => {
      const el = e.target.closest("[data-cursor]");
      if (el) {
        setLabel(el.getAttribute("data-cursor"));
      }
    });

    document.addEventListener("mouseout", (e) => {
      const el = e.target.closest("[data-cursor]");
      if (el && !el.contains(e.relatedTarget)) {
        setLabel(null);
      }
    });

    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });

    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });

    window.addEventListener("beforeunload", () => {
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  /* ------------------------------------------
     Navigation / Menu
  ------------------------------------------ */
  const menuOverlay = document.getElementById("menu-overlay");
  const menuBtn = document.getElementById("menu-btn");
  const menuClose = document.getElementById("menu-close");
  const nav = document.getElementById("nav");

  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.add("is-open");
    menuOverlay.setAttribute("aria-hidden", "false");
    menuBtn?.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-menu-open");
    lenis?.stop();

    if (!reducedMotion && typeof gsap !== "undefined") {
      gsap.fromTo(
        ".menu-overlay__link",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        ".menu-overlay__socials",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.45 }
      );
    }

    menuClose?.focus();
  }

  function closeMenu() {
    if (!menuOverlay || !menuOverlay.classList.contains("is-open")) return;
    menuOverlay.classList.remove("is-open");
    menuOverlay.setAttribute("aria-hidden", "true");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-menu-open");
    lenis?.start();
    menuBtn?.focus();
  }

  function initMenu() {
    menuBtn?.addEventListener("click", openMenu);
    menuClose?.addEventListener("click", closeMenu);

    menuOverlay?.querySelectorAll(".menu-overlay__link").forEach((link) => {
      link.addEventListener("click", () => {
        setTimeout(closeMenu, 10);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
        closeModal();
      }
    });

    let lastY = 0;
    let navScrollTicking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (navScrollTicking) return;
        navScrollTicking = true;
        requestAnimationFrame(() => {
          navScrollTicking = false;
          if (document.body.classList.contains("is-menu-open")) return;
          const y = window.scrollY || document.documentElement.scrollTop;
          if (y > 120 && y > lastY) {
            nav?.classList.add("is-hidden");
          } else {
            nav?.classList.remove("is-hidden");
          }
          lastY = y;
        });
      },
      { passive: true }
    );
  }

  /* ------------------------------------------
     Hero timecode + preview video
  ------------------------------------------ */
  function initHeroVideo() {
    const hero = document.getElementById("hero");
    const timecodeEl = document.getElementById("hero-timecode");
    const video = document.getElementById("hero-video");

    if (timecodeEl && !reducedMotion) {
      const start = performance.now();
      let rafId = null;
      let lastPaint = 0;

      function updateTc(now) {
        if (document.hidden) {
          rafId = null;
          return;
        }
        if (now - lastPaint >= 40) {
          lastPaint = now;
          const elapsed = (now - start) / 1000;
          const h = Math.floor(elapsed / 3600);
          const m = Math.floor((elapsed % 3600) / 60);
          const s = Math.floor(elapsed % 60);
          const f = Math.floor((elapsed % 1) * 24);
          timecodeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
        }
        rafId = requestAnimationFrame(updateTc);
      }
      rafId = requestAnimationFrame(updateTc);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          if (rafId != null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        } else if (rafId == null) {
          rafId = requestAnimationFrame(updateTc);
        }
      });
    } else if (timecodeEl) {
      timecodeEl.textContent = "00:00:00:00";
    }

    if (video) {
      const onReady = () => video.classList.add("is-ready");
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", () => {
        video.style.display = "none";
      });
      if (video.readyState >= 2) onReady();

      const playToggle = document.getElementById("hero-play-toggle");
      const soundToggle = document.getElementById("hero-sound-toggle");
      const progressBar = document.getElementById("hero-progress-bar");

      if (playToggle) {
        const playIcon = playToggle.querySelector(".hero-showreel__icon-play");
        const pauseIcon = playToggle.querySelector(".hero-showreel__icon-pause");
        playToggle.addEventListener("click", () => {
          if (video.paused) {
            video.play().catch(() => {});
            playIcon?.classList.add("is-hidden");
            pauseIcon?.classList.remove("is-hidden");
          } else {
            video.pause();
            playIcon?.classList.remove("is-hidden");
            pauseIcon?.classList.add("is-hidden");
          }
        });

        video.addEventListener("play", () => {
          playIcon?.classList.add("is-hidden");
          pauseIcon?.classList.remove("is-hidden");
        });
        video.addEventListener("pause", () => {
          playIcon?.classList.remove("is-hidden");
          pauseIcon?.classList.add("is-hidden");
        });
      }

      if (soundToggle) {
        const mutedIcon = soundToggle.querySelector(".hero-showreel__icon-muted");
        const unmutedIcon = soundToggle.querySelector(".hero-showreel__icon-unmuted");
        soundToggle.addEventListener("click", () => {
          video.muted = !video.muted;
          if (video.muted) {
            mutedIcon?.classList.remove("is-hidden");
            unmutedIcon?.classList.add("is-hidden");
          } else {
            mutedIcon?.classList.add("is-hidden");
            unmutedIcon?.classList.remove("is-hidden");
          }
        });
      }

      if (progressBar) {
        video.addEventListener("timeupdate", () => {
          if (video.duration) {
            const pct = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${pct}%`;
          }
        });
      }
    }

    if (hero && "IntersectionObserver" in window) {
      const orbit = document.getElementById("bg-orbit");
      const io = new IntersectionObserver(
        ([entry]) => {
          const active = entry.isIntersecting;
          hero.classList.toggle("is-active", active && !reducedMotion);
          orbit?.classList.toggle("is-active", active && !reducedMotion);

          if (!video) return;
          if (active) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: 0.15 }
      );
      io.observe(hero);
    } else if (hero && !reducedMotion) {
      hero.classList.add("is-active");
      document.getElementById("bg-orbit")?.classList.add("is-active");
      video?.play().catch(() => {});
    }
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  /* ------------------------------------------
     Before / After slider
  ------------------------------------------ */
  function initCompare() {
    const stage = document.getElementById("compare-stage");
    const before = document.getElementById("compare-before");
    const handle = document.getElementById("compare-handle");
    const beforeVideo = document.getElementById("before-video");
    const afterVideo = document.getElementById("after-video");
    const audioBtn = document.getElementById("compare-audio-toggle");

    if (!stage || !before || !handle) return;

    let isMuted = true; // Starts muted so browsers allow instant autoplay; unmutes via toggle button or first stage interaction
    let ratio = 0.5;
    let dragging = false;
    let pendingX = null;
    let dragRaf = null;
    let stageWidth = 0;

    /* ------------------------------------------
       After Video Audio Playback (Single Audio Track)
       Only the After / Final Master video plays audio.
       The Raw / Before video is permanently muted.
    ------------------------------------------ */
    function applyAudioMix() {
      if (!beforeVideo || !afterVideo) return;

      // Raw / Before video audio is always permanently muted
      beforeVideo.muted = true;
      beforeVideo.volume = 0;

      // Only After / Final video plays audio
      if (isMuted) {
        afterVideo.muted = true;
      } else {
        afterVideo.muted = false;
        afterVideo.volume = 1;
      }
      updateAudioUI();
    }

    function updateAudioUI() {
      if (!audioBtn) return;
      audioBtn.setAttribute("aria-pressed", String(!isMuted));
      audioBtn.classList.toggle("is-muted", isMuted);
      const label = audioBtn.querySelector(".compare__audio-label");
      if (label) {
        label.textContent = isMuted ? "TAP FOR SOUND" : "AFTER AUDIO";
      }
    }

    function playBothVideos() {
      if (!beforeVideo || !afterVideo) return;
      applyAudioMix();
      if (beforeVideo.paused) beforeVideo.play().catch(() => {});
      if (afterVideo.paused) afterVideo.play().catch(() => {});
    }

    function toggleAudio(e) {
      if (e) e.stopPropagation();
      isMuted = !isMuted;
      applyAudioMix();
      playBothVideos();
      updateAudioUI();
    }

    if (audioBtn) {
      audioBtn.addEventListener("click", toggleAudio);
    }

    // Allow user to unmute when interacting directly with the compare stage
    function tryUnmuteOnInteraction() {
      if (isMuted) {
        isMuted = false;
        applyAudioMix();
        playBothVideos();
      }
      stage.removeEventListener("pointerdown", tryUnmuteOnInteraction);
    }
    stage.addEventListener("pointerdown", tryUnmuteOnInteraction, { passive: true });

    function measure() {
      stageWidth = stage.getBoundingClientRect().width || 1;
    }

    function applyRatio() {
      const pct = ratio * 100;
      stage.style.setProperty("--compare", `${pct}%`);
      handle.style.transform = `translate3d(${ratio * stageWidth - 22}px, 0, 0)`;
      handle.setAttribute("aria-valuenow", String(Math.round(pct)));
      applyAudioMix();
    }

    function setPosition(clientX) {
      const rect = stage.getBoundingClientRect();
      stageWidth = rect.width || 1;
      ratio = Math.min(1, Math.max(0, (clientX - rect.left) / stageWidth));
      applyRatio();
    }

    function onPointerDown(e) {
      dragging = true;
      tryUnmuteOnInteraction();
      stage.setPointerCapture?.(e.pointerId);
      setPosition(e.clientX);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      pendingX = e.clientX;
      if (dragRaf != null) return;
      dragRaf = requestAnimationFrame(() => {
        dragRaf = null;
        if (pendingX != null) setPosition(pendingX);
      });
    }

    function onPointerUp() {
      dragging = false;
      pendingX = null;
    }

    handle.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointerdown", (e) => {
      if (e.target === handle || handle.contains(e.target)) return;
      onPointerDown(e);
    });
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("lostpointercapture", onPointerUp);

    handle.addEventListener("keydown", (e) => {
      let next = ratio;
      if (e.key === "ArrowLeft") next -= 0.05;
      if (e.key === "ArrowRight") next += 0.05;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = 1;
      if (next !== ratio) {
        e.preventDefault();
        measure();
        ratio = Math.min(1, Math.max(0, next));
        applyRatio();
      }
    });

    measure();
    applyRatio();
    window.addEventListener("resize", () => {
      measure();
      applyRatio();
    }, { passive: true });

    function setupCompareVideo(video) {
      if (!video) return;
      const panel = video.closest(".compare__panel");
      const placeholder = panel?.querySelector(".compare__placeholder");

      function onReady() {
        video.style.opacity = "1";
        if (placeholder) placeholder.style.display = "none";
        video.play().catch(() => {});
      }

      video.addEventListener("loadedmetadata", onReady);
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("canplay", onReady);
      video.addEventListener("playing", onReady);

      if (video.readyState >= 1) {
        onReady();
      }

      video.addEventListener("error", () => {
        video.style.display = "none";
        if (placeholder) placeholder.style.display = "flex";
      });

      // Muted playback is guaranteed to run on all browsers
      video.muted = true;
      video.play().catch(() => {});
    }

    setupCompareVideo(beforeVideo);
    setupCompareVideo(afterVideo);

    let syncRaf = null;
    function syncVideos() {
      if (!beforeVideo || !afterVideo) return;
      if (Math.abs(beforeVideo.currentTime - afterVideo.currentTime) > 0.08) {
        afterVideo.currentTime = beforeVideo.currentTime;
      }
    }

    if (beforeVideo && afterVideo) {
      beforeVideo.addEventListener("timeupdate", () => {
        if (syncRaf != null) return;
        syncRaf = requestAnimationFrame(() => {
          syncRaf = null;
          syncVideos();
        });
      });
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            playBothVideos();
            syncVideos();
          } else {
            beforeVideo?.pause();
            afterVideo?.pause();
          }
        },
        { threshold: 0.05, rootMargin: "200px" }
      );
      io.observe(stage);
    }
    applyAudioMix();
  }


  /* ------------------------------------------
     About media fallback
  ------------------------------------------ */
  function initAboutMedia() {
    const img = document.getElementById("about-image");
    const video = document.getElementById("about-video");
    const placeholder = document.querySelector(".about__placeholder");

    if (img) {
      img.addEventListener("load", () => {
        img.classList.add("is-ready");
        if (placeholder) placeholder.style.display = "none";
      });
      img.addEventListener("error", () => {
        img.style.display = "none";
      });
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add("is-ready");
        if (placeholder) placeholder.style.display = "none";
      } else if (img.complete) {
        img.style.display = "none";
      }
    }

    if (video) {
      video.addEventListener("loadeddata", () => {
        video.classList.add("is-ready");
        if (img) img.style.display = "none";
        if (placeholder) placeholder.style.display = "none";
      });
      video.addEventListener("error", () => {
        video.style.display = "none";
      });

      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          },
          { threshold: 0.3 }
        );
        io.observe(video);
      }
    }
  }

  /* ------------------------------------------
     Capabilities (mobile toggle)
  ------------------------------------------ */
  function initCapabilities() {
    document.querySelectorAll(".capability__trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".capability");
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ------------------------------------------
     Project Modal
  ------------------------------------------ */
  const modal = document.getElementById("project-modal");
  const modalVideo = document.getElementById("modal-video");
  const modalPlaceholder = document.getElementById("modal-placeholder");
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalDesc = document.getElementById("modal-desc");
  const modalTools = document.getElementById("modal-tools");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalBackdrop = document.getElementById("modal-backdrop");

  function openProjectModal(project) {
    if (!modal || !project) return;

    const panel = modal.querySelector(".project-modal__panel");
    if (panel) {
      panel.classList.toggle("is-portrait", project.orientation === "portrait");
    }

    modalPlaceholder?.classList.remove("is-hidden");
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();
      modalVideo.src = project.video;
      modalVideo.onloadeddata = () => {
        modalPlaceholder?.classList.add("is-hidden");
        modalVideo.play().catch(() => {});
      };
      modalVideo.onerror = () => {
        modalPlaceholder?.classList.remove("is-hidden");
        modalVideo.removeAttribute("src");
      };
      modalVideo.play().catch(() => {});
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");
    lenis?.stop();
    modalCloseBtn?.focus();
  }

  function closeModal() {
    if (!modal?.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-modal-open");
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();
    }
    lenis?.start();
  }

  function initModal() {
    modalCloseBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });
    modalBackdrop?.addEventListener("click", closeModal);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("is-open")) {
        closeModal();
      }
    });
    window.openProjectModal = openProjectModal;
  }

  /* ------------------------------------------
     Hero Showreel Video Player
  ------------------------------------------ */
  function initHeroVideo() {
    const video = document.getElementById("hero-video");
    const playBtn = document.getElementById("hero-play-toggle");
    const soundBtn = document.getElementById("hero-sound-toggle");
    const playIcon = playBtn?.querySelector(".hero-showreel__icon-play");
    const pauseIcon = playBtn?.querySelector(".hero-showreel__icon-pause");
    const mutedIcon = soundBtn?.querySelector(".hero-showreel__icon-muted");
    const unmutedIcon = soundBtn?.querySelector(".hero-showreel__icon-unmuted");
    const progressBar = document.getElementById("hero-progress-bar");
    const timecode = document.getElementById("hero-timecode");
    if (!video) return;

    function updatePlayState() {
      const isPaused = video.paused;
      playIcon?.classList.toggle("is-hidden", !isPaused);
      pauseIcon?.classList.toggle("is-hidden", isPaused);
    }

    function updateSoundState() {
      const isMuted = video.muted;
      mutedIcon?.classList.toggle("is-hidden", !isMuted);
      unmutedIcon?.classList.toggle("is-hidden", isMuted);
    }

    playBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      updatePlayState();
    });

    soundBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      updateSoundState();
    });

    video.addEventListener("play", updatePlayState);
    video.addEventListener("pause", updatePlayState);

    video.addEventListener("timeupdate", () => {
      if (video.duration && progressBar) {
        const pct = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${pct}%`;
      }
      if (timecode) {
        const t = video.currentTime;
        const fps = 60;
        const totalFrames = Math.floor(t * fps);
        const ff = String(totalFrames % fps).padStart(2, "0");
        const s = Math.floor(t % 60);
        const ss = String(s).padStart(2, "0");
        const m = Math.floor((t / 60) % 60);
        const mm = String(m).padStart(2, "0");
        const h = Math.floor(t / 3600);
        const hh = String(h).padStart(2, "0");
        timecode.textContent = `${hh}:${mm}:${ss}:${ff}`;
      }
    });

    // Toggle playback on stage click
    video.parentElement?.addEventListener("click", (e) => {
      if (e.target.closest("#hero-sound-toggle") || e.target.closest("#hero-play-toggle")) return;
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      updatePlayState();
    });

    // Initial play state sync
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => updatePlayState()).catch(() => updatePlayState());
    }
  }

  /* ------------------------------------------
     Footer year
  ------------------------------------------ */
  function initFooter() {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------
     Back to top
  ------------------------------------------ */
  function initToTop() {
    const btn = document.getElementById("to-top");
    if (!btn) return;

    const threshold = 480;
    let ticking = false;

    function update() {
      ticking = false;
      const y = window.scrollY || document.documentElement.scrollTop;
      const show = y > threshold;
      btn.classList.toggle("is-visible", show);
      btn.setAttribute("aria-hidden", show ? "false" : "true");
      btn.tabIndex = show ? 0 : -1;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();

    btn.addEventListener("click", () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.35 });
      } else {
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      }
    });
  }

  /* ------------------------------------------
     Boot
  ------------------------------------------ */
  async function boot() {
    try { initFooter(); } catch (e) { console.warn(e); }
    try { initCursor(); } catch (e) { console.warn(e); }
    try { initMenu(); } catch (e) { console.warn(e); }
    try { initModal(); } catch (e) { console.warn(e); }
    try { initCompare(); } catch (e) { console.warn(e); }
    try { initAboutMedia(); } catch (e) { console.warn(e); }
    try { initCapabilities(); } catch (e) { console.warn(e); }
    try { initHeroVideo(); } catch (e) { console.warn(e); }
    try { if (window.QuoteSlider) QuoteSlider.init(); } catch (e) { console.warn(e); }

    // Portfolio first so DOM exists for animations
    try {
      if (window.Portfolio) {
        Portfolio.init();
      }
    } catch (e) { console.warn(e); }

    try { initLenis(); } catch (e) { console.warn(e); }
    try { initToTop(); } catch (e) { console.warn(e); }

    try {
      if (window.Animations) {
        await Animations.init();
        // Re-bind work item scroll animations after filter renders
        const grid = document.getElementById("work-grid");
        if (grid) {
          const observer = new MutationObserver(() => {
            Animations.refreshWorkAnimations?.();
          });
          observer.observe(grid, { childList: true });
        }
      } else {
        const p = document.getElementById("preloader");
        if (p) {
          p.classList.add("is-done");
          p.style.display = "none";
        }
        document.body.classList.add("is-loaded");
      }
    } catch (e) {
      console.warn("Animations init error:", e);
      const p = document.getElementById("preloader");
      if (p) {
        p.classList.add("is-done");
        p.style.display = "none";
      }
      document.body.classList.add("is-loaded");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
