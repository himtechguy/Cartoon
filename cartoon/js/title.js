const Titles = {
  init() {},

  add(text = "Title") {
    const scene = Editor.getScene();

    if (!scene) {
      alert("Create a scene first.");
      return null;
    }

    if (!scene.titles) {
      scene.titles = [];
    }

    const title = {
      id: "title_" + Date.now(),

      text: String(text),

      x: 50,
      y: 15,

      width: 80,

      fontFamily: "Arial",

      fontSize: 32,

      fontWeight: "bold",

      alignment: "center",

      opacity: 1,

      rotation: 0,

      start: 0,

      end: Number(project.settings?.duration) || 10,

      animation: "fade",

      color: "#ffffff",

      background: "transparent"
    };

    UndoRedo.saveState();

    scene.titles.push(title);

    saveProject();

    Editor.render();

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    App.toast("Title added");

    return title;
  },

  edit(id) {
    const scene = Editor.getScene();

    if (!scene?.titles) return;

    const title = scene.titles.find(
      item => item.id === id
    );

    if (!title) return;

    const text = prompt(
      "Title text:",
      title.text
    );

    if (text === null) return;

    UndoRedo.saveState();

    title.text = text;

    saveProject();

    Editor.render();
  },

  setPosition(id, x, y) {
    const title = this.find(id);

    if (!title) return;

    title.x = Number(x) || 50;
    title.y = Number(y) || 50;

    saveProject();

    Editor.render();
  },

  setStyle(id, settings = {}) {
    const title = this.find(id);

    if (!title) return;

    Object.assign(title, settings);

    saveProject();

    Editor.render();
  },

  setTiming(id, start, end) {
    const title = this.find(id);

    if (!title) return;

    title.start =
      Math.max(
        0,
        Number(start) || 0
      );

    title.end =
      Math.max(
        title.start,
        Number(end) || title.start
      );

    saveProject();

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }
  },

  remove(id) {
    const scene = Editor.getScene();

    if (!scene?.titles) return;

    const confirmed = confirm(
      "Delete this title?"
    );

    if (!confirmed) return;

    UndoRedo.saveState();

    scene.titles =
      scene.titles.filter(
        title => title.id !== id
      );

    saveProject();

    Editor.render();

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }
  },

  find(id) {
    const scene = Editor.getScene();

    if (!scene?.titles) return null;

    return scene.titles.find(
      title => title.id === id
    ) || null;
  },

  getActive(time) {
    const scene = Editor.getScene();

    if (!scene?.titles) return [];

    const current =
      Number(time) || 0;

    return scene.titles.filter(
      title =>
        current >= title.start &&
        current <= title.end
    );
  },

  renderAt(container, time) {
    if (!container) return;

    const active =
      this.getActive(time);

    active.forEach(title => {
      const element =
        document.createElement("div");

      element.className =
        "scene-title";

      element.textContent =
        title.text;

      element.style.position =
        "absolute";

      element.style.left =
        `${title.x}%`;

      element.style.top =
        `${title.y}%`;

      element.style.width =
        `${title.width}%`;

      element.style.transform =
        `translate(-50%, -50%) rotate(${title.rotation}deg)`;

      element.style.opacity =
        title.opacity;

      element.style.color =
        title.color;

      element.style.fontFamily =
        title.fontFamily;

      element.style.fontSize =
        `${title.fontSize}px`;

      element.style.fontWeight =
        title.fontWeight;

      element.style.textAlign =
        title.alignment;

      if (
        title.background &&
        title.background !==
          "transparent"
      ) {
        element.style.background =
          title.background;

        element.style.padding =
          "8px 14px";

        element.style.borderRadius =
          "8px";
      }

      if (
        title.animation === "fade"
      ) {
        element.style.animation =
          "titleFadeIn 0.3s ease";
      }

      container.appendChild(
        element
      );
    });
  }
};
