const App = {
  currentPage: "projects",

  init() {
    this.bindNavigation();
    this.bindGlobalButtons();

    if (typeof UndoRedo !== "undefined") UndoRedo.init();
    if (typeof Projects !== "undefined") Projects.init();
    if (typeof Characters !== "undefined") Characters.init();
    if (typeof Episodes !== "undefined") Episodes.init();
    if (typeof Scenes !== "undefined") Scenes.init();
    if (typeof Assets !== "undefined") Assets.init();
    if (typeof Props !== "undefined") Props.init();
    if (typeof Backgrounds !== "undefined") Backgrounds.init();
    if (typeof Editor !== "undefined") Editor.init();
    if (typeof Animation !== "undefined") Animation.init();
    if (typeof Timeline !== "undefined") Timeline.init();
    if (typeof Dialogue !== "undefined") Dialogue.init();
    if (typeof Titles !== "undefined") Titles.init();
    if (typeof Camera !== "undefined") Camera.init();
    if (typeof AudioManager !== "undefined") AudioManager.init();
    if (typeof VoiceManager !== "undefined") VoiceManager.init();
    if (typeof StudioSettings !== "undefined") StudioSettings.init();
    if (typeof Shortcuts !== "undefined") Shortcuts.init();
    if (typeof HistoryManager !== "undefined") HistoryManager.start();
    if (typeof Preview !== "undefined") Preview.init();
    if (typeof ExportManager !== "undefined") ExportManager.init();

    this.refresh();
    this.navigate(this.currentPage);
  },

  bindNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const page = item.dataset.page;
        if (page) this.navigate(page);
      });
    });
  },

  bindGlobalButtons() {
    const saveBtn = document.getElementById("saveProjectBtn");
    if (saveBtn) saveBtn.addEventListener("click", () => this.save());

    const undoBtn = document.getElementById("undoBtn");
    if (undoBtn) undoBtn.addEventListener("click", () => {
      if (typeof UndoRedo !== "undefined") UndoRedo.undo();
    });

    const redoBtn = document.getElementById("redoBtn");
    if (redoBtn) redoBtn.addEventListener("click", () => {
      if (typeof UndoRedo !== "undefined") UndoRedo.redo();
    });

    const previewBtn = document.getElementById("previewBtn");
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        if (typeof Preview !== "undefined") Preview.open();
      });
    }

    const projectImport = document.getElementById("projectImport");
    if (projectImport) {
      projectImport.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (file && typeof ExportManager !== "undefined") {
          ExportManager.importProject(file);
        }
        event.target.value = "";
      });
    }

    const audioInput = document.getElementById("audioInput");
    if (audioInput && typeof AudioManager !== "undefined") {
      audioInput.addEventListener("change", event => {
        const files = Array.from(event.target.files || []);
        files.forEach(file => AudioManager.addFile(file));
        event.target.value = "";
      });
    }
  },

  navigate(page) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(section => {
      section.classList.remove("active");
      section.style.display = "none";
    });

    const target = document.getElementById(`page-${page}`);

    if (!target) {
      console.warn(`Page not found: ${page}`);
      return;
    }

    target.classList.add("active");
    target.style.display = "block";

    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.page === page);
    });

    this.currentPage = page;

    this.renderPage(page);
  },

  renderPage(page) {
    try {
      switch (page) {
        case "projects":
          if (typeof Projects !== "undefined") Projects.render();
          break;

        case "characters":
          if (typeof Characters !== "undefined") Characters.render();
          break;

        case "episodes":
          if (typeof Episodes !== "undefined" && Episodes.render) {
            Episodes.render();
          }
          break;

        case "scenes":
          if (typeof Scenes !== "undefined" && Scenes.render) {
            Scenes.render();
          }
          break;

        case "assets":
          if (typeof Assets !== "undefined" && Assets.render) {
            Assets.render();
          }
          break;

        case "editor":
          if (typeof Editor !== "undefined") Editor.render();
          if (typeof Timeline !== "undefined") Timeline.render();
          break;

        case "timeline":
          if (typeof Timeline !== "undefined") Timeline.render();
          break;

        case "audio":
          if (typeof AudioManager !== "undefined") AudioManager.render();
          if (typeof VoiceManager !== "undefined") VoiceManager.render();
          break;

        case "settings":
          if (typeof StudioSettings !== "undefined" && StudioSettings.render) {
            StudioSettings.render();
          }
          break;
      }
    } catch (error) {
      console.error(`Could not render page "${page}":`, error);
    }
  },

  refresh() {
    if (typeof Projects !== "undefined") Projects.render();
    if (typeof Characters !== "undefined") Characters.render();

    if (typeof Episodes !== "undefined" && Episodes.render) {
      Episodes.render();
    }

    if (typeof Scenes !== "undefined" && Scenes.render) {
      Scenes.render();
    }

    if (typeof Assets !== "undefined" && Assets.render) {
      Assets.render();
    }

    if (typeof Editor !== "undefined") Editor.render();
    if (typeof Timeline !== "undefined") Timeline.render();
    if (typeof AudioManager !== "undefined") AudioManager.render();
    if (typeof VoiceManager !== "undefined") VoiceManager.render();

    if (
      typeof StudioSettings !== "undefined" &&
      StudioSettings.render
    ) {
      StudioSettings.render();
    }

    this.updateProjectName();
  },

  updateProjectName() {
    const elements = document.querySelectorAll(
      "[data-project-name], #projectName, .project-name"
    );

    elements.forEach(element => {
      element.textContent = project.name || "My Cartoon";
    });
  },

  createProject() {
    const name = prompt("Enter project name:", "My Cartoon");

    if (!name || !name.trim()) return;

    const newProject =
      typeof createDefaultProject === "function"
        ? createDefaultProject()
        : project;

    newProject.id = "project_" + Date.now();
    newProject.name = name.trim();
    newProject.createdAt = new Date().toISOString();
    newProject.updatedAt = new Date().toISOString();

    project = newProject;

    saveProject();
    this.refresh();
    this.navigate("editor");

    this.toast("New project created");
  },

  save() {
    if (typeof saveProject === "function") {
      saveProject();
      this.toast("Project saved");
    }
  },

  openModal(content) {
    const modal = document.getElementById("modal");

    if (!modal) return;

    const body = modal.querySelector(".modal-body");

    if (body) {
      body.innerHTML = content || "";
    }

    modal.classList.add("open");
  },

  closeModal() {
    const modal = document.getElementById("modal");

    if (modal) {
      modal.classList.remove("open");
    }
  },

  toast(message) {
    let toast = document.getElementById("appToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";

      Object.assign(toast.style, {
        position: "fixed",
        left: "50%",
        bottom: "85px",
        transform: "translateX(-50%) translateY(10px)",
        background: "#18222d",
        color: "#fff",
        padding: "11px 16px",
        border: "1px solid #2a3744",
        borderRadius: "10px",
        zIndex: "99999",
        opacity: "0",
        pointerEvents: "none",
        transition: "opacity .2s ease, transform .2s ease",
        fontSize: "13px",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)"
      });

      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform =
        "translateX(-50%) translateY(10px)";
    }, 2200);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
