const ExportManager = {
  init() {
    this.bindInputs();
  },

  bindInputs() {
    const input = document.querySelector("#projectImport");

    if (!input || input.dataset.exportBound === "true") {
      return;
    }

    input.dataset.exportBound = "true";

    input.addEventListener("change", async event => {
      const file = event.target.files?.[0];

      if (!file) return;

      await this.importProject(file);

      event.target.value = "";
    });
  },

  exportProject() {
    if (typeof project === "undefined") {
      this.toast("No project available");
      return;
    }

    try {
      const backup = {
        format: "cartoon-studio-project",
        version: 2,
        exportedAt: new Date().toISOString(),
        project: JSON.parse(
          JSON.stringify(project)
        )
      };

      const json = JSON.stringify(
        backup,
        null,
        2
      );

      const blob = new Blob(
        [json],
        {
          type: "application/json"
        }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        this.safeFileName(
          project.name || "cartoon-project"
        ) + ".tkproject";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      this.toast("Project backup exported");
    } catch (error) {
      console.error(
        "Project export failed:",
        error
      );

      this.toast("Could not export project");
    }
  },

  async importProject(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const importedProject =
        data?.project || data;

      if (
        !importedProject ||
        typeof importedProject !== "object"
      ) {
        throw new Error(
          "Invalid project structure"
        );
      }

      if (
        !Array.isArray(
          importedProject.episodes
        )
      ) {
        throw new Error(
          "Project has no episodes"
        );
      }

      if (
        !Array.isArray(
          importedProject.characters
        )
      ) {
        importedProject.characters = [];
      }

      if (
        !importedProject.settings ||
        typeof importedProject.settings !== "object"
      ) {
        importedProject.settings = {};
      }

      if (
        !importedProject.assets ||
        typeof importedProject.assets !== "object"
      ) {
        importedProject.assets = {
          characters: [],
          backgrounds: [],
          props: [],
          sounds: [],
          music: [],
          voices: [],
          images: []
        };
      }

      const confirmed = confirm(
        "Import this project and replace the current project?"
      );

      if (!confirmed) {
        return;
      }

      if (typeof UndoRedo !== "undefined") {
        UndoRedo.saveState();
      }

      if (
        typeof normalizeProject === "function"
      ) {
        project = normalizeProject(
          importedProject
        );
      } else {
        project = importedProject;
      }

      if (typeof saveProject === "function") {
        saveProject();
      }

      if (
        typeof Editor !== "undefined" &&
        typeof Editor.currentSceneId !== "undefined"
      ) {
        Editor.currentSceneId = null;
      }

      if (
        typeof App !== "undefined" &&
        typeof App.refresh === "function"
      ) {
        App.refresh();
      }

      if (
        typeof App !== "undefined" &&
        typeof App.navigate === "function"
      ) {
        App.navigate("projects");
      }

      this.toast("Project restored successfully");
    } catch (error) {
      console.error(
        "Project import failed:",
        error
      );

      this.toast(
        "Invalid or damaged project file"
      );
    }
  },

  exportScene() {
    const scene = this.getCurrentScene();

    if (!scene) {
      this.toast("Open a scene first");
      return;
    }

    const data = {
      format: "cartoon-studio-scene",
      version: 1,
      exportedAt: new Date().toISOString(),
      scene: JSON.parse(
        JSON.stringify(scene)
      )
    };

    this.downloadJSON(
      data,
      this.safeFileName(
        scene.name || "scene"
      ) + ".tkscene"
    );

    this.toast("Scene exported");
  },

  importScene(file) {
    if (!file) return;

    file.text()
      .then(text => {
        const data = JSON.parse(text);
        const importedScene =
          data?.scene || data;

        if (
          !importedScene ||
          typeof importedScene !== "object"
        ) {
          throw new Error(
            "Invalid scene"
          );
        }

        const episode =
          this.getCurrentEpisode();

        if (!episode) {
          throw new Error(
            "No episode available"
          );
        }

        if (!Array.isArray(episode.scenes)) {
          episode.scenes = [];
        }

        if (typeof UndoRedo !== "undefined") {
          UndoRedo.saveState();
        }

        importedScene.id =
          "scene_" +
          Date.now();

        episode.scenes.push(
          importedScene
        );

        if (
          typeof saveProject === "function"
        ) {
          saveProject();
        }

        if (
          typeof App !== "undefined" &&
          typeof App.refresh === "function"
        ) {
          App.refresh();
        }

        this.toast(
          "Scene imported"
        );
      })
      .catch(error => {
        console.error(
          "Scene import failed:",
          error
        );

        this.toast(
          "Could not import scene"
        );
      });
  },

  exportEpisode() {
    const episode =
      this.getCurrentEpisode();

    if (!episode) {
      this.toast("No episode available");
      return;
    }

    const data = {
      format: "cartoon-studio-episode",
      version: 1,
      exportedAt: new Date().toISOString(),
      episode: JSON.parse(
        JSON.stringify(episode)
      )
    };

    this.downloadJSON(
      data,
      this.safeFileName(
        episode.name || "episode"
      ) + ".tkepisode"
    );

    this.toast("Episode exported");
  },

  exportSettings() {
    const settings =
      typeof StudioSettings !== "undefined" &&
      typeof StudioSettings.getExportSettings === "function"
        ? StudioSettings.getExportSettings()
        : {
            resolution: "1080x1920",
            fps: 30,
            audioQuality: "high",
            exportQuality: "high"
          };

    return {
      ...settings,
      width: this.getResolution(
        settings.resolution
      ).width,
      height: this.getResolution(
        settings.resolution
      ).height
    };
  },

  getResolution(value) {
    const resolutions = {
      "1080x1920": {
        width: 1080,
        height: 1920
      },

      "1920x1080": {
        width: 1920,
        height: 1080
      },

      "1080x1080": {
        width: 1080,
        height: 1080
      },

      "720x1280": {
        width: 720,
        height: 1280
      },

      "1280x720": {
        width: 1280,
        height: 720
      },

      "720x720": {
        width: 720,
        height: 720
      }
    };

    return (
      resolutions[value] ||
      resolutions["1080x1920"]
    );
  },

  async exportVideo(options = {}) {
    const settings = {
      ...this.exportSettings(),
      ...options
    };

    const episode =
      this.getCurrentEpisode();

    if (!episode) {
      this.toast("No episode available");
      return null;
    }

    if (
      typeof MediaRecorder === "undefined"
    ) {
      this.toast(
        "Video recording is not supported on this browser"
      );

      return null;
    }

    const canvas =
      this.createExportCanvas(
        settings.width,
        settings.height
      );

    if (!canvas) {
      this.toast(
        "Could not create export canvas"
      );

      return null;
    }

    const stream =
      canvas.captureStream(
        Number(settings.fps) || 30
      );

    const mimeType =
      this.getSupportedMimeType();

    if (!mimeType) {
      this.toast(
        "This browser cannot create a supported video file"
      );

      return null;
    }

    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType
        }
      );

    const chunks = [];

    recorder.ondataavailable = event => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    };

    const stopped =
      new Promise(resolve => {
        recorder.onstop = () => {
          resolve();
        };
      });

    recorder.start(250);

    const fps =
      Number(settings.fps) || 30;

    const totalDuration =
      this.getEpisodeDuration(
        episode
      );

    const start =
      performance.now();

    const drawFrame = now => {
      const elapsed =
        (now - start) / 1000;

      this.drawExportFrame(
        canvas,
        episode,
        elapsed
      );

      if (
        elapsed < totalDuration &&
        recorder.state === "recording"
      ) {
        requestAnimationFrame(
          drawFrame
        );
      } else {
        recorder.stop();
      }
    };

    requestAnimationFrame(drawFrame);

    await stopped;

    const blob = new Blob(
      chunks,
      {
        type: mimeType
      }
    );

    const extension =
      mimeType.includes("webm")
        ? "webm"
        : "mp4";

    const filename =
      this.safeFileName(
        episode.name || "cartoon"
      ) +
      "." +
      extension;

    this.downloadBlob(
      blob,
      filename
    );

    this.toast(
      `Video exported as ${extension.toUpperCase()}`
    );

    return blob;
  },

  createExportCanvas(
    width,
    height
  ) {
    const canvas =
      document.createElement("canvas");

    canvas.width =
      Number(width) || 1080;

    canvas.height =
      Number(height) || 1920;

    return canvas;
  },

  drawExportFrame(
    canvas,
    episode,
    time
  ) {
    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    const sceneInfo =
      this.getSceneAtTime(
        episode,
        time
      );

    const scene =
      sceneInfo?.scene;

    if (!scene) {
      ctx.fillStyle = "#111827";
      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
      return;
    }

    const background =
      scene.background || {};

    ctx.fillStyle =
      background.color || "#18202b";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (
      background.image
    ) {
      const image =
        new Image();

      image.onload = () => {
        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );
      };

      image.src =
        background.image;
    }

    const localTime =
      sceneInfo.localTime;

    const objects =
      Array.isArray(scene.objects)
        ? scene.objects
        : [];

    objects.forEach(object => {
      this.drawExportObject(
        ctx,
        object,
        localTime,
        canvas
      );
    });

    this.drawExportDialogue(
      ctx,
      scene,
      localTime,
      canvas
    );

    this.drawExportTitles(
      ctx,
      scene,
      localTime,
      canvas
    );
  },

  drawExportObject(
    ctx,
    object,
    time,
    canvas
  ) {
    let state = {
      ...object
    };

    if (
      Array.isArray(object.keyframes) &&
      object.keyframes.length
    ) {
      if (
        typeof Animation !== "undefined" &&
        typeof Animation.getStateAt === "function"
      ) {
        const animated =
          Animation.getStateAt(
            object.keyframes,
            time
          );

        if (animated) {
          state = {
            ...state,
            ...animated
          };
        }
      }
    }

    const x =
      (
        Number(state.x ?? 50) / 100
      ) * canvas.width;

    const y =
      (
        Number(state.y ?? 50) / 100
      ) * canvas.height;

    const scale =
      Number(state.scale ?? 1);

    const rotation =
      (
        Number(state.rotation ?? 0) *
        Math.PI
      ) / 180;

    const opacity =
      Number(state.opacity ?? 1);

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(
      scale,
      scale
    );

    ctx.globalAlpha =
      opacity;

    if (
      object.type === "character"
    ) {
      ctx.font =
        "96px sans-serif";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillText(
        this.getCharacterEmoji(
          state.expression,
          state.pose
        ),
        0,
        0
      );
    } else if (
      object.type === "prop"
    ) {
      ctx.font =
        "80px sans-serif";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillText(
        this.getPropIcon(
          state.name ||
          state.propName
        ),
        0,
        0
      );
    }

    ctx.restore();
  },

  drawExportDialogue(
    ctx,
    scene,
    time,
    canvas
  ) {
    const dialogue =
      Array.isArray(scene.dialogue)
        ? scene.dialogue
        : [];

    dialogue
      .filter(item => {
        const start =
          Number(item.start) || 0;

        const end =
          item.end == null
            ? start + 3
            : Number(item.end);

        return (
          time >= start &&
          time <= end
        );
      })
      .forEach(item => {
        const x =
          (
            Number(item.x ?? 50) /
            100
          ) * canvas.width;

        const y =
          (
            Number(item.y ?? 20) /
            100
          ) * canvas.height;

        ctx.save();

        ctx.fillStyle =
          "rgba(0,0,0,0.72)";

        ctx.font =
          "32px sans-serif";

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "middle";

        const text =
          String(
            item.text || ""
          );

        const padding = 24;

        const width =
          Math.min(
            canvas.width * 0.8,
            ctx.measureText(text).width +
              padding * 2
          );

        ctx.fillRect(
          x - width / 2,
          y - 35,
          width,
          70
        );

        ctx.fillStyle =
          "#ffffff";

        ctx.fillText(
          text,
          x,
          y
        );

        ctx.restore();
      });
  },

  drawExportTitles(
    ctx,
    scene,
    time,
    canvas
  ) {
    const titles =
      Array.isArray(scene.titles)
        ? scene.titles
        : [];

    titles
      .filter(item => {
        const start =
          Number(item.start) || 0;

        const end =
          item.end == null
            ? start + 3
            : Number(item.end);

        return (
          time >= start &&
          time <= end
        );
      })
      .forEach(item => {
        const x =
          (
            Number(item.x ?? 50) /
            100
          ) * canvas.width;

        const y =
          (
            Number(item.y ?? 10) /
            100
          ) * canvas.height;

        ctx.save();

        ctx.fillStyle =
          item.color ||
          "#ffffff";

        ctx.font =
          `${item.bold ? "700" : "400"} ` +
          `${Number(item.size || 48)}px sans-serif`;

        ctx.textAlign =
          item.align || "center";

        ctx.fillText(
          String(item.text || ""),
          x,
          y
        );

        ctx.restore();
      });
  },

  getSceneAtTime(
    episode,
    time
  ) {
    let elapsed = 0;

    for (const scene of episode.scenes || []) {
      const duration =
        Number(scene.duration) || 0;

      if (
        time >= elapsed &&
        time <= elapsed + duration
      ) {
        return {
          scene,
          localTime:
            time - elapsed
        };
      }

      elapsed += duration;
    }

    const last =
      episode.scenes?.[
        episode.scenes.length - 1
      ];

    if (!last) return null;

    return {
      scene: last,
      localTime:
        Number(last.duration) || 0
    };
  },

  getEpisodeDuration(
    episode
  ) {
    return (episode.scenes || [])
      .reduce(
        (total, scene) =>
          total +
          (
            Number(scene.duration) ||
            0
          ),
        0
      );
  },

  getSupportedMimeType() {
    const types = [
      "video/mp4;codecs=h264",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];

    return (
      types.find(type =>
        MediaRecorder.isTypeSupported(type)
      ) || null
    );
  },

  downloadJSON(
    data,
    filename
  ) {
    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          )
        ],
        {
          type: "application/json"
        }
      );

    this.downloadBlob(
      blob,
      filename
    );
  },

  download
