const Episodes = {
  currentEpisodeId: null,

  init() {
    this.ensure();
    this.currentEpisodeId = project.episodes?.[0]?.id || null;
    this.render();
  },

  ensure() {
    if (!Array.isArray(project.episodes)) {
      project.episodes = [];
    }

    if (!project.episodes.length) {
      project.episodes.push(this.createEpisodeObject("Episode 1"));
    }

    if (!this.currentEpisodeId) {
      this.currentEpisodeId = project.episodes[0].id;
    }
  },

  createEpisodeObject(name) {
    const now = Date.now();

    return {
      id: "episode_" + now,
      name: name || "Episode",
      description: "",
      thumbnail: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      scenes: [
        {
          id: "scene_" + now,
          name: "Scene 1",
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
        }
      ]
    };
  },

  getAll() {
    this.ensure();
    return project.episodes;
  },

  get(id) {
    return this.getAll().find(episode => episode.id === id) || null;
  },

  getCurrent() {
    this.ensure();

    return (
      this.get(this.currentEpisodeId) ||
      project.episodes[0] ||
      null
    );
  },

  select(id) {
    const episode = this.get(id);

    if (!episode) return;

    this.currentEpisodeId = id;

    if (typeof Editor !== "undefined") {
      Editor.currentSceneId = episode.scenes?.[0]?.id || null;
    }

    saveProject();
    this.render();

    if (typeof Scenes !== "undefined" && Scenes.render) {
      Scenes.render();
    }

    if (typeof Editor !== "undefined") {
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }
  },

  create() {
    const name = prompt("Enter episode name:", `Episode ${project.episodes.length + 1}`);

    if (!name || !name.trim()) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const episode = this.createEpisodeObject(name.trim());

    project.episodes.push(episode);
    this.currentEpisodeId = episode.id;

    saveProject();
    this.render();

    if (typeof Scenes !== "undefined" && Scenes.render) {
      Scenes.render();
    }

    if (typeof Editor !== "undefined") {
      Editor.loadScene(episode.scenes[0].id);
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Episode created");
    }
  },

  rename(id = this.currentEpisodeId) {
    const episode = this.get(id);

    if (!episode) return;

    const name = prompt("Episode name:", episode.name);

    if (!name || !name.trim()) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    episode.name = name.trim();
    episode.updatedAt = new Date().toISOString();

    saveProject();
    this.render();

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Episode renamed");
    }
  },

  editDescription(id = this.currentEpisodeId) {
    const episode = this.get(id);

    if (!episode) return;

    const description = prompt(
      "Episode description:",
      episode.description || ""
    );

    if (description === null) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    episode.description = description;
    episode.updatedAt = new Date().toISOString();

    saveProject();
    this.render();
  },

  duplicate(id = this.currentEpisodeId) {
    const episode = this.get(id);

    if (!episode) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const copy = JSON.parse(JSON.stringify(episode));

    copy.id = "episode_" + Date.now();
    copy.name = episode.name + " Copy";
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();

    copy.scenes = (copy.scenes || []).map(scene => {
      scene.id = "scene_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

      scene.objects = (scene.objects || []).map(object => {
        object.id =
          "obj_" +
          Date.now() +
          "_" +
          Math.random().toString(36).slice(2, 7);

        if (Array.isArray(object.keyframes)) {
          object.keyframes = object.keyframes.map(keyframe => ({
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

      return scene;
    });

    project.episodes.push(copy);
    this.currentEpisodeId = copy.id;

    saveProject();
    this.render();

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Episode duplicated");
    }
  },

  remove(id = this.currentEpisodeId) {
    if (project.episodes.length <= 1) {
      alert("A project must have at least one episode.");
      return;
    }

    const episode = this.get(id);

    if (!episode) return;

    const confirmed = confirm(
      `Delete "${episode.name}"? This will delete all scenes in it.`
    );

    if (!confirmed) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    project.episodes = project.episodes.filter(
      item => item.id !== id
    );

    this.currentEpisodeId =
      project.episodes[0]?.id || null;

    saveProject();
    this.render();

    if (typeof Scenes !== "undefined" && Scenes.render) {
      Scenes.render();
    }

    if (typeof Editor !== "undefined") {
      Editor.currentSceneId =
        project.episodes[0]?.scenes?.[0]?.id || null;

      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Episode deleted");
    }
  },

  addScene(id = this.currentEpisodeId) {
    const episode = this.get(id);

    if (!episode) return;

    if (!Array.isArray(episode.scenes)) {
      episode.scenes = [];
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const sceneNumber = episode.scenes.length + 1;

    const scene = {
      id:
        "scene_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 7),

      name: `Scene ${sceneNumber}`,

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
    episode.updatedAt = new Date().toISOString();

    saveProject();

    if (typeof Editor !== "undefined") {
      Editor.currentSceneId = scene.id;
    }

    this.render();

    if (typeof Scenes !== "undefined" && Scenes.render) {
      Scenes.render();
    }

    if (typeof Editor !== "undefined") {
      Editor.render();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.render();
    }

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Scene added");
    }

    return scene;
  },

  saveCurrent() {
    const episode = this.getCurrent();

    if (!episode) return;

    episode.updatedAt = new Date().toISOString();

    saveProject();

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Episode saved");
    }
  },

  getDuration(id = this.currentEpisodeId) {
    const episode = this.get(id);

    if (!episode) return 0;

    return (episode.scenes || []).reduce(
      (total, scene) =>
        total + Math.max(0, Number(scene.duration) || 0),
      0
    );
  },

  getSceneCount(id = this.currentEpisodeId) {
    const episode = this.get(id);

    return episode?.scenes?.length || 0;
  },

  render() {
    const list = document.getElementById("episodeList");

    if (!list) return;

    this.ensure();

    list.innerHTML = "";

    project.episodes.forEach(episode => {
      const card = document.createElement("div");

      card.className =
        "episode-card" +
        (episode.id === this.currentEpisodeId
          ? " active"
          : "");

      const sceneCount = this.getSceneCount(episode.id);
      const duration = this.getDuration(episode.id);

      card.innerHTML = `
        <div class="episode-thumbnail">
          🎬
        </div>

        <div class="episode-info">
          <h3>${this.escape(episode.name)}</h3>

          <p>
            ${this.escape(
              episode.description || "No description"
            )}
          </p>

          <div class="episode-meta">
            ${sceneCount} scene${sceneCount === 1 ? "" : "s"}
            · ${this.formatTime(duration)}
          </div>
        </div>

        <div class="episode-actions">
          <button onclick="Episodes.select('${episode.id}')">
            Open
          </button>

          <button onclick="Episodes.rename('${episode.id}')">
            Rename
          </button>

          <button onclick="Episodes.duplicate('${episode.id}')">
            Duplicate
          </button>

          <button
            class="danger-btn"
            onclick="Episodes.remove('${episode.id}')"
          >
            Delete
          </button>
        </div>
      `;

      list.appendChild(card);
    });

    this.renderEditor();
  },

  renderEditor() {
    const episode = this.getCurrent();

    if (!episode) return;

    const nameInput = document.getElementById("episodeName");

    if (nameInput) {
      nameInput.value = episode.name || "";
    }

    const descriptionInput =
      document.getElementById("episodeDescription");

    if (descriptionInput) {
      descriptionInput.value = episode.description || "";
    }

    const sceneCount =
      document.getElementById("episodeSceneCount");

    if (sceneCount) {
      sceneCount.textContent =
        this.getSceneCount(episode.id);
    }

    const duration =
      document.getElementById("episodeDuration");

    if (duration) {
      duration.textContent =
        this.formatTime(this.getDuration(episode.id));
    }

    const episodeCount =
      document.getElementById("episodeCount");

    if (episodeCount) {
      episodeCount.textContent =
        project.episodes.length;
    }
  },

  updateCurrentName(value) {
    const episode = this.getCurrent();

    if (!episode) return;

    if (!String(value).trim()) return;

    episode.name = String(value).trim();
    episode.updatedAt = new Date().toISOString();

    saveProject();
    this.render();
  },

  updateCurrentDescription(value) {
    const episode = this.getCurrent();

    if (!episode) return;

    episode.description = String(value || "");
    episode.updatedAt = new Date().toISOString();

    saveProject();
  },

  formatTime(seconds) {
    const value = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes = Math.floor(value / 60);
    const secs = Math.floor(value % 60);

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
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
