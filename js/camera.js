const Camera = {
  currentSceneId: null,

  init() {
    this.ensureStructure();
  },

  getScene() {
    if (typeof getCurrentScene === "function") {
      return getCurrentScene();
    }

    const episode = project?.episodes?.[0];
    if (!episode?.scenes?.length) return null;

    return (
      episode.scenes.find(scene => scene.id === this.currentSceneId) ||
      episode.scenes[0]
    );
  },

  ensureStructure(scene = this.getScene()) {
    if (!scene) return null;

    if (!scene.camera || typeof scene.camera !== "object") {
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

    return scene.camera;
  },

  getData(scene = this.getScene()) {
    return this.ensureStructure(scene);
  },

  setPosition(x, y) {
    const scene = this.getScene();
    const camera = this.ensureStructure(scene);
    if (!camera) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    camera.x = this.clamp(Number(x), 0, 100);
    camera.y = this.clamp(Number(y), 0, 100);

    this.apply(camera);

    if (typeof Editor !== "undefined" && Editor.render) {
      Editor.render();
    }

    if (typeof Timeline !== "undefined" && Timeline.render) {
      Timeline.render();
    }

    if (typeof saveProject === "function") {
      saveProject();
    }
  },

  setZoom(value) {
    const scene = this.getScene();
    const camera = this.ensureStructure(scene);
    if (!camera) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    camera.zoom = this.clamp(Number(value), 0.25, 5);

    this.apply(camera);

    if (typeof Editor !== "undefined" && Editor.render) {
      Editor.render();
    }

    if (typeof saveProject === "function") {
      saveProject();
    }
  },

  setRotation(value) {
    const scene = this.getScene();
    const camera = this.ensureStructure(scene);
    if (!camera) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    camera.rotation = Number(value) || 0;

    this.apply(camera);

    if (typeof Editor !== "undefined" && Editor.render) {
      Editor.render();
    }

    if (typeof saveProject === "function") {
      saveProject();
    }
  },

  addKeyframe(time = 0) {
    const scene = this.getScene();
    const camera = this.ensureStructure(scene);
    if (!camera) return null;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const keyframe = {
      id: "camera_kf_" + Date.now(),
      time: Number(time) || 0,
      x: camera.x,
      y: camera.y,
      zoom: camera.zoom,
      rotation: camera.rotation
    };

    camera.keyframes.push(keyframe);

    camera.keyframes.sort((a, b) => a.time - b.time);

    if (typeof saveProject === "function") {
      saveProject();
    }

    if (typeof Timeline !== "undefined" && Timeline.render) {
      Timeline.render();
    }

    return keyframe;
  },

  deleteKeyframe(id) {
    const scene = this.getScene();
    const camera = this.ensureStructure(scene);
    if (!camera) return;

    const index = camera.keyframes.findIndex(k => k.id === id);
    if (index === -1) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    camera.keyframes.splice(index, 1);

    if (typeof saveProject === "function") {
      saveProject();
    }

    if (typeof Timeline !== "undefined" && Timeline.render) {
      Timeline.render();
    }
  },

  getStateAt(time, scene = this.getScene()) {
    const camera = this.ensureStructure(scene);

    if (!camera) {
      return {
        x: 50,
        y: 50,
        zoom: 1,
        rotation: 0
      };
    }

    const keyframes = [...camera.keyframes].sort(
      (a, b) => a.time - b.time
    );

    if (!keyframes.length) {
      return {
        x: camera.x,
        y: camera.y,
        zoom: camera.zoom,
        rotation: camera.rotation
      };
    }

    const t = Number(time) || 0;

    if (t <= keyframes[0].time) {
      return this.cloneState(keyframes[0]);
    }

    const last = keyframes[keyframes.length - 1];

    if (t >= last.time) {
      return this.cloneState(last);
    }

    let previous = keyframes[0];
    let next = last;

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (
        t >= keyframes[i].time &&
        t <= keyframes[i + 1].time
      ) {
        previous = keyframes[i];
        next = keyframes[i + 1];
        break;
      }
    }

    const range = next.time - previous.time;
    const rawProgress = range === 0
      ? 0
      : (t - previous.time) / range;

    const progress =
      typeof Animation !== "undefined" &&
      typeof Animation.easeInOut === "function"
        ? Animation.easeInOut(rawProgress)
        : rawProgress;

    return {
      x: this.interpolate(previous.x, next.x, progress),
      y: this.interpolate(previous.y, next.y, progress),
      zoom: this.interpolate(previous.zoom, next.zoom, progress),
      rotation: this.interpolate(
        previous.rotation,
        next.rotation,
        progress
      )
    };
  },

  apply(camera) {
    if (!camera) return;

    const stage =
      document.querySelector("#editorStage") ||
      document.querySelector(".editor-stage") ||
      document.querySelector(".stage");

    if (!stage) return;

    stage.style.setProperty(
      "--camera-x",
      `${camera.x}%`
    );

    stage.style.setProperty(
      "--camera-y",
      `${camera.y}%`
    );

    stage.style.setProperty(
      "--camera-zoom",
      String(camera.zoom)
    );

    stage.style.setProperty(
      "--camera-rotation",
      `${camera.rotation}deg`
    );

    stage.dataset.cameraX = camera.x;
    stage.dataset.cameraY = camera.y;
    stage.dataset.cameraZoom = camera.zoom;
    stage.dataset.cameraRotation = camera.rotation;
  },

  applyAt(time) {
    const state = this.getStateAt(time);
    this.apply(state);
    return state;
  },

  reset() {
    const scene = this.getScene();
    const camera = this.ensureStructure(scene);
    if (!camera) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    camera.x = 50;
    camera.y = 50;
    camera.zoom = 1;
    camera.rotation = 0;

    this.apply(camera);

    if (typeof saveProject === "function") {
      saveProject();
    }

    if (typeof Editor !== "undefined" && Editor.render) {
      Editor.render();
    }
  },

  cloneState(state) {
    return {
      x: Number(state.x) || 50,
      y: Number(state.y) || 50,
      zoom: Number(state.zoom) || 1,
      rotation: Number(state.rotation) || 0
    };
  },

  interpolate(a, b, progress) {
    return Number(a) + (Number(b) - Number(a)) * progress;
  },

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
};
