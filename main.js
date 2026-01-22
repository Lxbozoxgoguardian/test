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
  let resizing = false, startX = 0, startY = 0, startWidth = 0, startHeight = 0;

  handle.addEventListener("mousedown", e => {
    if (win.dataset.fullscreen === "true") return;
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(window.getComputedStyle(win).width, 10);
    startHeight = parseInt(window.getComputedStyle(win).height, 10);
    focusWindow(win);
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("mousemove", e => {
    if (!resizing) return;
    win.style.width = `${startWidth + (e.clientX - startX)}px`;
    win.style.height = `${startHeight + (e.clientY - startY)}px`;
  });

  document.addEventListener("mouseup", () => resizing = false);
}

// Window controls
function setupWindowControls(win) {
  win.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const action = btn.dataset.action;

      if (action === "close") {
        removeTaskbarButton(win);
        win.remove();
      }
      if (action === "minimize") win.style.display = "none";
      if (action === "fullscreen") toggleFullscreen(win);

      updateTaskbarButtons();
    });
  });
}

// Fullscreen toggle
function toggleFullscreen(win) {
  if (!win.dataset.fullscreen) {
    win.dataset.fullscreen = "true";
    win.dataset.prev = JSON.stringify({
      left: win.style.left,
      top: win.style.top,
      width: win.style.width,
      height: win.style.height
    });
    win.style.left = "0px";
    win.style.top = "0px";
    win.style.width = "100%";
    win.style.height = "100%";
  } else {
    const prev = JSON.parse(win.dataset.prev);
    win.dataset.fullscreen = "";
    win.style.left = prev.left;
    win.style.top = prev.top;
    win.style.width = prev.width;
    win.style.height = prev.height;
  }
}

// Taskbar button
function createTaskbarButton(win) {
  const button = document.createElement("button");
  button.className = "taskbar-window-button";
  button.textContent = win.dataset.appName.toUpperCase();
  button.dataset.winId = win.dataset.id;

  button.addEventListener("click", () => {
    if (win.style.display === "none") {
      win.style.display = "flex";
      focusWindow(win);
    } else {
      win.style.display = "none";
    }
    updateTaskbarButtons();
  });

  taskbar.appendChild(button);
  updateTaskbarButtons();
}

function removeTaskbarButton(win) {
  const btn = Array.from(taskbar.children)
    .find(b => b.dataset.winId === win.dataset.id);
  if (btn) btn.remove();
}

function updateTaskbarButtons() {
  document.querySelectorAll(".taskbar-window-button").forEach(btn => {
    const win = Array.from(document.querySelectorAll(".window"))
      .find(w => w.dataset.id === btn.dataset.winId);
    if (!win) return btn.remove();
    btn.classList.toggle("active", win.style.display !== "none" && win.classList.contains("focused"));
  });
}

// App content
function getAppContent(app) {
  if (app === "browser") {
    return `<input placeholder="Enter URL (proxy coming soon)" style="width:100%;padding:8px"><p style="margin-top:10px;opacity:0.7">Proxy engine coming soon 👀</p>`;
  }
  if (app === "settings") {
    return `<h3>Settings</h3><p>Theme, proxy behavior, and system options will live here.</p>`;
  }
  return `<p>Unknown app</p>`;
}
