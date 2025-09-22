// /scripts/modules/savingsEstimator.js
// Savings Estimator logic: sliders + pills update computed monthly/yearly savings

import { qs, qsa } from "../utils/dom.js";

const CARD_PERCENT = 0.029;
const CARD_FIXED = 0.3;
const ACH_PERCENT = 0.01;
const ACH_FIXED = 0.05;

function formatCurrency(value, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function updateDisplays(container, { volume, ticket, shift }) {
  const volumeEls = qsa("[data-display='volume']", container);
  const ticketEls = qsa("[data-display='ticket']", container);
  const achEls = qsa("[data-display='ach']", container);

  volumeEls.forEach((el) => (el.textContent = formatCurrency(volume)));
  ticketEls.forEach((el) => (el.textContent = formatCurrency(ticket)));
  achEls.forEach((el) => (el.textContent = `${Math.round(shift)}%`));
}

function calculateSavings(volume, ticket, shiftPercent) {
  const shiftRatio = Math.max(0, Math.min(shiftPercent, 100)) / 100;
  const shiftedVolume = volume * shiftRatio;
  const safeTicket = Math.max(ticket, 1);
  const transactions = shiftedVolume / safeTicket;

  const cardFees = shiftedVolume * CARD_PERCENT + transactions * CARD_FIXED;
  const achFees = shiftedVolume * ACH_PERCENT + transactions * ACH_FIXED;
  const monthlySavings = Math.max(cardFees - achFees, 0);

  return {
    monthly: monthlySavings,
    yearly: monthlySavings * 12,
  };
}

function updateResults(container, savings) {
  const valueEl = qs(".estimator__value", container);
  const yearlyEl = qs(".estimator__yearly", container);

  if (valueEl) valueEl.textContent = `${formatCurrency(savings.monthly)}/mo`;
  if (yearlyEl) yearlyEl.textContent = `${formatCurrency(savings.yearly)}/yr`;
}

export function initSavingsEstimator() {
  const wrapper = qs("[data-module='savingsEstimator']");
  if (!wrapper) return;

  const sliders = qsa(".slider", wrapper);
  const pills = qsa(".pills [data-value]", wrapper);

  const getState = () => {
    const volumeSlider = qs("#volumeRange", wrapper);
    const ticketSlider = qs("#ticketRange", wrapper);
    const selectedPill = pills.find((pill) => pill.getAttribute("aria-pressed") === "true");

    const volume = parseFloat(volumeSlider?.value || "0");
    const ticket = parseFloat(ticketSlider?.value || "1");
    const shift = parseFloat(selectedPill?.dataset.value || "0");

    return { volume, ticket, shift };
  };

  const refresh = () => {
    const state = getState();
    updateDisplays(wrapper, state);
    const savings = calculateSavings(state.volume, state.ticket, state.shift);
    updateResults(wrapper, savings);
  };

  sliders.forEach((slider) => {
    slider.addEventListener("input", () => {
      const readout = slider.nextElementSibling;
      if (readout) readout.textContent = slider.value;
      refresh();
    });
  });

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((btn) => btn.setAttribute("aria-pressed", "false"));
      pill.setAttribute("aria-pressed", "true");
      refresh();
    });
  });

  refresh();
}
