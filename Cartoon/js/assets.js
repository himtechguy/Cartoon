const Assets = {
  library: {
    characters: [],
    backgrounds: [],
    props: [],
    sounds: [],
    music: [],
    voices: [],
    images: []
  },

  init() {
    this.load();
  },

  load() {
    try {
      const saved = localStorage.getItem(
        "cartoon_studio_assets"
      );

      if (saved) {
        const data = JSON.parse(saved);

        this.library = {
          ...this.library,
          ...data
        };
      }
    } catch (error) {
      console.error(
        "Could not load asset library:",
        error
      );
    }
  },

  save() {
    try {
      localStorage.setItem(
        "cartoon_studio_assets",
        JSON.stringify(this.library)
      );
    } catch (error) {
      console.error(
        "Could not save asset library:",
        error
      );
    }
  },

  add(type, asset) {
    if (!this.library[type]) {
      this.library[type] = [];
    }

    const item = {
      id:
        asset.id ||
        "asset_" + Date.now(),

      name:
        asset.name ||
        "Untitled Asset",

      createdAt:
        asset.createdAt ||
        new Date().toISOString(),

      ...asset
    };

    this.library[type].push(item);

    this.save();

    return item;
  },

  get(type) {
    return this.library[type] || [];
  },

  find(type, id) {
    return this.get(type).find(
      asset => asset.id === id
    );
  },

  remove(type, id) {
    if (!this.library[type]) return;

    this.library[type] =
      this.library[type].filter(
        asset => asset.id !== id
      );

    this.save();
  },

  rename(type, id, name) {
    const asset = this.find(type, id);

    if (!asset) return;

    if (!name || !name.trim()) return;

    asset.name = name.trim();

    this.save();
  },

  duplicate(type, id) {
    const original = this.find(type, id);

    if (!original) return null;

    const copy =
      JSON.parse(JSON.stringify(original));

    copy.id =
      "asset_" + Date.now();

    copy.name =
      (original.name || "Asset") +
      " Copy";

    copy.createdAt =
      new Date().toISOString();

    this.library[type].push(copy);

    this.save();

    return copy;
  },

  addCharacter(character) {
    return this.add(
      "characters",
      character
    );
  },

  addBackground(background) {
    return this.add(
      "backgrounds",
      background
    );
  },

  addProp(prop) {
    return this.add(
      "props",
      prop
    );
  },

  addSound(sound) {
    return this.add(
      "sounds",
      sound
    );
  },

  addMusic(music) {
    return this.add(
      "music",
      music
    );
  },

  addVoice(voice) {
    return this.add(
      "voices",
      voice
    );
  },

  addImage(image) {
    return this.add(
      "images",
      image
    );
  },

  clear(type) {
    if (!this.library[type]) return;

    const confirmed = confirm(
      `Remove all ${type} from the asset library?`
    );

    if (!confirmed) return;

    this.library[type] = [];

    this.save();
  },

  exportLibrary() {
    const data = JSON.stringify(
      this.library,
      null,
      2
    );

    const blob = new Blob(
      [data],
      {
        type: "application/json"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "cartoon-studio-assets.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  },

  importLibrary(file) {
    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = event => {
      try {
        const imported =
          JSON.parse(
            event.target.result
          );

        if (
          !imported ||
          typeof imported !== "object"
        ) {
          throw new Error(
            "Invalid asset library"
          );
        }

        this.library = {
          characters: [],
          backgrounds: [],
          props: [],
          sounds: [],
          music: [],
          voices: [],
          images: [],
          ...imported
        };

        this.save();

        App.toast(
          "Asset library imported"
        );
      } catch (error) {
        console.error(error);

        alert(
          "The asset library file is invalid."
        );
      }
    };

    reader.readAsText(file);
  }
};
