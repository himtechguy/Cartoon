const Backgrounds = {
  presets: [
    {
      id: "bg_house",
      name: "House",
      color: "#8b6f5a"
    },
    {
      id: "bg_bedroom",
      name: "Bedroom",
      color: "#5d6d7e"
    },
    {
      id: "bg_living",
      name: "Living Room",
      color: "#665b50"
    },
    {
      id: "bg_kitchen",
      name: "Kitchen",
      color: "#71808a"
    },
    {
      id: "bg_school",
      name: "School",
      color: "#6f8f72"
    },
    {
      id: "bg_street",
      name: "Street",
      color: "#59636e"
    },
    {
      id: "bg_shop",
      name: "Shop",
      color: "#806b54"
    },
    {
      id: "bg_bus",
      name: "Bus Stop",
      color: "#65717c"
    },
    {
      id: "bg_park",
      name: "Park",
      color: "#4f7553"
    },
    {
      id: "bg_restaurant",
      name: "Restaurant",
      color: "#754f46"
    },
    {
      id: "bg_night",
      name: "Night",
      color: "#101a32"
    }
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

      this.custom = saved
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
    localStorage.setItem(
      "cartoon_studio_backgrounds",
      JSON.stringify(this.custom)
    );
  },

  getAll() {
    return [
      ...this.presets,
      ...this.custom
    ];
  },

  find(id) {
    return this.getAll().find(
      background =>
        background.id === id
    );
  },

  create() {
    const name = prompt(
      "Background name:"
    );

    if (
      !name ||
      !name.trim()
    ) {
      return;
    }

    const color =
      prompt(
        "Background colour:",
        "#18202b"
      );

    if (
      !color ||
      !color.trim()
    ) {
      return;
    }

    const background = {
      id:
        "bg_custom_" +
        Date.now(),

      name:
        name.trim(),

      color:
        color.trim(),

      type:
        "color",

      image:
        null,

      weather:
        "none",

      lighting:
        "day"
    };

    this.custom.push(
      background
    );

    this.save();

    App.toast(
      "Background created"
    );

    return background;
  },

  apply(id) {
    const background =
      this.find(id);

    if (!background) {
      return;
    }

    const scene =
      Editor.getScene();

    if (!scene) {
      alert(
        "Create a scene first."
      );
      return;
    }

    UndoRedo.saveState();

    scene.background = {
      ...background
    };

    saveProject();

    Editor.render();

    App.toast(
      `${background.name} applied`
    );
  },

  setColor(color) {
    const scene =
      Editor.getScene();

    if (!scene) return;

    UndoRedo.saveState();

    if (!scene.background) {
      scene.background = {};
    }

    scene.background.type =
      "color";

    scene.background.color =
      color;

    saveProject();

    Editor.render();
  },

  setWeather(weather) {
    const scene =
      Editor.getScene();

    if (!scene) return;

    if (!scene.background) {
      scene.background = {};
    }

    scene.background.weather =
      weather;

    saveProject();

    Editor.render();
  },

  setLighting(lighting) {
    const scene =
      Editor.getScene();

    if (!scene) return;

    if (!scene.background) {
      scene.background = {};
    }

    scene.background.lighting =
      lighting;

    saveProject();

    Editor.render();
  },

  deleteCustom(id) {
    const preset =
      this.presets.find(
        item => item.id === id
      );

    if (preset) {
      alert(
        "Built-in backgrounds cannot be deleted."
      );
      return;
    }

    const confirmed =
      confirm(
        "Delete this background?"
      );

    if (!confirmed) {
      return;
    }

    this.custom =
      this.custom.filter(
        item => item.id !== id
      );

    this.save();

    App.toast(
      "Background deleted"
    );
  }
};
