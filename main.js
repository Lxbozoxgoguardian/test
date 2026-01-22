// Live clock
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

setInterval(updateClock, 1000);
updateClock();

// Desktop icon interaction
document.querySelectorAll(".icon").forEach(icon => {
  let clickTimer = null;

  icon.addEventListener("click", () => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      openApp(icon.dataset.app);
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
      }, 250);
    }
  });
});

function openApp(app) {
  alert(`Opening ${app} app (window system coming next 👀)`);
}
