let zIndexCounter = 10;
const windowsContainer = document.getElementById("windows");
const taskbar = document.getElementById("task-right");

// Clock
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// Desktop icons double-click
document.querySelectorAll(".icon").forEach(icon => {
  icon.addEventListener("dblclick", () => openApp(icon.dataset.app));
});

// Open an app window
function openApp(app) {
  const win = document.createElement("div");
  win.className = "window";
  win.style.left = "100px";
  win.style.top = "100px";
  win.style.width = "600px";
  win.style.height = "400px";
  win.style.zIndex = ++zIndexCounter;
  win.dataset.appName = app;
  win.dataset.id = Date.now();

  win.innerHTML = `
    <div class="title-bar">
      <span>${app.toUpperCase()}</span>
      <div class="window-controls">
        <button data-action="minimize">—</button>
        <button data-action="fullscreen">⬜</button>
        <button data-action="close">✕</button>
      </div>
    </div>
    <div class="window-content">
      ${getAppContent(app)}
    </div>
    <div class="resize-handle"></div>
  `;

  windowsContainer.appendChild(win);
  focusWindow(win);

  makeDraggable(win);
  makeResizable(win);
  setupWindowControls(win);
  createTaskbarButton(win);
}

// Focus window
function focusWindow(win) {
  document.querySelectorAll(".window").forEach(w => w.classList.remove("focused"));
  win.classList.add("focused");
  win.style.zIndex = ++zIndexCounter;
  updateTaskbarButtons();
}

// Draggable
function makeDraggable(win) {
  const titleBar = win.querySelector(".title-bar");
  let dragging = false, offsetX = 0, offsetY = 0;

  titleBar.addEventListener("mousedown", e => {
    if (win.dataset.fullscreen === "true") return;
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    focusWindow(win);
    e.preventDefault();
  });

  document.addEventListener("mousemove", e => {
    if (dragging && win.dataset.fullscreen !== "true") {
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => dragging = false);
}

// Resizable
function makeResizable(win) {
  const handle = win.querySelector(".resize-handle");
  let resizing = false, startX = 0, startY = 0, startWidth = 0, star
