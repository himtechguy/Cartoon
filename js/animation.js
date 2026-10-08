const Animation = {
  init() {},

  addKeyframe(object, time, properties = {}) {
    if (!object) return;

    if (!object.keyframes) {
      object.keyframes = [];
    }

    const keyframe = {
      id: "kf_" + Date.now(),
      time: Number(time) || 0,
      x: properties.x ?? object.x ?? 50,
      y: properties.y ?? object.y ?? 50,
      scale: properties.scale ?? object.scale ?? 1,
      rotation: properties.rotation ?? object.rotation ?? 0,
      opacity: properties.opacity ?? object.opacity ?? 1,
      pose: properties.pose ?? object.pose ?? "standing",
      expression:
        properties.expression ??
        object.expression ??
        "normal"
    };

    const existing =
      object.keyframes.find(
        k => k.time === keyframe.time
      );

    if (existing) {
      Object.assign(existing, keyframe);
    } else {
      object.keyframes.push(keyframe);
    }

    object.keyframes.sort(
      (a, b) => a.time - b.time
    );

    saveProject();

    return keyframe;
  },

  deleteKeyframe(object, time) {
    if (!object?.keyframes) return;

    object.keyframes =
      object.keyframes.filter(
        k => k.time !== Number(time)
      );

    saveProject();
  },

  getStateAt(object, time) {
    if (!object) return null;

    const keyframes =
      (object.keyframes || [])
        .slice()
        .sort((a, b) => a.time - b.time);

    if (!keyframes.length) {
      return {
        x: object.x ?? 50,
        y: object.y ?? 50,
        scale: object.scale ?? 1,
        rotation: object.rotation ?? 0,
        opacity: object.opacity ?? 1,
        pose: object.pose || "standing",
        expression:
          object.expression || "normal"
      };
    }

    const t = Number(time) || 0;

    if (t <= keyframes[0].time) {
      return { ...keyframes[0] };
    }

    const last =
      keyframes[keyframes.length - 1];

    if (t >= last.time) {
      return { ...last };
    }

    let before = keyframes[0];
    let after = keyframes[1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (
        t >= keyframes[i].time &&
        t <= keyframes[i + 1].time
      ) {
        before = keyframes[i];
        after = keyframes[i + 1];
        break;
      }
    }

    const distance =
      after.time - before.time;

    const progress =
      distance === 0
        ? 0
        : (t - before.time) / distance;

    const eased =
      this.easeInOut(progress);

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

      scale: this.interpolate(
        before.scale,
        after.scale,
        eased
      ),

      rotation: this.interpolate(
        before.rotation,
        after.rotation,
        eased
      ),

      opacity: this.interpolate(
        before.opacity,
        after.opacity,
        eased
      ),

      pose:
        progress < 0.5
          ? before.pose
          : after.pose,

      expression:
        progress < 0.5
          ? before.expression
          : after.expression
    };
  },

  interpolate(a, b, amount) {
    return (
      Number(a || 0) +
      (Number(b || 0) -
        Number(a || 0)) *
        amount
    );
  },

  easeInOut(t) {
    return t < 0.5
      ? 2 * t * t
      : 1 -
          Math.pow(
            -2 * t + 2,
            2
          ) / 2;
  },

  copyKeyframe(object, time) {
    const keyframe =
      object?.keyframes?.find(
        k => k.time === Number(time)
      );

    if (!keyframe) return null;

    return JSON.parse(
      JSON.stringify(keyframe)
    );
  },

  pasteKeyframe(object, keyframe, time) {
    if (!object || !keyframe) return;

    const copy =
      JSON.parse(
        JSON.stringify(keyframe)
      );

    copy.id =
      "kf_" + Date.now();

    copy.time =
      Number(time) || 0;

    if (!object.keyframes) {
      object.keyframes = [];
    }

    object.keyframes.push(copy);

    object.keyframes.sort(
      (a, b) => a.time - b.time
    );

    saveProject();
  }
};
