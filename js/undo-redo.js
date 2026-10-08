const UndoRedo = {
  undoStack: [],
  redoStack: [],
  maxHistory: 50,

  init() {
    this.undoStack = [];
    this.redoStack = [];
  },

  saveState() {
    if (typeof project === "undefined") return;

    const state = JSON.stringify(project);

    this.undoStack.push(state);

    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    this.redoStack = [];
  },

  undo() {
    if (this.undoStack.length === 0) {
      this.toast("Nothing to undo");
      return;
    }

    this.redoStack.push(JSON.stringify(project));

    const previous = this.undoStack.pop();

    try {
      project = JSON.parse(previous);
      saveProject();

      this.refresh();

      this.toast("Undo");
    } catch (error) {
      console.error("Undo failed:", error);
    }
  },

  redo() {
    if (this.redoStack.length === 0) {
      this.toast("Nothing to redo");
      return;
    }

    this.undoStack.push(JSON.stringify(project));

    const next = this.redoStack.pop();

    try {
      project = JSON.parse(next);
      saveProject();

      this.refresh();

      this.toast("Redo");
    } catch (error) {
      console.error("Redo failed:", error);
    }
  },

  refresh() {
    if (typeof Projects !== "undefined") {
      Projects.render();
    }

    if (typeof Characters !== "undefined") {
      Characters.render();
    }

    if (typeof Editor !== "undefined") {
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }
  },

  toast(message) {
    if (typeof App !== "undefined" && App.toast) {
      App.toast(message);
    }
  }
};
