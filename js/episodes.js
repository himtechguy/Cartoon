const Episodes = {
  init() {
    this.ensureEpisode();
  },

  ensureEpisode() {
    if (!project.episodes) {
      project.episodes = [];
    }

    if (!project.episodes.length) {
      project.episodes.push(
        this.createEpisodeObject(
          "Episode 1"
        )
      );

      saveProject();
    }
  },

  createEpisodeObject(name) {
    return {
      id:
        "episode_" +
        Date.now(),

      name:
        name || "Episode",

      description:
        "",

      thumbnail:
        null,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

      scenes: [
        {
          id:
            "scene_" +
            Date.now(),

          name:
            "Scene 1",

          duration:
            Number(
              project.settings?.duration
            ) || 10,

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
        }
      ]
    };
  },

  getAll() {
    return project.episodes || [];
  },

  get(id) {
    return this.getAll().find(
      episode =>
        episode.id === id
    );
  },

  getCurrent() {
    return (
      this.getAll()[0] ||
      null
    );
  },

  create() {
    const name =
      prompt(
        "Episode name:",
        `Episode ${
          this.getAll().length + 1
        }`
      );

    if (
      !name ||
      !name.trim()
    ) {
      return;
    }

    UndoRedo.saveState();

    const episode =
      this.createEpisodeObject(
        name.trim()
      );

    project.episodes.push(
      episode
    );

    saveProject();

    App.toast(
      "Episode created"
    );

    return episode;
  },

  rename(id) {
    const episode =
      this.get(id);

    if (!episode) return;

    const name =
      prompt(
        "Episode name:",
        episode.name
      );

    if (
      !name ||
      !name.trim()
    ) {
      return;
    }

    UndoRedo.saveState();

    episode.name =
      name.trim();

    episode.updatedAt =
      new Date().toISOString();

    saveProject();

    if (
      typeof Projects !==
      "undefined"
    ) {
      Projects.render();
    }

    App.toast(
      "Episode renamed"
    );
  },

  editDescription(id) {
    const episode =
      this.get(id);

    if (!episode) return;

    const description =
      prompt(
        "Episode description:",
        episode.description || ""
      );

    if (
      description === null
    ) {
      return;
    }

    UndoRedo.saveState();

    episode.description =
      description;

    episode.updatedAt =
      new Date().toISOString();

    saveProject();
  },

  duplicate(id) {
    const original =
      this.get(id);

    if (!original) return;

    UndoRedo.saveState();

    const copy =
      JSON.parse(
        JSON.stringify(
          original
        )
      );

    copy.id =
      "episode_" +
      Date.now();

    copy.name =
      `${original.name} Copy`;

    copy.createdAt =
      new Date().toISOString();

    copy.updatedAt =
      new Date().toISOString();

    copy.scenes =
      (copy.scenes || []).map(
        scene => ({
          ...scene,
          id:
            "scene_" +
            Date.now() +
            "_" +
            Math.random()
              .toString(36)
              .slice(2, 7)
        })
      );

    project.episodes.push(
      copy
    );

    saveProject();

    App.toast(
      "Episode duplicated"
    );

    return copy;
  },

  remove(id) {
    if (
      project.episodes.length <= 1
    ) {
      alert(
        "A project must have at least one episode."
      );

      return;
    }

    const episode =
      this.get(id);

    if (!episode) return;

    const confirmed =
      confirm(
        `Delete "${episode.name}"?`
      );

    if (!confirmed) {
      return;
    }

    UndoRedo.saveState();

    project.episodes =
      project.episodes.filter(
        item =>
          item.id !== id
      );

    saveProject();

    const firstEpisode =
      project.episodes[0];

    if (
      firstEpisode?.scenes?.length
    ) {
      Editor.currentSceneId =
        firstEpisode.scenes[0].id;

      Editor.loadScene();
    }

    App.toast(
      "Episode deleted"
    );
  },

  addScene(episodeId) {
    const episode =
      this.get(episodeId);

    if (!episode) return;

    const name =
      prompt(
        "Scene name:",
        `Scene ${
          episode.scenes.length + 1
        }`
      );

    if (
      !name ||
      !name.trim()
    ) {
      return;
    }

    UndoRedo.saveState();

    const scene = {
      id:
        "scene_" +
        Date.now(),

      name:
        name.trim(),

      duration:
        Number(
          project.settings?.duration
        ) || 10,

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

    episode.scenes.push(
      scene
    );

    episode.updatedAt =
      new Date().toISOString();

    saveProject();

    Editor.currentSceneId =
      scene.id;

    Editor.loadScene();

    App.toast(
      "Scene added"
    );

    return scene;
  },

  getDuration(id) {
    const episode =
      this.get(id);

    if (!episode) return 0;

    return (
      episode.scenes || []
    ).reduce(
      (total, scene) =>
        total +
        (
          Number(
            scene.duration
          ) || 0
        ),
      0
    );
  },

  getSceneCount(id) {
    const episode =
      this.get(id);

    return episode?.scenes?.length || 0;
  }
};
