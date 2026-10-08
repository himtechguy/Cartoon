const Backgrounds = {
  presets: [
    { name: "House", icon: "🏠", color: "#6d7f91" },
    { name: "Bedroom", icon: "🛏️", color: "#51485f" },
    { name: "Living Room", icon: "🛋️", color: "#6b6254" },
    { name: "Kitchen", icon: "🍳", color: "#737b70" },
    { name: "School", icon: "🏫", color: "#68798a" },
    { name: "Street", icon: "🛣️", color: "#4d5963" },
    { name: "Shop", icon: "🏪", color: "#765f4c" },
    { name: "Bus Stop", icon: "🚌", color: "#586a72" },
    { name: "Park", icon: "🌳", color: "#3f654d" },
    { name: "Restaurant", icon: "🍽️", color: "#684e49" },
    { name: "Night", icon: "🌙", color: "#111a2c" }
  ],

  custom: [],

  init() {
    this.load();
  },

  load() {
    try {
      const saved =
        localStorage.getItem(
          "cartoon_studio_backgrounds"
        );

      this.custom =
        saved
          ? JSON.parse(saved)
          : [];

      if (!Array.isArray(this.custom)) {
        this.custom = [];
      }
    } catch (error) {
      console.error(
        "Could not load backgrounds:",
        error
      );

      this.custom = [];
    }
  },

  save() {
    try {
      localStorage.setItem(
        "cartoon_studio_backgrounds",
        JSON.stringify(this.custom)
      );
    } catch (error) {
      console.error(
        "Could not save backgrounds:",
        error
      );
    }
  },

  getAll() {
    return [
      ...this.presets,
      ...this.custom
    ];
  },

  get(name) {
    return this.getAll().find(
      background =>
        background.name === name
    ) || null;
  },

  create() {
    const name =
      prompt(
        "Enter background name:"
      );

    if (!name || !name.trim()) {
      return;
    }

    const color =
      prompt(
        "Background color:",
        "#18202b"
      );

    const background = {
      id:
        "background_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 8),

      name: name.trim(),

      icon: "🌄",

      color:
        color || "#18202b",

      custom: true,

      createdAt:
        new Date().toISOString()
    };

    this.custom.push(
      background
    );

    this.save();

    if (
      typeof Assets !== "undefined" &&
      Assets.addBackground
    ) {
      Assets.addBackground(
        background
      );
    }

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast(
        "Background created"
      );
    }

    return background;
  },

  apply(name) {
    const background =
      this.get(name);

    if (!background) {
      return;
    }

    const scene =
      typeof Scenes !== "undefined"
        ? Scenes.getCurrent()
        : null;

    if (!scene) {
      if (
        typeof App !== "undefined" &&
        App.toast
      ) {
        App.toast(
          "Open a scene first"
        );
      }

      return;
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    scene.background = {
      type: "color",

      color:
        background.color ||
        "#18202b",

      image:
        background.image ||
        null,

      name:
        background.name,

      weather:
        scene.background?.weather ||
        "none",

      lighting:
        scene.background?.lighting ||
        "day"
    };

    saveProject();

    if (
      typeof Editor !== "undefined"
    ) {
      Editor.render();
    }

    if (
      typeof Scenes !== "undefined" &&
      Scenes.render
    ) {
      Scenes.render();
    }
  },

  setColor(color) {
    const scene =
      typeof Scenes !== "undefined"
        ? Scenes.getCurrent()
        : null;

    if (!scene) return;

    if (!scene.background) {
      scene.background = {};
    }

    scene.background.type =
      "color";

    scene.background.color =
      color || "#18202b";

    saveProject();

    if (
      typeof Editor !== "undefined"
    ) {
      Editor.render();
    }
  },

  setWeather(weather) {
    if (
      typeof Scenes !== "undefined" &&
      Scenes.setWeather
    ) {
      Scenes.setWeather(
        weather
      );
    }
  },

  setLighting(lighting) {
    if (
      typeof Scenes !== "undefined" &&
      Scenes.setLighting
    ) {
      Scenes.setLighting(
        lighting
      );
    }
  },

  deleteCustom(name) {
    const background =
      this.custom.find(
        item =>
          item.name === name
      );

    if (!background) {
      return;
    }

    const confirmed =
      confirm(
        `Delete custom background "${name}"?`
      );

    if (!confirmed) {
      return;
    }

    this.custom =
      this.custom.filter(
        item =>
          item.name !== name
      );

    this.save();

    if (
      typeof Assets !== "undefined"
    ) {
      const assets =
        Assets.get(
          "backgrounds"
        );

      const asset =
        assets.find(
          item =>
            item.name === name
        );

      if (asset) {
        Assets.remove(
          "backgrounds",
          asset.id
        );
      }
    }

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast(
        "Background deleted"
      );
    }
  },

  render(containerId = "backgroundList") {
    const container =
      document.getElementById(
        containerId
      );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    this.getAll().forEach(
      background => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";

        button.className =
          "character-option";

        button.innerHTML = `
          <span
            style="
              font-size:20px;
              margin-right:6px;
            "
          >
            ${this.escape(
              background.icon ||
              "🌄"
            )}
          </span>

          ${this.escape(
            background.name
          )}
        `;

        button.addEventListener(
          "click",
          () => {
            this.apply(
              background.name
            );
          }
        );

        container.appendChild(
          button
        );
      }
    );
  },

  getCurrent() {
    const scene =
      typeof Scenes !== "undefined"
        ? Scenes.getCurrent()
        : null;

    return (
      scene?.background ||
      null
    );
  },

  escape(text) {
    return String(text)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }
};
