const taskbar = document.getElementById("task-right"); // container for buttons

function openApp(app) {
  const win = document.createElement("div");
  win.className = "window";
  win.style.left = "100px";
  win.style.top = "100px";
  win.style.width = "600px";
  win.style.height = "400px";
  win.style.zIndex = ++zIndexCounter;

  win.dataset.appName = app;

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

// Taskbar button creation
function createTaskbarButton(win) {
  const button = document.createElement("button");
  button.className = "taskbar-window-button";
  button.textContent = win.dataset.appName.toUpperCase();

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
  win.dataset.taskbarButtonId = Date.now(); // unique id
  button.dataset.winId = win.dataset.taskbarButtonId;

  updateTaskbarButtons();
}

// Update active class for taskbar buttons
function updateTaskbarButtons() {
  document.querySelectorAll(".taskbar-window-button").forEach(btn => {
    const win = Array.from(document.querySelectorAll(".window"))
      .find(w => w.dataset.taskbarButtonId === btn.dataset.winId);
    if (!win) return btn.remove();

    if (win.style.display !== "none" && win.classList.contains("focused")) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Make sure to call updateTaskbarButtons after focusing windows
function focusWindow(win) {
  document.querySelectorAll(".window").forEach(w => w.classList.remove("focused"));
  win.classList.add("focused");
  win.style.zIndex = ++zIndexCounter;
  updateTaskbarButtons();
}
