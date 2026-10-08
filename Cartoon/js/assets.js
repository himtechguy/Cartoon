const Assets = {
  activeTab: "all",
  searchTerm: "",
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
    this.bind();
    this.render();
  },

  load() {
    try {
      const saved = localStorage.getItem("cartoon_studio_assets");

      if (saved) {
        const parsed = JSON.parse(saved);

        this.library = {
          ...this.library,
          ...parsed
        };
      }
    } catch (error) {
      console.error("Could not load assets:", error);
    }

    this.ensureArrays();
  },

  ensureArrays() {
    Object.keys(this.library).forEach(type => {
      if (!Array.isArray(this.library[type])) {
        this.library[type] = [];
      }
    });
  },

  save() {
    try {
      localStorage.setItem(
        "cartoon_studio_assets",
        JSON.stringify(this.library)
      );
    } catch (error) {
      console.error("Could not save assets:", error);
    }
  },

  bind() {
    const search = document.getElementById("assetSearch");

    if (search) {
      search.addEventListener("input", event => {
        this.searchTerm =
          String(event.target.value || "")
            .toLowerCase()
            .trim();

        this.render();
      });
    }

    document.querySelectorAll(".asset-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        this.activeTab =
          tab.dataset.type || "all";

        document
          .querySelectorAll(".asset-tab")
          .forEach(item => {
            item.classList.toggle(
              "active",
              item.dataset.type === this.activeTab
            );
          });

        this.render();
      });
    });

    const imageInput =
      document.getElementById("imageAssetInput");

    if (imageInput) {
      imageInput.addEventListener("change", event => {
        const files =
          Array.from(event.target.files || []);

        files.forEach(file => {
          this.addImage(file);
        });

        event.target.value = "";
      });
    }
  },

  getTypes() {
    return {
      characters: "Characters",
      backgrounds: "Backgrounds",
      props: "Props",
      sounds: "Sounds",
      music: "Music",
      voices: "Voices",
      images: "Images"
    };
  },

  getAll() {
    this.ensureArrays();

    const result = [];

    Object.keys(this.library).forEach(type => {
      this.library[type].forEach(asset => {
        result.push({
          ...asset,
          assetType: type
        });
      });
    });

    return result;
  },

  get(type) {
    this.ensureArrays();
    return this.library[type] || [];
  },

  add(type, asset) {
    if (!this.library[type]) {
      this.library[type] = [];
    }

    if (!asset || typeof asset !== "object") {
      return null;
    }

    if (!asset.id) {
      asset.id =
        "asset_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 8);
    }

    asset.createdAt =
      asset.createdAt ||
      new Date().toISOString();

    this.library[type].push(asset);

    this.save();
    this.render();

    return asset;
  },

  addCharacter(character) {
    if (!character) return;

    return this.add("characters", {
      id: character.id,
      name: character.name || "Character",
      type: "character",
      characterId: character.id
    });
  },

  addBackground(background) {
    return this.add("backgrounds", {
      name: background?.name || "Background",
      type: "background",
      value: background || null
    });
  },

  addProp(prop) {
    return this.add("props", {
      name:
        typeof prop === "string"
          ? prop
          : prop?.name || "Prop",

      type: "prop",

      value:
        typeof prop === "string"
          ? prop
          : prop
    });
  },

  addSound(sound) {
    return this.add("sounds", {
      name: sound?.name || "Sound Effect",
      type: "sound",
      value: sound
    });
  },

  addMusic(music) {
    return this.add("music", {
      name: music?.name || "Music",
      type: "music",
      value: music
    });
  },

  addVoice(voice) {
    return this.add("voices", {
      name: voice?.name || "Voice",
      type: "voice",
      value: voice
    });
  },

  async addImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    try {
      const dataUrl =
        await this.fileToDataURL(file);

      this.add("images", {
        name: file.name,
        type: "image",
        mimeType: file.type,
        size: file.size,
        dataUrl
      });

      if (
        typeof App !== "undefined" &&
        App.toast
      ) {
        App.toast("Image added to library");
      }
    } catch (error) {
      console.error(error);
      alert("Could not import image.");
    }
  },

  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  },

  find(type, id) {
    return this.library[type]?.find(
      asset => asset.id === id
    ) || null;
  },

  remove(type, id) {
    if (!this.library[type]) return;

    const asset =
      this.find(type, id);

    if (!asset) return;

    const confirmed = confirm(
      `Remove "${asset.name || "this asset"}"?`
    );

    if (!confirmed) return;

    this.library[type] =
      this.library[type].filter(
        item => item.id !== id
      );

    this.save();
    this.render();

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast("Asset removed");
    }
  },

  rename(type, id) {
    const asset =
      this.find(type, id);

    if (!asset) return;

    const name = prompt(
      "Asset name:",
      asset.name || ""
    );

    if (!name || !name.trim()) return;

    asset.name =
      name.trim();

    this.save();
    this.render();
  },

  duplicate(type, id) {
    const asset =
      this.find(type, id);

    if (!asset) return;

    const copy =
      JSON.parse(
        JSON.stringify(asset)
      );

    copy.id =
      "asset_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 8);

    copy.name =
      (asset.name || "Asset") +
      " Copy";

    this.library[type].push(copy);

    this.save();
    this.render();

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast("Asset duplicated");
    }
  },

  createCustom() {
    const name = prompt(
      "Enter custom asset name:"
    );

    if (!name || !name.trim()) {
      return;
    }

    const type = prompt(
      "Asset type: character, background, prop, sound, music, voice"
    );

    if (!type) return;

    const normalized =
      type.toLowerCase().trim();

    const allowed = [
      "character",
      "background",
      "prop",
      "sound",
      "music",
      "voice"
    ];

    if (!allowed.includes(normalized)) {
      alert("Invalid asset type.");
      return;
    }

    const collection =
      normalized + "s";

    this.add(collection, {
      name: name.trim(),
      type: normalized,
      custom: true
    });

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast("Custom asset created");
    }
  },

  clear() {
    const confirmed = confirm(
      "Clear the entire asset library?"
    );

    if (!confirmed) return;

    this.library = {
      characters: [],
      backgrounds: [],
      props: [],
      sounds: [],
      music: [],
      voices: [],
      images: []
    };

    this.save();
    this.render();

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast("Asset library cleared");
    }
  },

  exportLibrary() {
    const data =
      JSON.stringify(
        this.library,
        null,
        2
      );

    const blob =
      new Blob(
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
          ...this.library,
          ...imported
        };

        this.ensureArrays();
        this.save();
        this.render();

        if (
          typeof App !== "undefined" &&
          App.toast
        ) {
          App.toast(
            "Asset library imported"
          );
        }
      } catch (error) {
        console.error(error);
        alert(
          "The asset library file is invalid."
        );
      }
    };

    reader.readAsText(file);
  },

  getFilteredAssets() {
    let assets =
      this.activeTab === "all"
        ? this.getAll()
        : this.get(this.activeTab)
            .map(asset => ({
              ...asset,
              assetType: this.activeTab
            }));

    if (!this.searchTerm) {
      return assets;
    }

    return assets.filter(asset =>
      String(
        asset.name || ""
      )
        .toLowerCase()
        .includes(this.searchTerm)
    );
  },

  render() {
    const grid =
      document.getElementById("assetGrid");

    if (!grid) return;

    this.ensureArrays();

    const assets =
      this.getFilteredAssets();

    grid.innerHTML = "";

    if (!assets.length) {
      grid.innerHTML = `
        <div class="asset-empty">
          <div style="font-size:36px;margin-bottom:10px;">
            📦
          </div>

          <strong>
            No assets found
          </strong>

          <p>
            Add characters, backgrounds,
            props, sounds, music, voices
            or images.
          </p>
        </div>
      `;

      return;
    }

    assets.forEach(asset => {
      const card =
        document.createElement("div");

      card.className =
        "asset-card";

      const preview =
        this.getPreview(asset);

      card.innerHTML = `
        <div class="asset-preview">
          ${preview}
        </div>

        <div class="asset-name">
          ${this.escape(
            asset.name || "Unnamed Asset"
          )}
        </div>

        <div class="asset-type">
          ${this.escape(
            asset.assetType || "asset"
          )}
        </div>

        <div class="asset-actions">

          <button
            onclick="Assets.rename(
              '${asset.assetType}',
              '${asset.id}'
            )"
          >
            Rename
          </button>

          <button
            onclick="Assets.duplicate(
              '${asset.assetType}',
              '${asset.id}'
            )"
          >
            Copy
          </button>

          <button
            class="danger-btn"
            onclick="Assets.remove(
              '${asset.assetType}',
              '${asset.id}'
            )"
          >
            Delete
          </button>

        </div>
      `;

      grid.appendChild(card);
    });
  },

  getPreview(asset) {
    if (
      asset.assetType === "images" &&
      asset.dataUrl
    ) {
      return `
        <img
          src="${asset.dataUrl}"
          alt=""
        >
      `;
    }

    const icons = {
      characters: "👤",
      backgrounds: "🌄",
      props: "📦",
      sounds: "🔊",
      music: "🎵",
      voices: "🎙️",
      images: "🖼️"
    };

    return (
      icons[asset.assetType] ||
      "📦"
    );
  },

  escape(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};
