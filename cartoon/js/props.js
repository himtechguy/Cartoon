const Props = {
  builtIn: [
    { name: "Phone", icon: "📱" },
    { name: "Chair", icon: "🪑" },
    { name: "Table", icon: "🪵" },
    { name: "Car", icon: "🚗" },
    { name: "Door", icon: "🚪" },
    { name: "Bed", icon: "🛏️" },
    { name: "TV", icon: "📺" },
    { name: "Cup", icon: "☕" },
    { name: "Bag", icon: "👜" },
    { name: "Computer", icon: "💻" },
    { name: "Food", icon: "🍽️" },
    { name: "Money", icon: "💵" },
    { name: "Books", icon: "📚" }
  ],

  custom: [],

  init() {
    this.load();
  },

  load() {
    try {
      const saved =
        localStorage.getItem(
          "cartoon_studio_custom_props"
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
        "Could not load custom props:",
        error
      );

      this.custom = [];
    }
  },

  save() {
    try {
      localStorage.setItem(
        "cartoon_studio_custom_props",
        JSON.stringify(this.custom)
      );
    } catch (error) {
      console.error(
        "Could not save custom props:",
        error
      );
    }
  },

  getAll() {
    return [
      ...this.builtIn,
      ...this.custom
    ];
  },

  get(name) {
    return this.getAll().find(
      prop => prop.name === name
    ) || null;
  },

  add(name, options = {}) {
    const cleanName =
      String(name || "").trim();

    if (!cleanName) return null;

    const existing =
      this.get(cleanName);

    if (existing) {
      return existing;
    }

    const prop = {
      id:
        "prop_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 8),

      name: cleanName,

      icon:
        options.icon ||
        "📦",

      custom: true,

      createdAt:
        new Date().toISOString()
    };

    this.custom.push(prop);

    this.save();

    if (
      typeof Assets !== "undefined" &&
      Assets.addProp
    ) {
      const alreadyInAssets =
        Assets.get("props").some(
          asset =>
            asset.name === prop.name
        );

      if (!alreadyInAssets) {
        Assets.addProp(prop);
      }
    }

    return prop;
  },

  create() {
    const name =
      prompt("Enter prop name:");

    if (!name || !name.trim()) {
      return;
    }

    const icon =
      prompt(
        "Enter an emoji/icon for the prop:",
        "📦"
      );

    const prop =
      this.add(
        name.trim(),
        {
          icon:
            icon ||
            "📦"
        }
      );

    if (prop) {
      if (
        typeof App !== "undefined" &&
        App.toast
      ) {
        App.toast(
          `${prop.name} created`
        );
      }
    }
  },

  removeCustom(name) {
    const prop =
      this.custom.find(
        item => item.name === name
      );

    if (!prop) return;

    const confirmed =
      confirm(
        `Delete custom prop "${name}"?`
      );

    if (!confirmed) return;

    this.custom =
      this.custom.filter(
        item => item.name !== name
      );

    this.save();

    if (
      typeof Assets !== "undefined"
    ) {
      const assets =
        Assets.get("props");

      const asset =
        assets.find(
          item => item.name === name
        );

      if (asset) {
        Assets.remove(
          "props",
          asset.id
        );
      }
    }

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast("Prop deleted");
    }
  },

  addToScene(name) {
    const prop =
      this.get(name);

    if (!prop) return;

    if (
      typeof Editor !== "undefined" &&
      Editor.addProp
    ) {
      Editor.addProp(
        prop.name
      );

      return;
    }

    if (
      typeof Scenes !== "undefined" &&
      Scenes.addObject
    ) {
      Scenes.addObject({
        id:
          "obj_" +
          Date.now(),

        type: "prop",

        name: prop.name,

        icon:
          prop.icon ||
          "📦",

        x: 50,

        y: 50,

        scale: 1,

        rotation: 0,

        opacity: 1
      });
    }
  },

  render(containerId = "propsList") {
    const container =
      document.getElementById(
        containerId
      );

    if (!container) return;

    container.innerHTML = "";

    this.getAll().forEach(prop => {
      const button =
        document.createElement(
          "button"
        );

      button.className =
        "character-option";

      button.type = "button";

      button.innerHTML = `
        <span
          style="
            font-size:20px;
            margin-right:6px;
          "
        >
          ${this.escape(
            prop.icon || "📦"
          )}
        </span>

        ${this.escape(
          prop.name
        )}
      `;

      button.addEventListener(
        "click",
        () => {
          this.addToScene(
            prop.name
          );
        }
      );

      container.appendChild(
        button
      );
    });
  },

  exportCustom() {
    const data =
      JSON.stringify(
        this.custom,
        null,
        2
      );

    const blob =
      new Blob(
        [data],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "cartoon-studio-props.json";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
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
