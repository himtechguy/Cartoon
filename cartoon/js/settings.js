const StudioSettings = {
  defaults: {
    autosave: true,
    autosaveInterval: 5000,
    fps: 30,
    duration: 10,
    resolution: "1080x1920",
    audioQuality: "high",
    exportQuality: "high",
    theme: "dark"
  },

  init() {
    this.ensure();
    this.bind();
    this.render();
    this.startAutosave();
  },

  ensure() {
    if (!project.settings) {
      project.settings = {};
    }

    project.settings = {
      ...this.defaults,
      ...project.settings
    };

    saveProject();
  },

  bind() {
    const name =
      document.getElementById("projectName");

    const fps =
      document.getElementById("projectFPS");

    const duration =
      document.getElementById("projectDuration");

    const format =
      document.getElementById("projectFormat");

    if (name) {
      name.addEventListener("change", () => {
        project.name =
          name.value.trim() ||
          "My Cartoon";

        project.updatedAt =
          new Date().toISOString();

        saveProject();

        if (
          typeof Projects !== "undefined"
        ) {
          Projects.render();
        }
      });
    }

    if (fps) {
      fps.addEventListener("change", () => {
        this.set("fps", Number(fps.value));
      });
    }

    if (duration) {
      duration.addEventListener("change", () => {
        const value =
          Math.max(
            1,
            Number(duration.value) || 10
          );

        this.set("duration", value);

        if (
          typeof Timeline !== "undefined"
        ) {
          Timeline.loadDuration();
          Timeline.render();
        }
      });
    }

    if (format) {
      format.addEventListener("change", () => {
        this.set(
          "resolution",
          format.value
        );
      });
    }
  },

  render() {
    const name =
      document.getElementById("projectName");

    const fps =
      document.getElementById("projectFPS");

    const duration =
      document.getElementById("projectDuration");

    const format =
      document.getElementById("projectFormat");

    if (name) {
      name.value =
        project.name ||
        "My Cartoon";
    }

    if (fps) {
      fps.value =
        project.settings.fps;
    }

    if (duration) {
      duration.value =
        project.settings.duration;
    }

    if (format) {
      format.value =
        project.settings.resolution;
    }
  },

  set(key, value) {
    this.ensure();

    project.settings[key] =
      value;

    project.updatedAt =
      new Date().toISOString();

    saveProject();
  },

  get(key) {
    this.ensure();

    return project.settings[key];
  },

  toggleAutosave() {
    this.set(
      "autosave",
      !this.get("autosave")
    );

    if (this.get("autosave")) {
      this.startAutosave();
    } else {
      this.stopAutosave();
    }

    return this.get("autosave");
  },

  autosaveTimer: null,

  startAutosave() {
    this.stopAutosave();

    if (!this.get("autosave")) {
      return;
    }

    const interval =
      Math.max(
        1000,
        Number(
          this.get(
            "autosaveInterval"
          )
        ) || 5000
      );

    this.autosaveTimer =
      setInterval(() => {
        if (
          typeof saveProject ===
          "function"
        ) {
          saveProject();
        }
      }, interval);
  },

  stopAutosave() {
    if (this.autosaveTimer) {
      clearInterval(
        this.autosaveTimer
      );

      this.autosaveTimer = null;
    }
  },

  reset() {
    const confirmed =
      confirm(
        "Reset studio settings to default?"
      );

    if (!confirmed) {
      return;
    }

    project.settings = {
      ...this.defaults
    };

    saveProject();

    this.render();

    if (
      typeof Timeline !==
      "undefined"
    ) {
      Timeline.loadDuration();
      Timeline.render();
    }

    App.toast(
      "Settings reset"
    );
  },

  setTheme(theme) {
    if (
      theme !== "dark" &&
      theme !== "light"
    ) {
      return;
    }

    this.set(
      "theme",
      theme
    );

    document.body.dataset.theme =
      theme;
  },

  getExportSettings() {
    return {
      resolution:
        this.get(
          "resolution"
        ),

      fps:
        Number(
          this.get("fps")
        ) || 30,

      duration:
        Number(
          this.get("duration")
        ) || 10,

      audioQuality:
        this.get(
          "audioQuality"
        ),

      exportQuality:
        this.get(
          "exportQuality"
        )
    };
  }
};
