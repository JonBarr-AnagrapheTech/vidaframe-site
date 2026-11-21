export function startClock(root = document) {
  const time = root.querySelector(".clock-time");
  const date = root.querySelector(".clock-date");
  if (!time || !date) return;

  const lang = (root.documentElement || root.ownerDocument?.documentElement)?.lang;
  const locale = lang === "es" ? "es-419" : "en-US";

  const render = () => {
    const now = new Date();
    time.textContent = now.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
    });
    time.dateTime = now.toISOString();
    date.textContent = now.toLocaleDateString(locale, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  render();
  window.setInterval(render, 30_000);
}
