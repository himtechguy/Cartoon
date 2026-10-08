const Props = {
  library: [
    "Phone",
    "Chair",
    "Table",
    "Car",
    "Door",
    "Bed",
    "TV",
    "Cup",
    "Bag",
    "Computer",
    "Food",
    "Money",
    "Books"
  ],

  init() {
    this.loadCustom();
  },

  loadCustom() {
    try {
      const saved = localStorage.getItem(
        "cartoon_studio_custom_props"
      );

      if (saved) {
        const custom =
          JSON.parse(saved);

        if (Array.isArray(custom)) {
          this.library = [
            ...this.library,
            ...custom.filter(
              item =>
                !this.library.includes(item)
            )
          ];
        }
      }
    } catch (error) {
      console.error(
        "Could not load custom props:",
        error
      );
    }
  },

  saveCustom() {
    const builtIn = [
      "Phone",
      "Chair",
      "Table",
      "Car",
      "Door",
      "Bed",
      "TV",
      "Cup",
      "Bag",
      "Computer",
      "Food",
      "Money",
      "Books"
    ];

    const custom =
      this.library.filter(
        item =>
          !builtIn.includes(item)
      );

    localStorage.setItem(
      "cartoon_studio_custom_props",
      JSON.stringify(custom)
    );
  },

  create() {
    const name = prompt(
      "Enter prop name:"
    );

    if (
      !name ||
      !name.trim()
    ) {
      return;
    }

    const cleanName =
      name.trim();

    if (
      this.library.some(
        item =>
          item.toLowerCase() ===
          cleanName.toLowerCase()
      )
    ) {
      alert(
        "A prop with that name already exists."
      );
      return;
    }

    this.library.push(
      cleanName
    );

    this.saveCustom();

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast(
        "Prop created"
      );
    }

    return cleanName;
  },

  add(name) {
    const scene =
      Editor.getScene();

    if (!scene) {
      alert(
        "Create a scene first."
      );
      return;
    }

    const propName =
      name ||
      this.library[0];

    const object = {
      id:
        "prop_" +
        Date.now(),

      type:
        "prop",

      name:
        propName,

      x: 50,
      y: 50,

      scale: 1,

      rotation: 0,

      opacity: 1,

      keyframes: []
    };

    UndoRedo.saveState();

    if (!scene.objects) {
      scene.objects = [];
    }

    scene.objects.push(
      object
    );

    Editor.selectedObject =
      object;

    saveProject();

    Editor.render();

    if (
      typeof Timeline !== "undefined"
    ) {
      Timeline.render();
    }

    App.toast(
      `${propName} added`
    );

    return object;
  },

  removeCustom(name) {
    const builtIn = [
      "Phone",
      "Chair",
      "Table",
      "Car",
      "Door",
      "Bed",
      "TV",
      "Cup",
      "Bag",
      "Computer",
      "Food",
      "Money",
      "Books"
    ];

    if (
      builtIn.includes(name)
    ) {
      alert(
        "Built-in props cannot be deleted."
      );
      return;
    }

    this.library =
      this.library.filter(
        item => item !== name
      );

    this.saveCustom();
  },

  getAll() {
    return [
      ...this.library
    ];
  }
};
