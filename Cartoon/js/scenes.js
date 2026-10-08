const Scenes = {
  init() {
    this.ensureStructure();
  },

  ensureStructure() {
    if (!project.episodes) project.episodes = [];

    if (!project.episodes.length) {
      project.episodes.push({
        id: "episode_" + Date.now(),
        name: "Episode 1",
        description: "",
        scenes: []
      });
    }

    project.episodes.forEach(episode => {
      if (!episode.scenes) episode.scenes = [];

      episode.scenes.forEach(scene => {
        if (!scene.objects) scene.objects = [];

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

        if (!scene.dialogue) scene.dialogue = [];
      });
    });

    saveProject();
  },

  getEpisode() {
    return project.episodes?.[0] || null;
  },

  getCurrent() {
    const episode = this.getEpisode();
    if (!episode?.scenes?.length) return null;

    const currentId = Editor.currentSceneId;

    return (
      episode.scenes.find(scene => scene.id === currentId) ||
      episode.scenes[0]
    );
  },

  create() {
    const episode = this.getEpisode();

    if (!episode) {
      alert("Create an episode first.");
      return;
    }

    const name = prompt(
      "Scene name:",
      `Scene ${episode.scenes.length + 1}`
    );

    if (!name || !name.trim()) return;

    UndoRedo.saveState();

    const scene = {
      id: "scene_" + Date.now(),

      name: name.trim(),

      duration: Number(project.settings?.duration) || 10,

      background: {
        type: "color",
        color: "#18202b",
        image: null,
        weather: "none",
        lighting: "day"
      },

      objects: [],

      dialogue: [],

      camera: {
        x: 50,
        y: 50,
        zoom: 1,
        rotation: 0,
        keyframes: []
      }
    };

    episode.scenes.push(scene);

    saveProject();

    Editor.currentSceneId = scene.id;

    if (typeof Editor.loadScene === "function") {
      Editor.loadScene();
    }

    if (typeof Timeline !== "undefined") {
      Timeline.currentTime = 0;
      Timeline.render();
    }

    App.toast("Scene created");
  },

  rename(id) {
    const episode = this.getEpisode();

    if (!episode) return;

    const scene =
      episode.scenes.find(item => item.id === id) ||
      this.getCurrent();

    if (!scene) return;

    const name = prompt("Scene name:", scene.name || "Scene");

    if (!name || !name.trim()) return;

    UndoRedo.saveState();

    scene.name = name.trim();

    saveProject();

    Editor.loadScene();

    App.toast("Scene renamed");
  },

  duplicate(id) {
    const episode = this.getEpisode();

    if (!episode) return;

    const original =
      episode.scenes.find(item => item.id === id) ||
      this.getCurrent();

    if (!original) return;

    UndoRedo.saveState();

    const copy = JSON.parse(JSON.stringify(original));

    copy.id = "scene_" + Date.now();

    copy.name =
      (original.name || "Scene") + " Copy";

    episode.scenes.push(copy);

    saveProject();

    Editor.currentSceneId = copy.id;
    Editor.loadScene();

    App.toast("Scene duplicated");
  },

  remove(id) {
    const episode = this.getEpisode();

    if (!episode || episode.scenes.length <= 1) {
      alert("A project must have at least one scene.");
      return;
    }

    const scene =
      episode.scenes.find(item => item.id === id) ||
      this.getCurrent();

    if (!scene) return;

    const confirmed = confirm(
      `Delete "${scene.name || "Scene"}"?`
    );

    if (!confirmed) return;

    UndoRedo.saveState();

    episode.scenes = episode.scenes.filter(
      item => item.id !== scene.id
    );

    saveProject();

    Editor.currentSceneId =
      episode.scenes[0].id;

    Editor.loadScene();

    App.toast("Scene deleted");
  },

  addObject(object) {
    const scene = this.getCurrent();

    if (!scene) return null;

    if (!scene.objects) {
      scene.objects = [];
    }

    UndoRedo.saveState();

    scene.objects.push(object);

    saveProject();

    return object;
  },

  setBackground(color) {
    const scene = this.getCurrent();

    if (!scene) return;

    UndoRedo.saveState();

    if (!scene.background) {
      scene.background = {};
    }

    scene.background.type = "color";
    scene.background.color = color;

    saveProject();

    Editor.render();

    App.toast("Background updated");
  },

  setWeather(weather) {
    const scene = this.getCurrent();

    if (!scene) return;

    if (!scene.background) {
      scene.background = {};
    }

    scene.background.weather = weather;

    saveProject();

    Editor.render();
  },

  setLighting(lighting) {
    const scene = this.getCurrent();

    if (!scene) return;

    if (!scene.background) {
      scene.background = {};
    }

    scene.background.lighting = lighting;

    saveProject();

    Editor.render();
  }
};
