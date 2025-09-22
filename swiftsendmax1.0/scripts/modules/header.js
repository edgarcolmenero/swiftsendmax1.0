// /scripts/modules/header.js
// Desktop active link sync + mobile full-screen menu toggle with focus trap

import { qs, qsa, addClass, removeClass } from "../utils/dom.js";

const MENU_SELECTOR = ".ss-mobile-menu";
const TOGGLE_SELECTOR = "[data-open-menu]";
const CLOSE_SELECTOR = "[data-close-menu]";

let lastActiveLink = null;
let lastFocusedEl = null;

function setActiveLink() {
  const links = qsa("nav a[href^='#']");
  const fromTop = window.scrollY + 100;

  links.forEach((link) => {
    const section = qs(link.getAttribute("href"));
    if (section && section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
      if (lastActiveLink) lastActiveLink.classList.remove("is-active");
      link.classList.add("is-active");
      lastActiveLink = link;
    }
  });
}

function openMenu() {
  const body = document.body;
  const menu = qs(MENU_SELECTOR);
  const toggle = qs(TOGGLE_SELECTOR);

  if (!menu) return;

  addClass(body, "menu-open");
  menu.setAttribute("aria-hidden", "false");
  if (toggle) toggle.setAttribute("aria-expanded", "true");

  lastFocusedEl = document.activeElement;
  trapFocus(menu);

  document.addEventListener("keydown", handleEsc);
}

function closeMenu() {
  const body = document.body;
  const menu = qs(MENU_SELECTOR);
  const toggle = qs(TOGGLE_SELECTOR);

  if (!menu) return;

  removeClass(body, "menu-open");
  menu.setAttribute("aria-hidden", "true");
  if (toggle) toggle.setAttribute("aria-expanded", "false");

  releaseFocus();

  document.removeEventListener("keydown", handleEsc);

  if (lastFocusedEl) {
    lastFocusedEl.focus();
    lastFocusedEl = null;
  }
}

function toggleMenu() {
  const toggle = qs(TOGGLE_SELECTOR);
  const isExpanded = toggle?.getAttribute("aria-expanded") === "true";

  if (isExpanded) {
    closeMenu();
  } else {
    openMenu();
  }
}

function handleEsc(e) {
  if (e.key === "Escape") closeMenu();
}

// Focus trap
let focusableEls = [];
let firstEl, lastEl;

function trapFocus(container) {
  focusableEls = qsa(
    "a[href], button, textarea, input, select, [tabindex]:not([tabindex='-1'])",
    container
  ).filter((el) => !el.disabled && el.offsetParent !== null);

  if (!focusableEls.length) {
    firstEl = null;
    lastEl = null;
    return;
  }

  firstEl = focusableEls[0];
  lastEl = focusableEls[focusableEls.length - 1];

  container.addEventListener("keydown", handleTab);
}

function releaseFocus() {
  const menu = qs(MENU_SELECTOR);
  if (menu) menu.removeEventListener("keydown", handleTab);
}

function handleTab(e) {
  if (e.key !== "Tab") return;

  if (e.shiftKey) {
    if (document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    }
  } else {
    if (document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  }
}

export function initHeader() {
  // Desktop active link sync
  window.addEventListener("scroll", setActiveLink);

  // Mobile menu toggle
  const toggle = qs(TOGGLE_SELECTOR);
  if (toggle) toggle.addEventListener("click", toggleMenu);

  // Close menu on nav link click or explicit close button
  qsa(CLOSE_SELECTOR).forEach((el) => el.addEventListener("click", closeMenu));
}
