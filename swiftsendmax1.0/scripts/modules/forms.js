// /scripts/modules/forms.js
// Enhance forms: validation hints, async submission, feedback

import { qs, qsa, addClass, removeClass, toggleClass } from "../utils/dom.js";

const INVALID_CLASS = "is-invalid";

function getFieldWrapper(field) {
  return field.closest(".field") || field.closest("label");
}

function updateFilledState(field) {
  const wrapper = getFieldWrapper(field);
  if (!wrapper) return;
  toggleClass(wrapper, "is-filled", field.value.trim().length > 0);
}

function setInvalidState(field, message) {
  field.setCustomValidity(message ?? "");
  const wrapper = getFieldWrapper(field);
  if (wrapper) {
    toggleClass(wrapper, INVALID_CLASS, Boolean(message));
  }
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateField(field) {
  if (field.disabled || field.type === "submit") return true;

  const value = field.value.trim();

  if (field.required && !value) {
    setInvalidState(field, "This field is required.");
    return false;
  }

  if (field.type === "email" && value) {
    const valid = /\S+@\S+\.\S+/.test(value);
    if (!valid) {
      setInvalidState(field, "Please enter a valid email address.");
      return false;
    }
  }

  setInvalidState(field, "");
  return true;
}

function handleInput(e) {
  const field = e.target;
  updateFilledState(field);
  validateField(field);
}

function attachFieldListeners(field) {
  field.addEventListener("input", handleInput);
  field.addEventListener("blur", () => {
    updateFilledState(field);
    validateField(field);
  });
  // Initialise filled state for prefilled inputs
  updateFilledState(field);
}

function simulateSubmit(form) {
  const status = qs(".form-status", form.closest(".contact-card") || form);
  addClass(form, "is-submitting");
  if (status) status.textContent = "Submitting…";

  setTimeout(() => {
    removeClass(form, "is-submitting");
    addClass(form, "is-success");
    if (status) status.textContent = "Thanks! We’ll reach out within one business day.";
    form.reset();
    qsa("input, textarea, select", form).forEach((field) => {
      updateFilledState(field);
      setInvalidState(field, "");
    });
    setTimeout(() => removeClass(form, "is-success"), 3200);
  }, 1200);
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fields = qsa("input, textarea, select", form);
  let valid = true;

  fields.forEach((field) => {
    const ok = validateField(field);
    if (!ok) valid = false;
  });

  if (!valid) {
    const status = qs(".form-status", form.closest(".contact-card") || form);
    if (status) status.textContent = "Please fix the highlighted fields.";
    return;
  }

  simulateSubmit(form);
}

export function initForms() {
  qsa("form").forEach((form) => {
    form.addEventListener("submit", handleSubmit);
    qsa("input, textarea, select", form).forEach(attachFieldListeners);
  });
}
