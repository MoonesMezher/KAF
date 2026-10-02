/**
 * Portfolio data + rendering + filtering
 * Editorial layout variants via `layout` field.
 */

const projects = [
  {
    id: 1,
    title: "Personal Brand Reel",
    category: ["instagram", "short-form"],
    platform: "Instagram",
    type: "Personal Brand",
    year: "2026",
    orientation: "portrait",
    layout: "portrait",
    video: "assets/videos/project-01.mp4",
    thumbnail: "assets/images/project-01.webp",
    description: "[Placeholder] Short-form edit built around a strong hook and clean pacing for a personal brand.",
    tools: ["Premiere Pro", "After Effects"]
  },
  {
    id: 2,
    title: "Long-Form Story Cut",
    category: ["youtube"],
    platform: "YouTube",
    type: "Long-form Content",
    year: "2026",
    orientation: "landscape",
    layout: "wide",
    video: "assets/videos/project-02.mp4",
    thumbnail: "assets/images/project-02.webp",
    description: "[Placeholder] Narrative-driven YouTube edit focused on retention, rhythm, and clear story beats.",
    tools: ["Premiere Pro", "Audition"]
  },
  {
    id: 3,
    title: "Social Series Pack",
    category: ["facebook", "short-form", "social-ads"],
    platform: "Facebook",
    type: "Social Media",
    year: "2026",
    orientation: "portrait",
    layout: "offset",
    video: "assets/videos/project-03.mp4",
    thumbnail: "assets/images/project-03.webp",
    description: "[Placeholder] Multi-cut short-form package designed for feed performance and brand consistency.",
    tools: ["Premiere Pro", "Motion Graphics"]
  },
  {
    id: 4,
    title: "Brand Spot",
    category: ["cinematic", "social-ads"],
    platform: "Multi-platform",
    type: "Commercial",
    year: "2026",
    orientation: "landscape",
    layout: "full",
    video: "assets/videos/project-04.mp4",
    thumbnail: "assets/images/project-04.webp",
    description: "[Placeholder] Cinematic brand content with intentional color, sound, and editorial pacing.",
    tools: ["Premiere Pro", "Color", "Sound Design"]
  },
  {
    id: 5,
    title: "Motion Opener",
    category: ["motion", "youtube"],
    platform: "YouTube",
    type: "Motion Graphics",
    year: "2026",
    orientation: "landscape",
    layout: "mid",
    video: "assets/videos/project-05.mp4",
    thumbnail: "assets/images/project-05.webp",
    description: "[Placeholder] Title sequence and motion accents that support the story without overpowering it.",
    tools: ["After Effects", "Premiere Pro"]
  },
  {
    id: 6,
    title: "Creator Highlight",
    category: ["instagram", "cinematic", "short-form"],
    platform: "Instagram",
    type: "Short-form",
    year: "2026",
    orientation: "portrait",
    layout: "portrait",
    video: "assets/videos/project-06.mp4",
    thumbnail: "assets/images/project-06.webp",
    description: "[Placeholder] Vertical cinematic cut shaped for Reels — mood, timing, and a memorable finish.",
    tools: ["Premiere Pro", "Color"]
  }
];

const LAYOUT_CLASS = {
  wide: "work-item--wide",
  offset: "work-item--offset",
  mid: "work-item--mid",
  full: "work-item--full",
  portrait: "work-item--portrait"
};

const Portfolio = (() => {
  let currentFilter = "all";
  let grid = null;
  let activeHoverId = null;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function matchesFilter(project, filter) {
    if (filter === "all") return true;
    return project.category.includes(filter);
  }

  function createPlaceholder(num) {
    return `
      <div class="work-item__placeholder" aria-hidden="true">
        <span class="work-item__placeholder-num">${pad(num)}</span>
        <span>VIDEO PREVIEW</span>
      </div>
    `;
  }

  function createMedia(project, index) {
    const num = index + 1;
    return `
      <div class="work-item__media">
        <video
          class="work-item__video"
          muted
          loop
          playsinline
          preload="none"
          data-src="${project.video}"
          poster="${project.thumbnail}"
          aria-hidden="true"
        ></video>
        <img
          class="work-item__thumb"
          src="${project.thumbnail}"
          alt="${project.title} — ${project.type} edit"
          width="1280"
          height="720"
          loading="lazy"
          data-fallback="true"
        >
        ${createPlaceholder(num)}
      </div>
    `;
  }

  function createItem(project, index) {
    const num = index + 1;
    const cats = project.category.join(" ");
    // Use one layout class only — avoid conflicting grid rules
    const layoutKey = project.layout || (project.orientation === "portrait" ? "portrait" : "wide");
    const layoutClass = LAYOUT_CLASS[layoutKey] || LAYOUT_CLASS.wide;

    return `
      <article
        class="work-item ${layoutClass}"
        role="listitem"
        data-id="${project.id}"
        data-categories="${cats}"
        data-orientation="${project.orientation}"
        data-cursor="PLAY"
        tabindex="0"
        aria-label="${project.title} — ${project.platform}"
      >
        ${createMedia(project, index)}
        <div class="work-item__info">
          <span class="work-item__index">${pad(num)}</span>
          <h3 class="work-item__title">${project.title}</h3>
          <div class="work-item__meta">
            <span>${project.type}</span>
            <span>${project.platform}</span>
            <span>${project.year || "2026"}</span>
          </div>
          <p class="work-item__desc">${project.description}</p>
          <ul class="work-item__tools">
            ${project.tools.map((t) => `<li>${t}</li>`).join("")}
          </ul>
          <span class="work-item__view">VIEW PROJECT <span aria-hidden="true">↗</span></span>
        </div>
      </article>
    `;
  }

  function render(filter = "all") {
    if (!grid) return;

    currentFilter = filter;
    const filtered = projects.filter((p) => matchesFilter(p, filter));

    if (filtered.length === 0) {
      grid.innerHTML = `<p class="work__empty">No projects in this category yet.</p>`;
      return;
    }

    grid.innerHTML = filtered.map((project, i) => createItem(project, i)).join("");
    bindItemEvents();
    setupMediaFallbacks();
  }

  function setupMediaFallbacks() {
    const items = grid.querySelectorAll(".work-item");

    items.forEach((item) => {
      const thumb = item.querySelector(".work-item__thumb");
      const video = item.querySelector(".work-item__video");
      const placeholder = item.querySelector(".work-item__placeholder");

      if (thumb) {
        thumb.addEventListener("error", () => {
          thumb.style.display = "none";
          if (placeholder) placeholder.style.display = "flex";
        });
        thumb.addEventListener("load", () => {
          if (placeholder) placeholder.style.display = "none";
        });
        if (thumb.complete && thumb.naturalWidth === 0) {
          thumb.style.display = "none";
        } else if (thumb.complete && thumb.naturalWidth > 0) {
          if (placeholder) placeholder.style.display = "none";
        }
      }

      if (video) {
        video.addEventListener("error", () => {
          video.removeAttribute("src");
          video.load();
        });
      }
    });
  }

  function loadVideoSource(video) {
    if (!video || video.dataset.loaded === "true") return Promise.resolve(true);
    const src = video.dataset.src;
    if (!src) return Promise.resolve(false);

    video.src = src;
    video.dataset.loaded = "true";

    return new Promise((resolve) => {
      const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onError);
        resolve(true);
      };
      const onError = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onError);
        video.dataset.loaded = "error";
        resolve(false);
      };
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", onError);
      video.load();
    });
  }

  async function playPreview(item) {
    const id = item.dataset.id;
    activeHoverId = id;

    const video = item.querySelector(".work-item__video");
    const thumb = item.querySelector(".work-item__thumb");
    if (!video) return;

    const ok = await loadVideoSource(video);
    if (!ok || activeHoverId !== id) return;

    try {
      await video.play();
      if (thumb) thumb.style.opacity = "0";
      video.style.opacity = "1";
    } catch (_) {
      /* keep thumbnail */
    }
  }

  function pausePreview(item) {
    const video = item.querySelector(".work-item__video");
    const thumb = item.querySelector(".work-item__thumb");
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    video.style.opacity = "0";
    if (thumb) thumb.style.opacity = "1";
  }

  function setDimState(activeItem) {
    const items = grid.querySelectorAll(".work-item");
    items.forEach((item) => {
      if (!activeItem) {
        item.classList.remove("is-dimmed");
      } else {
        item.classList.toggle("is-dimmed", item !== activeItem);
      }
    });

    document.body.classList.toggle("is-work-focus", Boolean(activeItem));
  }

  function bindItemEvents() {
    const items = grid.querySelectorAll(".work-item");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    items.forEach((item) => {
      if (canHover) {
        item.addEventListener("mouseenter", () => {
          playPreview(item);
          setDimState(item);
        });

        item.addEventListener("mouseleave", () => {
          activeHoverId = null;
          pausePreview(item);
          setDimState(null);
        });
      }

      item.addEventListener("click", () => openProject(item.dataset.id));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject(item.dataset.id);
        }
      });
    });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              pausePreview(entry.target);
              entry.target.classList.remove("is-dimmed");
            }
          });
        },
        { threshold: 0.15 }
      );
      items.forEach((item) => io.observe(item));
    }
  }

  function openProject(id) {
    const project = projects.find((p) => String(p.id) === String(id));
    if (!project || typeof window.openProjectModal !== "function") return;
    window.openProjectModal(project);
  }

  function bindFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        buttons.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        render(filter);
      });
    });
  }

  function init() {
    grid = document.getElementById("work-grid");
    if (!grid) return;
    bindFilters();
    render("all");
  }

  return { init, render, projects, loadVideoSource };
})();

window.Portfolio = Portfolio;
window.projects = projects;
