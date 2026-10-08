const Shortcuts = {
  init() {
    document.addEventListener(
      "keydown",
      event => this.handle(event)
    );
  },

  handle(event) {
    const target =
      event.target;

    const isTyping =
      target &&
      (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      );

    if (isTyping) {
      return;
    }

    /*
     * Ctrl/Cmd + Z
     * Undo
     */
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      !event.shiftKey &&
      event.key.toLowerCase() === "z"
    ) {
      event.preventDefault();

      UndoRedo.undo();

      return;
    }

    /*
     * Ctrl/Cmd + Shift + Z
     * Redo
     */
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === "z"
    ) {
      event.preventDefault();

      UndoRedo.redo();

      return;
    }

    /*
     * Ctrl/Cmd + S
     * Save project
     */
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "s"
    ) {
      event.preventDefault();

      saveProject();

      if (
        typeof App !== "undefined" &&
        App.toast
      ) {
        App.toast(
          "Project saved"
        );
      }

      return;
    }

    /*
     * Space
     * Play/pause timeline
     */
    if (
      event.code === "Space"
    ) {
      event.preventDefault();

      if (
        typeof Timeline !==
        "undefined"
      ) {
        Timeline.togglePlay();
      }

      return;
    }

    /*
     * Delete / Backspace
     * Delete selected object
     */
    if (
      event.key === "Delete" ||
      event.key === "Backspace"
    ) {
      if (
        typeof Editor !==
        "undefined" &&
        Editor.selectedObject
      ) {
        event.preventDefault();

        Editor.deleteSelected();
      }

      return;
    }

    /*
     * Escape
     * Stop playback / close preview
     */
    if (
      event.key === "Escape"
    ) {
      if (
        typeof Timeline !==
        "undefined" &&
        Timeline.playing
      ) {
        Timeline.pause();
      }

      if (
        typeof Preview !==
        "undefined" &&
        Preview.playing
      ) {
        Preview.pause();
      }

      return;
    }

    /*
     * Arrow keys
     * Move selected object
     */
    if (
      typeof Editor ===
        "undefined" ||
      !Editor.selectedObject
    ) {
      return;
    }

    const object =
      Editor.selectedObject;

    const step =
      event.shiftKey ? 5 : 1;

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      object.x =
        Math.max(
          0,
          (Number(object.x) || 50) -
            step
        );

      Editor.render();

      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      object.x =
        Math.min(
          100,
          (Number(object.x) || 50) +
            step
        );

      Editor.render();

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      object.y =
        Math.max(
          0,
          (Number(object.y) || 50) -
            step
        );

      Editor.render();

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      object.y =
        Math.min(
          100,
          (Number(object.y) || 50) +
            step
        );

      Editor.render();

      return;
    }
  }
};
