const Characters = {
  editingId: null,

  defaults: {
    appearance: {
      skin: "#8B5A3C",
      hair: "default",
      hairColor: "#171717",
      eyes: "default",
      eyeColor: "#171717",
      eyebrows: "default",
      nose: "default",
      mouth: "default",
      ears: "default",
      facialHair: "none",
      facialHairColor: "#171717",
      clothing: "default",
      clothingColor: "#2563eb",
      shoes: "default",
      shoesColor: "#171717",
      accessories: []
    },

    body: {
      height: 1,
      width: 1
    },

    pose: "standing",
    expression: "normal"
  },

  poses: [
    "standing",
    "walking",
    "running",
    "sitting",
    "lying",
    "talking",
    "pointing",
    "waving",
    "dancing",
    "fighting"
  ],

  expressions: [
    "normal",
    "happy",
    "sad",
    "angry",
    "scared",
    "shocked",
    "laughing",
    "crying",
    "confused",
    "thinking",
    "smirking"
  ],

  hairStyles: [
    "default",
    "short",
    "long",
    "curly",
    "afro",
    "braids",
    "cornrows",
    "dreads",
    "fade",
    "bald"
  ],

  clothingStyles: [
    "default",
    "tshirt",
    "hoodie",
    "shirt",
    "jacket",
    "suit",
    "school",
    "tracksuit"
  ],

  facialHairStyles: [
    "none",
    "mustache",
    "beard",
    "goatee",
    "full-beard"
  ],

  accessories: [
    "none",
    "earring",
    "glasses",
    "cap",
    "chain",
    "watch",
    "headphones"
  ],

  init() {
    this.ensureCharacters();
    this.render();
  },

  ensureCharacters() {
    if (!Array.isArray(project.characters)) {
      project.characters = [];
    }

    if (!project.characters.some(c => c.name === "Takue")) {
      const takue = this.createCharacterObject("Takue");

      takue.appearance.hair = "cornrows";
      takue.appearance.hairColor = "#111111";
      takue.appearance.facialHair = "none";
      takue.appearance.accessories = ["earring"];

      project.characters.unshift(takue);
      saveProject();
    }
  },

  createCharacterObject(name) {
    return {
      id: "char_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),

      name: name || "New Character",

      appearance: JSON.parse(
        JSON.stringify(this.defaults.appearance)
      ),

      body: JSON.parse(
        JSON.stringify(this.defaults.body)
      ),

      pose: this.defaults.pose,
      expression: this.defaults.expression,

      keyframes: [],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  create() {
    const name = prompt("Character name:");

    if (!name || !name.trim()) {
      return;
    }

    const cleanName = name.trim();

    if (
      project.characters.some(
        character =>
          character.name.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      if (typeof App !== "undefined") {
        App.toast("A character with that name already exists");
      }

      return;
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const character = this.createCharacterObject(cleanName);

    project.characters.push(character);

    saveProject();

    this.render();

    if (typeof App !== "undefined") {
      App.toast(`${cleanName} created`);
    }

    this.edit(character.id);
  },

  edit(id) {
    const character = project.characters.find(
      item => item.id === id
    );

    if (!character) {
      return;
    }

    this.editingId = id;

    this.openEditor(character);
  },

  openEditor(character) {
    const modal = document.getElementById("modal");

    if (!modal) {
      this.simpleEdit(character);
      return;
    }

    modal.innerHTML = `
      <div class="modal-card character-editor-modal">

        <div class="modal-header">
          <div>
            <h2>Character Studio</h2>
            <p>Edit ${this.escape(character.name)}</p>
          </div>

          <button class="modal-close" onclick="App.closeModal()">×</button>
        </div>

        <div class="character-editor">

          <div class="character-editor-preview">
            <div id="characterPreview"
                 class="character-live-preview">
              ${this.getCharacterEmoji(character)}
            </div>

            <strong id="characterPreviewName">
              ${this.escape(character.name)}
            </strong>
          </div>

          <div class="character-editor-form">

            <label>
              Character Name
              <input
                id="characterNameInput"
                type="text"
                value="${this.escapeAttribute(character.name)}"
              >
            </label>

            <h3>Appearance</h3>

            <label>
              Skin
              <input
                id="characterSkin"
                type="color"
                value="${character.appearance.skin || "#8B5A3C"}"
              >
            </label>

            <label>
              Hair
              <select id="characterHair">
                ${this.options(
                  this.hairStyles,
                  character.appearance.hair
                )}
              </select>
            </label>

            <label>
              Hair Colour
              <input
                id="characterHairColor"
                type="color"
                value="${character.appearance.hairColor || "#171717"}"
              >
            </label>

            <label>
              Eyes
              <select id="characterEyes">
                ${this.options(
                  ["default", "small", "large", "wide", "sleepy"],
                  character.appearance.eyes
                )}
              </select>
            </label>

            <label>
              Eye Colour
              <input
                id="characterEyeColor"
                type="color"
                value="${character.appearance.eyeColor || "#171717"}"
              >
            </label>

            <label>
              Facial Hair
              <select id="characterFacialHair">
                ${this.options(
                  this.facialHairStyles,
                  character.appearance.facialHair
                )}
              </select>
            </label>

            <label>
              Clothing
              <select id="characterClothing">
                ${this.options(
                  this.clothingStyles,
                  character.appearance.clothing
                )}
              </select>
            </label>

            <label>
              Clothing Colour
              <input
                id="characterClothingColor"
                type="color"
                value="${character.appearance.clothingColor || "#2563eb"}"
              >
            </label>

            <label>
              Shoes
              <select id="characterShoes">
                ${this.options(
                  ["default", "sneakers", "boots", "school", "slides"],
                  character.appearance.shoes
                )}
              </select>
            </label>

            <label>
              Accessories
              <select id="characterAccessory">
                ${this.options(
                  this.accessories,
                  "none"
                )}
              </select>
            </label>

            <h3>Body</h3>

            <label>
              Height
              <input
                id="characterHeight"
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value="${character.body.height || 1}"
              >
            </label>

            <label>
              Body Size
              <input
                id="characterWidth"
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value="${character.body.width || 1}"
              >
            </label>

            <h3>Pose</h3>

            <select id="characterPose">
              ${this.options(
                this.poses,
                character.pose
              )}
            </select>

            <h3>Expression</h3>

            <select id="characterExpression">
              ${this.options(
                this.expressions,
                character.expression
              )}
            </select>

          </div>

        </div>

        <div class="modal-actions">

          <button
            class="secondary-btn"
            onclick="App.closeModal()">
            Cancel
          </button>

          <button
            class="primary-btn"
            onclick="Characters.saveEditor()">
            Save Character
          </button>

        </div>

      </div>
    `;

    modal.classList.add("active");

    this.bindEditorPreview();
  },

  bindEditorPreview() {
    const ids = [
      "characterSkin",
      "characterHair",
      "characterHairColor",
      "characterEyes",
      "characterEyeColor",
      "characterFacialHair",
      "characterClothing",
      "characterClothingColor",
      "characterShoes",
      "characterAccessory",
      "characterHeight",
      "characterWidth",
      "characterPose",
      "characterExpression"
    ];

    ids.forEach(id => {
      const element = document.getElementById(id);

      if (element) {
        element.addEventListener("input", () => {
          this.updateEditorPreview();
        });

        element.addEventListener("change", () => {
          this.updateEditorPreview();
        });
      }
    });

    this.updateEditorPreview();
  },

  updateEditorPreview() {
    const preview = document.getElementById(
      "characterPreview"
    );

    if (!preview) {
      return;
    }

    const character = this.getEditorCharacter();

    preview.innerHTML = this.getCharacterEmoji(character);

    const height =
      Number(character.body.height || 1);

    const width =
      Number(character.body.width || 1);

    preview.style.transform =
      `scale(${width}) scaleY(${height})`;
  },

  getEditorCharacter() {
    const current =
      project.characters.find(
        character =>
          character.id === this.editingId
      ) || this.createCharacterObject("Preview");

    const accessories =
      current.appearance.accessories || [];

    const selectedAccessory =
      document.getElementById("characterAccessory");

    const accessoryValue =
      selectedAccessory
        ? selectedAccessory.value
        : "none";

    return {
      ...current,

      name:
        document.getElementById("characterNameInput")?.value ||
        current.name,

      appearance: {
        ...current.appearance,

        skin:
          document.getElementById("characterSkin")?.value ||
          current.appearance.skin,

        hair:
          document.getElementById("characterHair")?.value ||
          current.appearance.hair,

        hairColor:
          document.getElementById("characterHairColor")?.value ||
          current.appearance.hairColor,

        eyes:
          document.getElementById("characterEyes")?.value ||
          current.appearance.eyes,

        eyeColor:
          document.getElementById("characterEyeColor")?.value ||
          current.appearance.eyeColor,

        facialHair:
          document.getElementById("characterFacialHair")?.value ||
          current.appearance.facialHair,

        clothing:
          document.getElementById("characterClothing")?.value ||
          current.appearance.clothing,

        clothingColor:
          document.getElementById("characterClothingColor")?.value ||
          current.appearance.clothingColor,

        shoes:
          document.getElementById("characterShoes")?.value ||
          current.appearance.shoes,

        accessories:
          accessoryValue === "none"
            ? accessories
            : Array.from(
                new Set([...accessories, accessoryValue])
              )
      },

      body: {
        height:
          Number(
            document.getElementById("characterHeight")?.value ||
            current.body.height ||
            1
          ),

        width:
          Number(
            document.getElementById("characterWidth")?.value ||
            current.body.width ||
            1
          )
      },

      pose:
        document.getElementById("characterPose")?.value ||
        current.pose,

      expression:
        document.getElementById("characterExpression")?.value ||
        current.expression
    };
  },

  saveEditor() {
    const character =
      project.characters.find(
        item => item.id === this.editingId
      );

    if (!character) {
      return;
    }

    const updated =
      this.getEditorCharacter();

    const newName =
      updated.name.trim();

    if (!newName) {
      if (typeof App !== "undefined") {
        App.toast("Character name cannot be empty");
      }

      return;
    }

    const duplicate =
      project.characters.some(
        item =>
          item.id !== character.id &&
          item.name.toLowerCase() ===
            newName.toLowerCase()
      );

    if (duplicate) {
      if (typeof App !== "undefined") {
        App.toast("That character name already exists");
      }

      return;
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    Object.assign(character, updated);

    character.updatedAt =
      new Date().toISOString();

    saveProject();

    this.render();

    if (typeof Editor !== "undefined") {
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof App !== "undefined") {
      App.closeModal();
      App.toast(`${character.name} saved`);
    }
  },

  simpleEdit(character) {
    const name =
      prompt(
        "Character name:",
        character.name
      );

    if (!name || !name.trim()) {
      return;
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    character.name = name.trim();
    character.updatedAt =
      new Date().toISOString();

    saveProject();
    this.render();
  },

  remove(id) {
    const character =
      project.characters.find(
        item => item.id === id
      );

    if (!character) {
      return;
    }

    if (character.name === "Takue") {
      if (typeof App !== "undefined") {
        App.toast("Takue is the main character and cannot be deleted");
      }

      return;
    }

    const confirmed =
      confirm(
        `Delete ${character.name}?`
      );

    if (!confirmed) {
      return;
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    project.characters =
      project.characters.filter(
        item => item.id !== id
      );

    // Remove character objects from scenes.
    project.episodes?.forEach(episode => {
      episode.scenes?.forEach(scene => {
        scene.objects =
          (scene.objects || []).filter(
            object =>
              object.characterId !== id
          );
      });
    });

    saveProject();

    this.render();

    if (typeof Editor !== "undefined") {
      Editor.render();
    }

    if (typeof App !== "undefined") {
      App.toast("Character deleted");
    }
  },

  get(id) {
    return (
      project.characters.find(
        character => character.id === id
      ) || null
    );
  },

  getAll() {
    return Array.isArray(project.characters)
      ? project.characters
      : [];
  },

  getCharacterEmoji(character) {
    const expression =
      character.expression || "normal";

    const pose =
      character.pose || "standing";

    const expressions = {
      normal: "🧑🏾",
      happy: "😄",
      sad: "😔",
      angry: "😠",
      scared: "😨",
      shocked: "😮",
      laughing: "😂",
      crying: "😭",
      confused: "🤨",
      thinking: "🤔",
      smirking: "😏"
    };

    const poseIcons = {
      standing: "",
      walking: "🚶",
      running: "🏃",
      sitting: "🪑",
      lying: "🛌",
      talking: "🗣️",
      pointing: "👉",
      waving: "👋",
      dancing: "💃",
      fighting: "🥊"
    };

    return (
      expressions[expression] ||
      expressions.normal
    ) +
      " " +
      (poseIcons[pose] || "");
  },

  options(values, selected) {
    return values
      .map(value => {
        const isSelected =
          value === selected
            ? " selected"
            : "";

        return `
          <option value="${this.escapeAttribute(value)}"${isSelected}>
            ${this.formatLabel(value)}
          </option>
        `;
      })
      .join("");
  },

  formatLabel(value) {
    return String(value)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      );
  },

  render() {
    const container =
      document.getElementById(
        "charactersList"
      );

    if (!container) {
      return;
    }

    this.ensureCharacters();

    container.innerHTML = "";

    if (!project.characters.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">👤</div>

          <h3>No characters yet</h3>

          <p>Create your first character.</p>

          <button
            class="primary-btn"
            onclick="Characters.create()">
            + Create Character
          </button>
        </div>
      `;

      return;
    }

    project.characters.forEach(character => {
      const card =
        document.createElement("div");

      card.className =
        "character-card";

      const appearance =
        character.appearance || {};

      const accessories =
        Array.isArray(
          appearance.accessories
        )
          ? appearance.accessories
          : [];

      card.innerHTML = `
        <div
          class="character-preview"
          style="
            background:${appearance.skin || "#8B5A3C"};
          ">
          ${this.getCharacterEmoji(character)}
        </div>

        <div class="character-info">

          <h3>
            ${this.escape(character.name)}
          </h3>

          <p>
            ${this.formatLabel(
              character.pose || "standing"
            )}
            •
            ${this.formatLabel(
              character.expression || "normal"
            )}
          </p>

          <small>
            ${this.formatLabel(
              appearance.hair || "default"
            )}
            •
            ${this.formatLabel(
              appearance.clothing || "default"
            )}
            ${
              accessories.length
                ? " • " +
                  accessories
                    .map(a => this.formatLabel(a))
                    .join(", ")
                : ""
            }
          </small>

        </div>

        <div class="character-actions">

          <button
            onclick="Characters.edit('${character.id}')">
            Edit
          </button>

          ${
            character.name !== "Takue"
              ? `
                <button
                  class="danger-btn"
                  onclick="Characters.remove('${character.id}')">
                  Delete
                </button>
              `
              : ""
          }

        </div>
      `;

      container.appendChild(card);
    });
  },

  escape(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  escapeAttribute(text) {
    return this.escape(text);
  }
};
