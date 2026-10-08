const Dialogue = {
  init() {},

  add(text, characterId, start = 0, end = 3) {
    const scene = Editor.getScene();

    if (!scene) return;

    if (!scene.dialogue) {
      scene.dialogue = [];
    }

    const dialogue = {
      id: "dialogue_" + Date.now(),
      characterId: characterId || null,
      text: String(text || ""),
      start: Number(start) || 0,
      end: Number(end) || 3,
      voice: null,
      bubble: "speech",
      x: 50,
      y: 25,
      fontSize: 22,
      animation: "fade"
    };

    scene.dialogue.push(dialogue);

    UndoRedo.saveState();

    saveProject();

    return dialogue;
  },

  edit(id) {
    const scene = Editor.getScene();

    if (!scene?.dialogue) return;

    const dialogue =
      scene.dialogue.find(
        item => item.id === id
      );

    if (!dialogue) return;

    const text = prompt(
      "Edit dialogue:",
      dialogue.text
    );

    if (text === null) return;

    UndoRedo.saveState();

    dialogue.text = text;

    saveProject();

    if (typeof Editor !== "undefined") {
      Editor.render();
    }
  },

  remove(id) {
    const scene = Editor.getScene();

    if (!scene?.dialogue) return;

    UndoRedo.saveState();

    scene.dialogue =
      scene.dialogue.filter(
        item => item.id !== id
      );

    saveProject();
  },

  setTiming(id, start, end) {
    const scene = Editor.getScene();

    if (!scene?.dialogue) return;

    const dialogue =
      scene.dialogue.find(
        item => item.id === id
      );

    if (!dialogue) return;

    dialogue.start =
      Number(start) || 0;

    dialogue.end =
      Math.max(
        dialogue.start,
        Number(end) || 0
      );

    saveProject();
  },

  setCharacter(id, characterId) {
    const scene = Editor.getScene();

    if (!scene?.dialogue) return;

    const dialogue =
      scene.dialogue.find(
        item => item.id === id
      );

    if (!dialogue) return;

    dialogue.characterId =
      characterId;

    saveProject();
  },

  setBubble(id, type) {
    const scene = Editor.getScene();

    if (!scene?.dialogue) return;

    const dialogue =
      scene.dialogue.find(
        item => item.id === id
      );

    if (!dialogue) return;

    dialogue.bubble = type;

    saveProject();
  },

  getActive(time) {
    const scene = Editor.getScene();

    if (!scene?.dialogue) {
      return [];
    }

    const current =
      Number(time) || 0;

    return scene.dialogue.filter(
      dialogue =>
        current >= dialogue.start &&
        current <= dialogue.end
    );
  },

  renderAt(time) {
    const active =
      this.getActive(time);

    return active;
  }
};
