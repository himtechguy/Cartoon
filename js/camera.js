const Camera = {
  init() {},

  getScene() {
    if (typeof Editor === "undefined") {
      return null;
    }

    return Editor.getScene();
  },

  getData() {
    const scene = this.getScene();

    if (!scene) return null;

    if (!scene.camera) {
      scene.camera = {
        x: 50,
        y: 50,
        zoom: 1,
        rotation: 0,
        keyframes: []
      };
    }

    return scene.camera;
  },

  addKeyframe(time, values = {}) {
    const camera = this.getData();

    if (!camera) return;

    if (!camera.keyframes) {
      camera.keyframes = [];
    }

    const keyframe = {
      id: "camera_kf_" + Date.now(),

      time: Number(time) || 0,

      x: values.x ?? camera.x ?? 50,

      y: values.y ?? camera.y ?? 50,

      zoom: values.zoom ?? camera.zoom ?? 1,

      rotation:
        values.rotation ??
        camera.rotation ??
        0
    };

    const existing =
      camera.keyframes.find(
        k => k.time === keyframe.time
      );

    if (existing) {
      Object.assign(
        existing,
        keyframe
      );
    } else {
      camera.keyframes.push(
        keyframe
      );
    }

    camera.keyframes.sort(
      (a, b) => a.time - b.time
    );

    saveProject();

    return keyframe;
  },

  deleteKeyframe(time) {
    const camera = this.getData();

    if (!camera?.keyframes) return;

    camera.keyframes =
      camera.keyframes.filter(
        k =>
          k.time !== Number(time)
      );

    saveProject();
  },

  getStateAt(time) {
    const camera = this.getData();

    if (!camera) return null;

    const frames =
      (camera.keyframes || [])
        .slice()
        .sort(
          (a, b) =>
            a.time - b.time
        );

    if (!frames.length) {
      return {
        x: camera.x ?? 50,
        y: camera.y ?? 50,
        zoom: camera.zoom ?? 1,
        rotation:
          camera.rotation ?? 0
      };
    }

    const current =
      Number(time) || 0;

    if (
      current <= frames[0].time
    ) {
      return {
        ...frames[0]
      };
    }

    const last =
      frames[frames.length - 1];

    if (
      current >= last.time
    ) {
      return {
        ...last
      };
    }

    let before =
      frames[0];

    let after =
      frames[1];

    for (
      let i = 0;
      i < frames.length - 1;
      i++
    ) {
      if (
        current >= frames[i].time &&
        current <= frames[i + 1].time
      ) {
        before = frames[i];
        after = frames[i + 1];
        break;
      }
    }

    const range =
      after.time - before.time;

    const progress =
      range === 0
        ? 0
        : (current - before.time) /
          range;

    const eased =
      this.ease(progress);

    return {
      x: this.interpolate(
        before.x,
        after.x,
        eased
      ),

      y: this.interpolate(
        before.y,
        after.y,
        eased
      ),

      zoom: this.interpolate(
        before.zoom,
        after.zoom,
        eased
      ),

      rotation:
        this.interpolate(
          before.rotation,
          after.rotation,
          eased
        )
    };
  },

  apply(time) {
    const state =
      this.getStateAt(time);

    if (!state) return;

    const stage =
      document.getElementById(
        "stage"
      );

    if (!stage) return;

    stage.style.setProperty(
      "--camera-x",
      `${state.x}%`
    );

    stage.style.setProperty(
      "--camera-y",
      `${state.y}%`
    );

    stage.style.setProperty(
      "--camera-zoom",
      state.zoom
    );

    stage.style.setProperty(
      "--camera-rotation",
      `${state.rotation}deg`
    );
  },

  setPosition(x, y) {
    const camera =
      this.getData();

    if (!camera) return;

    camera.x =
      Number(x) || 50;

    camera.y =
      Number(y) || 50;

    saveProject();
  },

  setZoom(zoom) {
    const camera =
      this.getData();

    if (!camera) return;

    camera.zoom =
      Math.max(
        0.1,
        Number(zoom) || 1
      );

    saveProject();
  },

  setRotation(rotation) {
    const camera =
      this.getData();

    if (!camera) return;

    camera.rotation =
      Number(rotation) || 0;

    saveProject();
  },

  interpolate(a, b, amount) {
    return (
      Number(a || 0) +
      (Number(b || 0) -
        Number(a || 0)) *
        amount
    );
  },

  ease(t) {
    return (
      t < 0.5
        ? 2 * t * t
        : 1 -
          Math.pow(
            -2 * t + 2,
            2
          ) / 2
    );
  }
};
