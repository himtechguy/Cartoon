const STORAGE_KEY = "cartoon_studio_project";

function createDefaultProject() {

  return {
    id: "project_1",
    name: "My Cartoon",
    format: "portrait",
    fps: 30,

    characters: [

      {
        id: "takue",
        name: "Takue",
        emoji: "🧑🏾",
        role: "Main Character",

        expressions: [
          "🙂",
          "😄",
          "😢",
          "😡",
          "😮",
          "😂"
        ],

        poses: [
          "idle",
          "walk",
          "run",
          "sit",
          "talk"
        ]

      }

    ],

    episodes: [

      {
        id: "episode_1",
        name: "Episode 1",

        scenes: [

          {
            id: "scene_1",
            name: "Scene 1",
            duration: 10,

            background: "day",

            objects: [

              {
                id: "takue_object",

                type: "character",

                characterId: "takue",

                x: 25,
                y: 60,

                scale: 1,

                rotation: 0,

                expression: "🙂",

                pose: "idle",

                keyframes: [

                  {
                    time: 0,
                    x: 25,
                    y: 60,
                    scale: 1,
                    rotation: 0,
                    expression: "🙂",
                    pose: "idle"
                  },

                  {
                    time: 3,
                    x: 55,
                    y: 60,
                    scale: 1,
                    rotation: 0,
                    expression: "😄",
                    pose: "walk"
                  },

                  {
                    time: 6,
                    x: 70,
                    y: 60,
                    scale: 1.1,
                    rotation: 0,
                    expression: "😮",
                    pose: "talk"
                  }

                ]

              }

            ],

            dialogues: [],

            audio: [],

            camera: {

              keyframes: []

            }

          }

        ]

      }

    ]

  };

}


function loadProject() {

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {

    return createDefaultProject();

  }

  try {

    return JSON.parse(saved);

  } catch {

    return createDefaultProject();

  }

}


function saveProject(project) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(project)
  );

}


let project = loadProject();
