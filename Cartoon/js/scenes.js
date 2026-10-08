const Scenes = {
  currentSceneId: null,

  init() {
    this.ensureStructure();

    const episode = this.getEpisode();

    if (episode?.scenes?.length) {
      this.currentSceneId =
        this.currentSceneId || episode.scenes[0].id;
    }

    this.render();
  },

  ensureStructure() {
    if (!project.episodes) {
      project.episodes = [];
    }

    if (!project.episodes.length) {
      project.episodes = [{
        id: "episode_1",
        name: "Episode 1",
        description: "",
        scenes: []
      }];
    }

    project.episodes.forEach(episode => {
      if (!Array.isArray(episode.scenes)) {
        episode.scenes = [];
      }

      episode.scenes.forEach(scene => {
        if (!Array.isArray(scene.objects)) scene.objects = [];
        if (!Array.isArray(scene.dialogue)) scene.dialogue = [];
        if (!Array.isArray(scene.titles)) scene.titles = [];

        if (!scene.background) {
          scene.background = {
            type: "color",
            color: "#18202b",
            image: null,
            weather: "none",
            lighting: "day"
          };
        }

        if (!scene.camera) {
          scene.camera = {
            x: 50,
            y: 50,
            zoom: 1,
            rotation: 0,
            keyframes: []
          };
        }

        if (!Array.isArray(scene.camera.keyframes)) {
          scene.camera.keyframes = [];
        }

        if (!scene.audio) {
          scene.audio = {
            tracks: []
          };
        }
      });
    });
  },

  getEpisode() {
    if (
      typeof Episodes !== "undefined" &&
      Episodes.getCurrent
    ) {
      return Episodes.getCurrent();
    }

    return project.episodes?.[0] || null;
  },

  getCurrent() {
    const episode = this.getEpisode();

    if (!episode?.scenes?.length) {
      return null;
    }

    return (
      episode.scenes.find(
        scene => scene.id === this.currentSceneId
      ) ||
      episode.scenes[0]
    );
  },

  create() {
    const episode = this.getEpisode();

    if (!episode) {
      alert("Create an episode first.");
      return;
    }

    if (!Array.isArray(episode.scenes)) {
      episode.scenes = [];
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const number = episode.scenes.length + 1;

    const scene = {
      id:
        "scene_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 7),

      name: `Scene ${number}`,

      duration: 10,

      background: {
        type: "color",
        color: "#18202b",
        image: null,
        weather: "none",
        lighting: "day"
      },

      objects: [],

      dialogue: [],

      titles: [],

      camera: {
        x: 50,
        y: 50,
        zoom: 1,
        rotation: 0,
        keyframes: []
      },

      audio: {
        tracks: []
      }
    };

    episode.scenes.push(scene);

    this.currentSceneId = scene.id;

    saveProject();

    this.render();

    if (typeof Editor !== "undefined") {
      Editor.currentSceneId = scene.id;
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Scene created");
    }

    return scene;
  },

  select(id) {
    const episode = this.getEpisode();

    if (!episode) return;

    const scene = episode.scenes.find(
      item => item.id === id
    );

    if (!scene) return;

    this.currentSceneId = id;

    if (typeof Editor !== "undefined") {
      Editor.currentSceneId = id;
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.currentTime = 0;
      Timeline.render();
    }

    this.render();
  },

  rename(id = this.currentSceneId) {
    const scene = this.find(id);

    if (!scene) return;

    const name = prompt(
      "Scene name:",
      scene.name || "Scene"
    );

    if (!name || !name.trim()) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    scene.name = name.trim();

    saveProject();
    this.render();

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Scene renamed");
    }
  },

  duplicate(id = this.currentSceneId) {
    const episode = this.getEpisode();

    if (!episode) return;

    const scene = this.find(id);

    if (!scene) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const copy = JSON.parse(
      JSON.stringify(scene)
    );

    copy.id =
      "scene_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 7);

    copy.name = scene.name + " Copy";

    copy.objects = (copy.objects || []).map(object => {
      object.id =
        "obj_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 7);

      if (Array.isArray(object.keyframes)) {
        object.keyframes =
          object.keyframes.map(keyframe => ({
            ...keyframe,
            id:
              "kf_" +
              Date.now() +
              "_" +
              Math.random().toString(36).slice(2, 7)
          }));
      }

      return object;
    });

    episode.scenes.push(copy);

    this.currentSceneId = copy.id;

    saveProject();
    this.render();

    if (typeof Editor !== "undefined") {
      Editor.currentSceneId = copy.id;
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Scene duplicated");
    }
  },

  remove(id = this.currentSceneId) {
    const episode = this.getEpisode();

    if (!episode) return;

    if (episode.scenes.length <= 1) {
      alert("An episode must have at least one scene.");
      return;
    }

    const scene = this.find(id);

    if (!scene) return;

    const confirmed = confirm(
      `Delete "${scene.name}"?`
    );

    if (!confirmed) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    episode.scenes =
      episode.scenes.filter(
        item => item.id !== id
      );

    this.currentSceneId =
      episode.scenes[0]?.id || null;

    saveProject();
    this.render();

    if (typeof Editor !== "undefined") {
      Editor.currentSceneId =
        this.currentSceneId;

      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Scene deleted");
    }
  },

  find(id) {
    const episode = this.getEpisode();

    if (!episode) return null;

    return (
      episode.scenes?.find(
        scene => scene.id === id
      ) || null
    );
  },

  addObject(object) {
    const scene = this.getCurrent();

    if (!scene || !object) return;

    if (!Array.isArray(scene.objects)) {
      scene.objects = [];
    }

    if (!object.id) {
      object.id =
        "obj_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 7);
    }

    scene.objects.push(object);

    saveProject();

    if (typeof Editor !== "undefined") {
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    return object;
  },

  setBackground(type, value) {
    const scene = this.getCurrent();

    if (!scene) return;

    if (!scene.background) {
      scene.background = {
        type: "color",
        color: "#18202b",
        image: null,
        weather: "none",
        lighting: "day"
      };
    }

    if (type === "color") {
      scene.background.type = "color";
      scene.background.color =
        value || "#18202b";
    }

    if (type === "image") {
      scene.background.type = "image";
      scene.background.image =
        value || null;
    }

    saveProject();

    this.render();

    if (typeof Editor !== "undefined") {
      Editor.render();
    }
  },

  setWeather(weather) {
    const scene = this.getCurrent();

    if (!scene) return;

    scene.background =
      scene.background || {};

    scene.background.weather =
      weather || "none";

    saveProject();

    if (typeof Editor !== "undefined") {
      Editor.render();
    }
  },

  setLighting(lighting) {
    const scene = this.getCurrent();

    if (!scene) return;

    scene.background =
      scene.background || {};

    scene.background.lighting =
      lighting || "day";

    saveProject();

    if (typeof Editor !== "undefined") {
      Editor.render();
    }
  },

  setDuration(value) {
    const scene = this.getCurrent();

    if (!scene) return;

    const duration = Math.max(
      1,
      Number(value) || 10
    );

    scene.duration = duration;

    saveProject();

    if (typeof Timeline !== "undefined") {
      Timeline.duration = duration;
      Timeline.render();
    }

    this.render();
  },

  render() {
    const list =
      document.getElementById("sceneList");

    if (!list) return;

    this.ensureStructure();

    const episode = this.getEpisode();

    list.innerHTML = "";

    if (!episode?.scenes?.length) {
      list.innerHTML = `
        <div class="asset-empty">
          <strong>No scenes yet</strong>
          <p>Create a scene to start building your episode.</p>
        </div>
      `;
      return;
    }

    episode.scenes.forEach(scene => {
      const card =
        document.createElement("div");

      card.className =
        "scene-card" +
        (
          scene.id === this.currentSceneId
            ? " active"
            : ""
        );

      const objectCount =
        scene.objects?.length || 0;

      card.innerHTML = `
        <div class="scene-thumbnail">
          🎬
        </div>

        <h4>
          ${this.escape(scene.name)}
        </h4>

        <p>
          ${this.formatTime(scene.duration)}
          · ${objectCount} object${objectCount === 1 ? "" : "s"}
        </p>

        <div class="scene-card-actions">

          <button
            onclick="Scenes.select('${scene.id}')"
          >
            Open
          </button>

          <button
            onclick="Scenes.rename('${scene.id}')"
          >
            Rename
          </button>

          <button
            onclick="Scenes.duplicate('${scene.id}')"
          >
            Copy
          </button>

          <button
            class="danger-btn"
            onclick="Scenes.remove('${scene.id}')"
          >
            Delete
          </button>

        </div>
      `;

      list.appendChild(card);
    });

    this.renderSettings();
  },

  renderSettings() {
    const scene = this.getCurrent();

    if (!scene) return;

    const nameInput =
      document.getElementById("sceneName");

    if (nameInput) {
      nameInput.value =
        scene.name || "";
    }

    const durationInput =
      document.getElementById("sceneDuration");

    if (durationInput) {
      durationInput.value =
        scene.duration || 10;
    }

    const weather =
      document.getElementById("sceneWeather");

    if (weather) {
      weather.value =
        scene.background?.weather ||
        "none";
    }

    const lighting =
      document.getElementById("sceneLighting");

    if (lighting) {
      lighting.value =
        scene.background?.lighting ||
        "day";
    }
  },

  escape(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  formatTime(seconds) {
    const value = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes =
      Math.floor(value / 60);

    const secs =
      Math.floor(value % 60);

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  }
};
