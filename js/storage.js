const STORAGE_KEY = "cartoon_studio_project";

function createDefaultProject() {
  const takueId = "char_takue";

  return {
    id: "project_" + Date.now(),
    name: "My Cartoon",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    settings: {
      autosave: true,
      autosaveInterval: 5000,
      fps: 30,
      duration: 10,
      resolution: "1080x1920",
      audioQuality: "high",
      exportQuality: "high",
      theme: "dark"
    },

    characters: [
      {
        id: takueId,
        name: "Takue",
        appearance: {
          skin: "#8B5A3C",
          hair: "default",
          eyes: "default",
          eyebrows: "default",
          nose: "default",
          mouth: "default",
          ears: "default",
          facialHair: "none",
          clothing: "default",
          shoes: "default",
          accessories: []
        },
        body: {
          height: 1,
          width: 1
        },
        pose: "standing",
        expression: "normal",
        keyframes: []
      }
    ],

    episodes: [
      {
        id: "episode_1",
        name: "Episode 1",
        description: "",
        thumbnail: null,

        scenes: [
          {
            id: "scene_1",
            name: "Scene 1",
            duration: 10,

            background: {
              type: "color",
              color: "#18202b",
              image: null,
              weather: "none",
              lighting: "day"
            },

            objects: [
              {
                id: "obj_takue",
                type: "character",
                characterId: takueId,
                x: 50,
                y: 55,
                scale: 1,
                rotation: 0,
                opacity: 1,
                pose: "standing",
                expression: "normal",

                keyframes: [
                  {
                    id: "kf_1",
                    time: 0,
                    x: 40,
                    y: 55,
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    pose: "standing",
                    expression: "normal"
                  },
                  {
                    id: "kf_2",
                    time: 3,
                    x: 50,
                    y: 55,
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    pose: "walking",
                    expression: "normal"
                  },
                  {
                    id: "kf_3",
                    time: 6,
                    x: 60,
                    y: 55,
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    pose: "standing",
                    expression: "happy"
                  }
                ]
              }
            ],

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
      }
    ],

    assets: {
      characters: [],
      backgrounds: [],
      props: [],
      sounds: [],
      music: [],
      voices: [],
      images: []
    }
  };
}

function loadProject() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      const fresh = createDefaultProject();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid project data");
    }

    return normalizeProject(parsed);
  } catch (error) {
    console.error("Project could not be loaded:", error);

    const fresh = createDefaultProject();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));

    return fresh;
  }
}

function normalizeProject(data) {
  const fresh = createDefaultProject();

  const normalized = {
    ...fresh,
    ...data
  };

  normalized.settings = {
    ...fresh.settings,
    ...(data.settings || {})
  };

  if (!Array.isArray(normalized.characters)) {
    normalized.characters = [];
  }

  if (!Array.isArray(normalized.episodes)) {
    normalized.episodes = [];
  }

  if (!normalized.episodes.length) {
    normalized.episodes = fresh.episodes;
  }

  normalized.episodes.forEach(episode => {
    if (!Array.isArray(episode.scenes)) {
      episode.scenes = [];
    }

    episode.scenes.forEach(scene => {
      if (!Array.isArray(scene.objects)) {
        scene.objects = [];
      }

      if (!Array.isArray(scene.dialogue)) {
        scene.dialogue = [];
      }

      if (!Array.isArray(scene.titles)) {
        scene.titles = [];
      }

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

  if (!normalized.characters.some(character => character.name === "Takue")) {
    normalized.characters.unshift(
      JSON.parse(JSON.stringify(fresh.characters[0]))
    );
  }

  normalized.updatedAt = new Date().toISOString();

  return normalized;
}

function saveProject() {
  try {
    project.updatedAt = new Date().toISOString();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(project)
    );

    if (typeof HistoryManager !== "undefined") {
      HistoryManager.markSaved();
    }

    return true;
  } catch (error) {
    console.error("Project could not be saved:", error);

    if (typeof App !== "undefined" && App.toast) {
      App.toast("Could not save project");
    }

    return false;
  }
}

function resetProject() {
  const confirmed = confirm(
    "Reset Cartoon Studio? This will replace the current project."
  );

  if (!confirmed) return;

  project = createDefaultProject();
  saveProject();

  if (typeof App !== "undefined" && App.refresh) {
    App.refresh();
  }

  if (typeof App !== "undefined" && App.toast) {
    App.toast("Project reset");
  }
}

function getCurrentEpisode() {
  return project.episodes?.[0] || null;
}

function getCurrentScene() {
  const episode = getCurrentEpisode();

  if (!episode?.scenes?.length) {
    return null;
  }

  if (
    typeof Editor !== "undefined" &&
    Editor.currentSceneId
  ) {
    return (
      episode.scenes.find(
        scene => scene.id === Editor.currentSceneId
      ) || episode.scenes[0]
    );
  }

  return episode.scenes[0];
}

let project = loadProject();
