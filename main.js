let zIndexCounter = 10;
const windowsContainer = document.getElementById("windows");

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
  let timer = null;
  icon.addEventListener("click", () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      openApp(icon.dataset.app);
    } else {
      timer = setTimeout(() => timer = null, 250);
    }
  });
});

// Open app
function openApp(app) {
  const win = createWindow(app);
  windowsContainer.appendChild(win);
  focusWindow(win);
}

// Create window
function createWindow(app) {
  const win = document.createElement("div");
  win.className = "window";
  win.style.left = "100px";
  win.style.top = "100px";
  win.style.zIndex = ++zIndexCounter;

  win.innerHTML = `
    <div class="title-bar">
      <span>${app.toUpperCase()}</span>
      <div class="window-controls">
        <button data-action="minimize">—</button>
        <button data-action="close">✕</button>
      </div>
    </div>
    <div class="window-content">
      ${getAppContent(app)}
    </div>
  `;

  // Focus
  win.addEventListener("mousedown", () => focusWindow(win));

  // Dragging
  const titleBar = win.querySelector(".title-bar");
  let offsetX, offsetY, dragging = false;

  titleBar.addEventListener("mousedown", e => {
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    focusWindow(win);
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => dragging = false);

  // Window controls
  win.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === "close") win.remove();
      if (action === "minimize") win.style.display = "none";
    });
  });

  return win;
}

// Focus window
function focusWindow(win) {
  document.querySelectorAll(".window").forEach(w => w.classList.remove("focused"));
  win.classList.add("focused");
  win.style.zIndex = ++zIndexCounter;
}

// App content
function getAppContent(app) {
  if (app === "browser") {
    return `
      <input placeholder="Enter URL (proxy coming soon)" style="width:100%;padding:8px">
      <p style="margin-top:10px;opacity:0.7">Proxy engine coming soon 👀</p>
    `;
  }

  if (app === "settings") {
    return `
      <h3>Settings</h3>
      <p>Theme, proxy behavior, and system options will live here.</p>
    `;
  }

  return `<p>Unknown app</p>`;
}
