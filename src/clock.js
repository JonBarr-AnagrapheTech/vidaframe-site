export function startClock(root = document) {
  const time = root.querySelector(".clock-time");
  const date = root.querySelector(".clock-date");
  if (!time || !date) return;

  const render = () => {
    const now = new Date();
    time.textContent = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    time.dateTime = now.toISOString();
    date.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  render();
  window.setInterval(render, 30_000);
}
