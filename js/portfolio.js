/**
 * Portfolio data + rendering + filtering
 * Editorial layout variants via `layout` field.
 */

const projects = [
  {
    id: 1,
    title: "ClinicLoop",
    category: ["reels"],
    platform: "Instagram Reels",
    type: "Brand Commercial Reel",
    year: "2026",
    orientation: "portrait",
    layout: "portrait",
    video: "assets/videos/clincloop/clinicloop.mp4",
    thumbnail: "assets/videos/clincloop/ClinicLoop.png",
    description: "High-retention commercial cut engineered with kinetic typography, seamless pacing, and surgical sound design.",
    tools: ["Premiere Pro", "After Effects", "Sound Design"]
  },
  {
    id: 2,
    title: "Evanour",
    category: ["motion"],
    platform: "Motion Graphics",
    type: "Motion Design",
    year: "2026",
    orientation: "portrait",
    layout: "wide",
    video: "assets/videos/evanour/evanour.mp4",
    thumbnail: "assets/videos/evanour/evanour.png",
    description: "Sleek kinetic motion design showcase featuring polished 2D/3D visual accents, seamless transitions, and clean branding.",
    tools: ["After Effects", "Premiere Pro"]
  },
  {
    id: 3,
    title: "Graduation",
    category: ["facebook"],
    platform: "Facebook",
    type: "Campaign / Documentary",
    year: "2026",
    orientation: "portrait",
    layout: "offset",
    video: "assets/videos/graduation/graduation.mp4",
    thumbnail: "assets/videos/graduation/Graduation.png",
    description: "Cinematic narrative crafted for high retention, emotional resonance, and viral Facebook reach.",
    tools: ["Premiere Pro", "DaVinci Resolve"]
  },
  {
    id: 4,
    title: "Khaled Abo Fakher",
    category: ["reels"],
    platform: "Instagram Reels",
    type: "Personal Brand Reel",
    year: "2026",
    orientation: "portrait",
    layout: "full",
    video: "assets/videos/khaled/2.mp4",
    thumbnail: "assets/videos/khaled/me.jpg",
    description: "Signature personal brand showcase cut emphasizing dynamic kinetic cuts, rhythm syncing, and rich soundscapes.",
    tools: ["Premiere Pro", "After Effects", "Sound Design"]
  },
  {
    id: 5,
    title: "Moones Dev",
    category: ["reels"],
    platform: "Instagram Reels",
    type: "Developer Showcase Reel",
    year: "2026",
    orientation: "portrait",
    layout: "mid",
    video: "assets/videos/moones dev/moones dev.mp4",
    thumbnail: "assets/videos/moones dev/moones dev.png",
    description: "Modern developer portfolio showcase cut designed for engagement, code animation clarity, and tech-forward aesthetics.",
    tools: ["Premiere Pro", "After Effects"]
  },
  {
    id: 6,
    title: "Roaya",
    category: ["reels"],
    platform: "Instagram Reels",
    type: "Cinematic Reel",
    year: "2026",
    orientation: "portrait",
    layout: "portrait",
    video: "assets/videos/roaya/roaya.mp4",
    thumbnail: "assets/videos/roaya/Roaya.png",
    description: "Vibrant visual reel showcasing high-energy pacing, vivid color grading, and infectious rhythmic sound design.",
    tools: ["Premiere Pro", "DaVinci Resolve", "Sound Design"]
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

  function createItem(project, index) {
    const cats = project.category.join(" ");

    return `
      <article
        class="work-item"
        role="listitem"
        data-id="${project.id}"
        data-video="${project.video}"
        data-categories="${cats}"
        data-cursor="PLAY"
        tabindex="0"
        aria-label="${project.title}"
      >
        <div class="work-item__media">
          <img
            class="work-item__thumb"
            src="${project.thumbnail}"
            alt="${project.title}"
            width="1280"
            height="720"
            loading="lazy"
          >
          <div class="work-item__play-overlay" aria-hidden="true">
            <div class="work-item__play-icon-circle">
              <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          ${createPlaceholder(index + 1)}
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
    });
  }

  function activateVideo(item) {
    const media = item.querySelector(".work-item__media");
    if (!media) return;

    let video = media.querySelector(".work-item__video");
    if (video) {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      return;
    }

    // Stop and remove video from any other item in grid so only one plays at a time
    const allVideos = grid.querySelectorAll(".work-item__video");
    allVideos.forEach((v) => {
      v.pause();
      const parentMedia = v.closest(".work-item__media");
      if (parentMedia) {
        const thumb = parentMedia.querySelector(".work-item__thumb");
        const overlay = parentMedia.querySelector(".work-item__play-overlay");
        if (thumb) thumb.style.display = "";
        if (overlay) overlay.style.display = "";
      }
      v.remove();
    });

    const videoSrc = item.dataset.video;
    if (!videoSrc) return;

    const thumb = media.querySelector(".work-item__thumb");
    const overlay = media.querySelector(".work-item__play-overlay");

    video = document.createElement("video");
    video.className = "work-item__video is-active";
    video.src = videoSrc;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    if (thumb) thumb.style.display = "none";
    if (overlay) overlay.style.display = "none";

    media.appendChild(video);
    video.play().catch(() => {});
  }

  function bindItemEvents() {
    const items = grid.querySelectorAll(".work-item");

    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        openProject(item.dataset.id);
      });

      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject(item.dataset.id);
        }
      });
    });
  }

  function openProject(id) {
    const project = projects.find((p) => String(p.id) === String(id));
    if (!project) return;
    if (typeof window.openProjectModal === "function") {
      window.openProjectModal(project);
    } else {
      const modal = document.getElementById("project-modal");
      const video = document.getElementById("modal-video");
      const title = document.getElementById("modal-title");
      if (modal && video) {
        if (title) title.textContent = project.title;
        video.src = project.video;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        video.play().catch(() => {});
      }
    }
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

  return { init, render, projects, activateVideo };
})();

window.Portfolio = Portfolio;
window.projects = projects;
