const History = {
  autosaveTimer: null,
  lastSavedState: null,

  init() {
    this.lastSavedState =
      this.snapshot();

    this.startAutosave();
  },

  snapshot() {
    if (
      typeof project ===
      "undefined"
    ) {
      return null;
    }

    try {
      return JSON.stringify(
        project
      );
    } catch (error) {
      console.error(
        "Could not create project snapshot:",
        error
      );

      return null;
    }
  },

  hasChanges() {
    const current =
      this.snapshot();

    return (
      current !==
      this.lastSavedState
    );
  },

  save() {
    if (
      typeof saveProject !==
      "function"
    ) {
      return;
    }

    saveProject();

    this.lastSavedState =
      this.snapshot();
  },

  startAutosave() {
    this.stopAutosave();

    const settings =
      project?.settings || {};

    if (
      settings.autosave === false
    ) {
      return;
    }

    const interval =
      Math.max(
        1000,
        Number(
          settings.autosaveInterval
        ) || 5000
      );

    this.autosaveTimer =
      setInterval(() => {
        if (this.hasChanges()) {
          this.save();
        }
      }, interval);
  },

  stopAutosave() {
    if (
      this.autosaveTimer
    ) {
      clearInterval(
        this.autosaveTimer
      );

      this.autosaveTimer =
        null;
    }
  },

  restartAutosave() {
    this.startAutosave();
  },

  markSaved() {
    this.lastSavedState =
      this.snapshot();
  }
};
