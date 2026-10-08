const Dialogue = {
  editingId: null,

  init() {
    this.ensureStructure();
    this.render();
  },

  ensureStructure() {
    const scene = this.getScene();

    if (!scene) return;

    if (!Array.isArray(scene.dialogue)) {
      scene.dialogue = [];
    }
  },

  getEpisode() {
    if (typeof Episodes !== "undefined" &&
        Episodes.getCurrent) {
      return Episodes.getCurrent();
    }

    return project.episodes?.[0] || null;
  },

  getScene() {
    if (typeof Scenes !== "undefined" &&
        Scenes.getCurrent) {
      return Scenes.getCurrent();
    }

    const episode = this.getEpisode();

    return episode?.scenes?.[0] || null;
  },

  getAll() {
    const scene = this.getScene();

    return scene?.dialogue || [];
  },

  get(id) {
    return this.getAll().find(
      item => item.id === id
    ) || null;
  },

  add() {
    const scene = this.getScene();

    if (!scene) {
      this.toast("Create a scene first");
      return;
    }

    const characters =
      Array.isArray(project.characters)
        ? project.characters
        : [];

    if (!characters.length) {
      this.toast("Create a character first");
      return;
    }

    const character = characters[0];

    const dialogue = {
      id:
        "dialogue_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 7),

      characterId: character.id,

      text: "Hello!",

      start: 0,

      end: Math.min(
        3,
        Number(scene.duration) || 10
      ),

      voiceId: null,

      bubble: {
        type: "speech",
        position: "above",
        style: "rounded"
      },

      style: {
        font: "Arial",
        size: 24,
        align: "center",
        bold: false,
        italic: false
      },

      animation: "fade",

      x: 50,
      y: 25
    };

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    scene.dialogue.push(dialogue);

    saveProject();

    this.editingId = dialogue.id;

    this.render();

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof Editor !== "undefined") {
      Editor.render();
    }

    this.openEditor(dialogue);
  },

  edit(id) {
    const dialogue = this.get(id);

    if (!dialogue) return;

    this.editingId = id;

    this.openEditor(dialogue);
  },

  openEditor(dialogue) {
    const modal =
      document.getElementById("modal");

    if (!modal) {
      this.quickEdit(dialogue);
      return;
    }

    const characterOptions =
      (project.characters || [])
        .map(character => `
          <option
            value="${this.escapeAttribute(character.id)}"
            ${
              character.id === dialogue.characterId
                ? "selected"
                : ""
            }>
            ${this.escape(character.name)}
          </option>
        `)
        .join("");

    modal.innerHTML = `
      <div class="modal-card dialogue-editor-modal">

        <div class="modal-header">
          <div>
            <h2>Dialogue</h2>
            <p>Edit character speech</p>
          </div>

          <button
            class="modal-close"
            onclick="App.closeModal()">
            ×
          </button>
        </div>

        <div class="dialogue-editor">

          <label>
            Character
            <select id="dialogueCharacter">
              ${characterOptions}
            </select>
          </label>

          <label>
            Dialogue
            <textarea
              id="dialogueText"
              rows="5"
              placeholder="Type dialogue..."
            >${this.escape(
              dialogue.text || ""
            )}</textarea>
          </label>

          <div class="dialogue-time-grid">

            <label>
              Start
              <input
                id="dialogueStart"
                type="number"
                min="0"
                step="0.1"
                value="${Number(
                  dialogue.start || 0
                )}"
              >
            </label>

            <label>
              End
              <input
                id="dialogueEnd"
                type="number"
                min="0"
                step="0.1"
                value="${Number(
                  dialogue.end || 1
                )}"
              >
            </label>

          </div>

          <label>
            Speech Bubble
            <select id="dialogueBubble">
              ${this.optionList(
                [
                  "speech",
                  "thought",
                  "shout",
                  "whisper",
                  "none"
                ],
                dialogue.bubble?.type ||
                  "speech"
              )}
            </select>
          </label>

          <label>
            Bubble Position
            <select id="dialogueBubblePosition">
              ${this.optionList(
                [
                  "above",
                  "left",
                  "right",
                  "below"
                ],
                dialogue.bubble?.position ||
                  "above"
              )}
            </select>
          </label>

          <label>
            Text Animation
            <select id="dialogueAnimation">
              ${this.optionList(
                [
                  "none",
                  "fade",
                  "pop",
                  "typewriter",
                  "slide"
                ],
                dialogue.animation ||
                  "fade"
              )}
            </select>
          </label>

          <div class="dialogue-time-grid">

            <label>
              Font Size
              <input
                id="dialogueFontSize"
                type="number"
                min="8"
                max="120"
                value="${Number(
                  dialogue.style?.size ||
                    24
                )}"
              >
            </label>

            <label>
              Font
              <select id="dialogueFont">
                ${this.optionList(
                  [
                    "Arial",
                    "Verdana",
                    "Georgia",
                    "Courier New",
                    "Trebuchet MS"
                  ],
                  dialogue.style?.font ||
                    "Arial"
                )}
              </select>
            </label>

          </div>

          <div class="dialogue-style-row">

            <label>
              <input
                id="dialogueBold"
                type="checkbox"
                ${
                  dialogue.style?.bold
                    ? "checked"
                    : ""
                }>
              Bold
            </label>

            <label>
              <input
                id="dialogueItalic"
                type="checkbox"
                ${
                  dialogue.style?.italic
                    ? "checked"
                    : ""
                }>
              Italic
            </label>

          </div>

          <div class="dialogue-position-grid">

            <label>
              X Position
              <input
                id="dialogueX"
                type="number"
                min="0"
                max="100"
                step="1"
                value="${Number(
                  dialogue.x ?? 50
                )}"
              >
            </label>

            <label>
              Y Position
              <input
                id="dialogueY"
                type="number"
                min="0"
                max="100"
                step="1"
                value="${Number(
                  dialogue.y ?? 25
                )}"
              >
            </label>

          </div>

        </div>

        <div class="modal-actions">

          <button
            class="secondary-btn"
            onclick="App.closeModal()">
            Cancel
          </button>

          <button
            class="danger-btn"
            onclick="
              Dialogue.remove(
                '${dialogue.id}'
              )">
            Delete
          </button>

          <button
            class="primary-btn"
            onclick="Dialogue.saveEditor()">
            Save Dialogue
          </button>

        </div>

      </div>
    `;

    modal.classList.add("active");
  },

  saveEditor() {
    const dialogue =
      this.get(this.editingId);

    if (!dialogue) return;

    const scene = this.getScene();

    if (!scene) return;

    const oldState =
      JSON.stringify(dialogue);

    const text =
      document.getElementById(
        "dialogueText"
      )?.value.trim();

    if (!text) {
      this.toast(
        "Dialogue cannot be empty"
      );
      return;
    }

    let start = Number(
      document.getElementById(
        "dialogueStart"
      )?.value
    );

    let end = Number(
      document.getElementById(
        "dialogueEnd"
      )?.value
    );

    if (!Number.isFinite(start)) {
      start = 0;
    }

    if (!Number.isFinite(end)) {
      end = start + 1;
    }

    if (start < 0) {
      start = 0;
    }

    if (end <= start) {
      end = start + 0.5;
    }

    const duration =
      Number(scene.duration) || 10;

    if (start > duration) {
      start = duration;
    }

    if (end > duration) {
      end = duration;
    }

    if (end <= start) {
      end = Math.min(
        duration,
        start + 0.5
      );
    }

    const updated = {
      ...dialogue,

      characterId:
        document.getElementById(
          "dialogueCharacter"
        )?.value ||
        dialogue.characterId,

      text,

      start,

      end,

      bubble: {
        ...(dialogue.bubble || {}),

        type:
          document.getElementById(
            "dialogueBubble"
          )?.value ||
          "speech",

        position:
          document.getElementById(
            "dialogueBubblePosition"
          )?.value ||
          "above"
      },

      animation:
        document.getElementById(
          "dialogueAnimation"
        )?.value ||
        "fade",

      style: {
        ...(dialogue.style || {}),

        font:
          document.getElementById(
            "dialogueFont"
          )?.value ||
          "Arial",

        size:
          Number(
            document.getElementById(
              "dialogueFontSize"
            )?.value
          ) || 24,

        bold:
          !!document.getElementById(
            "dialogueBold"
          )?.checked,

        italic:
          !!document.getElementById(
            "dialogueItalic"
          )?.checked,

        align: "center"
      },

      x:
        this.clamp(
          Number(
            document.getElementById(
              "dialogueX"
            )?.value
          ),
          0,
          100
        ),

      y:
        this.clamp(
          Number(
            document.getElementById(
              "dialogueY"
            )?.value
          ),
          0,
          100
        )
    };

    if (
      JSON.stringify(updated) !==
      oldState
    ) {
      if (
        typeof UndoRedo !== "undefined"
      ) {
        UndoRedo.saveState();
      }

      Object.assign(
        dialogue,
        updated
      );

      saveProject();
    }

    this.render();

    if (
      typeof Timeline !== "undefined"
    ) {
      Timeline.render();
    }

    if (
      typeof Editor !== "undefined"
    ) {
      Editor.render();
    }

    if (
      typeof Preview !== "undefined" &&
      Preview.render
    ) {
      Preview.render();
    }

    if (
      typeof App !== "undefined"
    ) {
      App.closeModal();
      App.toast("Dialogue saved");
    }
  },

  quickEdit(dialogue) {
    const text =
      prompt(
        "Dialogue:",
        dialogue.text || ""
      );

    if (!text) return;

    if (
      typeof UndoRedo !== "undefined"
    ) {
      UndoRedo.saveState();
    }

    dialogue.text = text;

    saveProject();

    this.render();

    if (
      typeof Timeline !== "undefined"
    ) {
      Timeline.render();
    }
  },

  remove(id) {
    const scene = this.getScene();

    if (!scene) return;

    const dialogue =
      this.get(id);

    if (!dialogue) return;

    const confirmed =
      confirm(
        "Delete this dialogue?"
      );

    if (!confirmed) return;

    if (
      typeof UndoRedo !== "undefined"
    ) {
      UndoRedo.saveState();
    }

    scene.dialogue =
      scene.dialogue.filter(
        item => item.id !== id
      );

    saveProject();

    this.render();

    if (
      typeof Timeline !== "undefined"
    ) {
      Timeline.render();
    }

    if (
      typeof Editor !== "undefined"
    ) {
      Editor.render();
    }

    if (
      typeof App !== "undefined"
    ) {
      App.closeModal();
      App.toast("Dialogue deleted");
    }
  },

  setTiming(
    id,
    start,
    end
  ) {
    const dialogue =
      this.get(id);

    if (!dialogue) return;

    const scene =
      this.getScene();

    if (!scene) return;

    const oldStart =
      dialogue.start;

    const oldEnd =
      dialogue.end;

    start = Number(start);
    end = Number(end);

    if (!Number.isFinite(start)) {
      start = oldStart || 0;
    }

    if (!Number.isFinite(end)) {
      end = oldEnd || start + 1;
    }

    if (end <= start) {
      end = start + 0.1;
    }

    const duration =
      Number(scene.duration) || 10;

    start = this.clamp(
      start,
      0,
      duration
    );

    end = this.clamp(
      end,
      start + 0.1,
      duration
    );

    if (
      start === oldStart &&
      end === oldEnd
    ) {
      return;
    }

    if (
      typeof UndoRedo !== "undefined"
    ) {
      UndoRedo.saveState();
    }

    dialogue.start = start;
    dialogue.end = end;

    saveProject();

    this.render();

    if (
      typeof Timeline !== "undefined"
    ) {
      Timeline.render();
    }
  },

  setCharacter(
    id,
    characterId
  ) {
    const dialogue =
      this.get(id);

    if (!dialogue) return;

    if (
      dialogue.characterId ===
      characterId
    ) {
      return;
    }

    if (
      typeof UndoRedo !== "undefined"
    ) {
      UndoRedo.saveState();
    }

    dialogue.characterId =
      characterId;

    saveProject();

    this.render();

    if (
      typeof Editor !== "undefined"
    ) {
      Editor.render();
    }
  },

  setBubble(
    id,
    type,
    position
  ) {
    const dialogue =
      this.get(id);

    if (!dialogue) return;

    if (
      typeof UndoRedo !== "undefined"
    ) {
      UndoRedo.saveState();
    }

    dialogue.bubble = {
      ...(dialogue.bubble || {}),
      type:
        type ||
        dialogue.bubble?.type ||
        "speech",
      position:
        position ||
        dialogue.bubble?.position ||
        "above"
    };

    saveProject();

    this.render();

    if (
      typeof Editor !== "undefined"
    ) {
      Editor.render();
    }
  },

  setVoice(
    id,
    voiceId
  ) {
    const dialogue =
      this.get(id);

    if (!dialogue) return;

    if (
      dialogue.voiceId ===
      voiceId
    ) {
      return;
    }

    if (
      typeof UndoRedo !== "undefined"
    ) {
      UndoRedo.saveState();
    }

    dialogue.voiceId =
      voiceId || null;

    saveProject();

    this.render();

    if (
      typeof Timeline !== "undefined"
    ) {
      Timeline.render();
    }
  },

  getActive(time) {
    const current =
      Number(time) || 0;

    return this.getAll().filter(
      dialogue =>
        current >=
          Number(dialogue.start || 0) &&
        current <=
          Number(dialogue.end || 0)
    );
  },

  getActiveForCharacter(
    characterId,
    time
  ) {
    return this.getActive(time)
      .filter(
        dialogue =>
          dialogue.characterId ===
          characterId
      );
  },

  renderAt(time) {
    const active =
      this.getActive(time);

    const container =
      document.getElementById(
        "dialoguePreview"
      );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    active.forEach(
      dialogue => {
        const element =
          document.createElement(
            "div"
          );

        element.className =
          "dialogue-preview-bubble";

        const bubbleType =
          dialogue.bubble?.type ||
          "speech";

        if (
          bubbleType === "none"
        ) {
          element.classList.add(
            "dialogue-no-bubble"
          );
        }

        element.classList.add(
          "bubble-" +
            this.safeClass(
              bubbleType
            )
        );

        element.style.left =
          `${Number(
            dialogue.x ?? 50
          )}%`;

        element.style.top =
          `${Number(
            dialogue.y ?? 25
          )}%`;

        element.style.fontSize =
          `${Number(
            dialogue.style?.size ||
              24
          )}px`;

        element.style.fontFamily =
          dialogue.style?.font ||
          "Arial";

        element.style.fontWeight =
          dialogue.style?.bold
            ? "700"
            : "400";

        element.style.fontStyle =
          dialogue.style?.italic
            ? "italic"
            : "normal";

        const character =
          project.characters?.find(
            item =>
              item.id ===
              dialogue.characterId
          );

        const name =
          character?.name ||
          "Character";

        element.innerHTML = `
          <div class="dialogue-character-name">
            ${this.escape(name)}
          </div>

          <div class="dialogue-text">
            ${this.escape(
              dialogue.text || ""
            )}
          </div>
        `;

        container.appendChild(
          element
        );
      }
    );
  },

  render() {
    const container =
      document.getElementById(
        "dialogueList"
      );

    if (!container) {
      return;
    }

    const dialogues =
      this.getAll();

    container.innerHTML = "";

    if (!dialogues.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>No dialogue yet</h3>
          <p>
            Add character dialogue to
            your scene.
          </p>
          <button
            class="primary-btn"
            onclick="Dialogue.add()">
            + Add Dialogue
          </button>
        </div>
      `;

      return;
    }

    dialogues
      .sort(
        (a, b) =>
          Number(a.start || 0) -
          Number(b.start || 0)
      )
      .forEach(dialogue => {
        const card =
          document.createElement("div");

        card.className =
          "dialogue-card";

        const character =
          project.characters?.find(
            item =>
              item.id ===
              dialogue.characterId
          );

        const characterName =
          character?.name ||
          "Unknown";

        card.innerHTML = `
          <div class="dialogue-icon">
            💬
          </div>

          <div class="dialogue-info">

            <h3>
              ${this.escape(
                characterName
              )}
            </h3>

            <p>
              ${this.escape(
                dialogue.text || ""
              )}
            </p>

            <small>
              ${this.formatTime(
                dialogue.start
              )}
              –
              ${this.formatTime(
                dialogue.end
              )}
            </small>

          </div>

          <div class="dialogue-actions">

            <button
              onclick="
                Dialogue.edit(
                  '${dialogue.id}'
                )">
              Edit
            </button>

            <button
              class="danger-btn"
              onclick="
                Dialogue.remove(
                  '${dialogue.id}'
                )">
              Delete
            </button>

          </div>
        `;

        container.appendChild(card);
      });
  },

  optionList(values, selected) {
    return values
      .map(value => `
        <option
          value="${this.escapeAttribute(value)}"
          ${
            value === selected
              ? "selected"
              : ""
          }>
          ${this.formatLabel(value)}
        </option>
      `)
      .join("");
  },

  formatTime(seconds) {
    const total =
      Math.max(
        0,
        Number(seconds) || 0
      );

    const minutes =
      Math.floor(total / 60);

    const secs =
      Math.floor(total % 60);

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  },

  formatLabel(value) {
    return String(value || "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, char =>
        char.toUpperCase()
      );
  },

  clamp(value, min, max) {
    if (!Number.isFinite(value)) {
      return min;
    }

    return Math.min(
      Math.max(value, min),
      max
    );
  },

  safeClass(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
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
  },

  toast(message) {
    if (
      typeof App !== "undefined" &&
      typeof App.toast === "function"
    ) {
      App.toast(message);
    } else {
      console.log(message);
    }
  }
};
