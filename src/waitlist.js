import { isValidEmail } from "./email.js";
import { interpretSubscribeResponse } from "./subscribe.js";

const COPY_EN = {
  empty: "Enter your email address.",
  invalid: "Enter a valid email address.",
  success: "You're on the list. Check your inbox to confirm.",
  error: "We couldn't add that email. Please try again.",
  offline: "We couldn't reach the waitlist. Check your connection and try again.",
  follow: "Continuing to confirm your email…",
  pending: "Joining…",
  misconfigured: "The waitlist is not configured yet.",
  joined: "Joined",
};

const COPY_ES = {
  empty: "Escribe tu correo electrónico.",
  invalid: "Escribe un correo electrónico válido.",
  success: "Ya estás en la lista. Revisa tu bandeja para confirmar.",
  error: "No pudimos agregar ese correo. Inténtalo de nuevo.",
  offline: "No pudimos conectar con la lista. Revisa tu conexión e inténtalo de nuevo.",
  follow: "Seguimos para confirmar tu correo…",
  pending: "Uniéndote…",
  misconfigured: "La lista de espera todavía no está configurada.",
  joined: "En la lista",
};

function copyFor(form) {
  const lang = form.ownerDocument.documentElement.lang;
  return lang === "es" ? COPY_ES : COPY_EN;
}

function statusEl(form) {
  return form.querySelector(".waitlist-status");
}

function emailInput(form) {
  return form.querySelector('input[name="email"]');
}

function submitButton(form) {
  return form.querySelector('button[type="submit"]');
}

function setStatus(form, message, state) {
  form.dataset.state = state;
  const status = statusEl(form);
  status.dataset.state = state;
  status.setAttribute("role", state === "error" ? "alert" : "status");
  status.textContent = message;
}

function clearStatus(form) {
  delete form.dataset.state;
  const status = statusEl(form);
  delete status.dataset.state;
  status.textContent = "";
  status.removeAttribute("role");
  const input = emailInput(form);
  input.removeAttribute("aria-invalid");
}

function restoreButton(form) {
  form.removeAttribute("aria-busy");
  const button = submitButton(form);
  button.disabled = false;
  if (button.dataset.label) button.textContent = button.dataset.label;
}

function setPending(form) {
  form.dataset.state = "pending";
  form.setAttribute("aria-busy", "true");
  clearStatus(form);
  form.dataset.state = "pending";
  const button = submitButton(form);
  if (!button.dataset.label) button.dataset.label = button.textContent;
  button.disabled = true;
  button.textContent = copyFor(form).pending;
}

function showError(form, message) {
  restoreButton(form);
  setStatus(form, message, "error");
  const input = emailInput(form);
  input.setAttribute("aria-invalid", "true");
  input.focus();
}

function showSuccess(form) {
  const copy = copyFor(form);
  form.removeAttribute("aria-busy");
  setStatus(form, copy.success, "success");
  const input = emailInput(form);
  input.setAttribute("aria-invalid", "false");
  input.readOnly = true;
  const button = submitButton(form);
  button.disabled = true;
  button.textContent = copy.joined;
}

function configured(form) {
  return form.action.includes("buttondown.com/api/emails/embed-subscribe/");
}

async function postWaitlist(form) {
  const body = new URLSearchParams(new FormData(form));
  const response = await fetch(form.action, {
    method: "POST",
    body,
    headers: { Accept: "application/json, text/html" },
  });
  return interpretSubscribeResponse(response);
}

export function bindWaitlist(root = document) {
  const forms = [...root.querySelectorAll("form.waitlist")];
  let inFlight = false;

  forms.forEach((form) => {
    form.noValidate = true;
    const input = emailInput(form);

    input.addEventListener("input", () => {
      if (form.dataset.state === "error") clearStatus(form);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (inFlight || form.dataset.state === "success" || form.dataset.state === "pending") return;

      const email = input.value.trim();
      input.value = email;
      const copy = copyFor(form);

      if (!email) {
        showError(form, copy.empty);
        return;
      }
      if (!isValidEmail(email)) {
        showError(form, copy.invalid);
        return;
      }
      if (!configured(form)) {
        showError(form, copy.misconfigured);
        return;
      }

      inFlight = true;
      setPending(form);

      try {
        const result = await postWaitlist(form);
        if (result.outcome === "success") {
          showSuccess(form);
          return;
        }
        if (result.outcome === "follow") {
          setStatus(form, copy.follow, "pending");
          window.setTimeout(() => restoreButton(form), 4000);
          form.submit();
          return;
        }
        showError(form, result.message || copy.error);
      } catch {
        showError(form, copy.offline);
      } finally {
        inFlight = false;
      }
    });
  });
}
