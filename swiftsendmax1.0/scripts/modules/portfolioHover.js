// /scripts/modules/portfolioHover.js
// Work cards filtering + hover-play videos

import { qs, qsa } from "../utils/dom.js";

function createFilter(section) {
  const buttons = qsa(".work__filters [data-filter]", section);
  const cards = qsa(".work-card", section);

  function applyFilter(filter) {
    cards.forEach((card) => {
      const tags = (card.dataset.tags || "")
        .split(/\s+/)
        .filter(Boolean);
      const match = filter === "all" || tags.includes(filter);
      card.hidden = !match;
      card.setAttribute("aria-hidden", match ? "false" : "true");
      card.classList.toggle("is-hidden", !match);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter || "all";
      buttons.forEach((other) => other.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      applyFilter(filter);
    });
  });

  const initial = buttons.find((btn) => btn.getAttribute("aria-selected") === "true");
  applyFilter(initial?.dataset.filter || "all");
}

function enableVideoHover(card) {
  const video = card.querySelector("video");
  if (!video) return;

  const source = video.dataset.hoverVideo;
  let loaded = false;

  const ensureSource = () => {
    if (loaded || !source) return;
    video.src = source;
    loaded = true;
  };

  const play = () => {
    ensureSource();
    video.play().catch(() => {});
  };
  const pause = () => video.pause();

  card.addEventListener("mouseenter", play);
  card.addEventListener("focusin", play);
  card.addEventListener("mouseleave", pause);
  card.addEventListener("focusout", pause);
}

export function initPortfolioHover() {
  const section = qs(".work");
  if (!section) return;

  createFilter(section);
  qsa(".work-card", section).forEach(enableVideoHover);
}
