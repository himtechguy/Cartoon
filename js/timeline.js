const Timeline = {
  currentTime: 0,
  playing: false,
  timer: null,
  duration: 10,

  init() {
    this.loadDuration();
    this.bindControls();
    this.render();
  },

  loadDuration() {
    this.duration =
      Number(project.settings?.duration) || 10;
  },

  getScene() {
    return Editor.getScene();
  },

  bindControls() {
    const play =
      document.getElementById("timelinePlay");

    const stop =
      document.getElementById("timelineStop");

    const back =
      document.getElementById("timelineBack");

    const forward =
      document.getElementById("timelineForward");

    if (play) {
      play.onclick = () => {
        this.togglePlay();
      };
    }

    if (stop) {
      stop.onclick = () => {
        this.stop();
      };
    }

    if (back) {
      back.onclick = () => {
        this.setTime(
          Math.max(
            0,
            this.currentTime - 1
          )
        );
      };
    }

    if (forward) {
      forward.onclick = () => {
        this.setTime(
          Math.min(
            this.duration,
            this.currentTime + 1
          )
        );
      };
    }
  },

  render() {
    const container =
      document.getElementById(
        "timelineTracks"
      );

    if (!container) return;

    const scene = this.getScene();

    container.innerHTML = "";

    if (!scene) {
      container.innerHTML =
        "<p>No scene selected.</p>";
      return;
    }

    if (!scene.objects) {
      scene.objects = [];
    }

    scene.objects.forEach(object => {
      this.renderTrack(
        container,
        object
      );
    });

    this.renderTimeRuler();

    this.updateTimeDisplay();
  },

  renderTimeRuler() {
    const ruler =
      document.getElementById(
        "timeRuler"
      );

    if (!ruler) return;

    ruler.innerHTML = "";

    for (
      let i = 0;
      i <= this.duration;
      i++
    ) {
      const mark =
        document.createElement(
          "div"
        );

      mark.className =
        "time-mark";

      mark.style.left =
        `${(i / this.duration) * 100}%`;

      mark.innerHTML =
        `<span>${i}s</span>`;

      ruler.appendChild(mark);
    }
  },

  renderTrack(container, object) {
    const track =
      document.createElement("div");

    track.className =
      "timeline-track";

    const name =
      document.createElement("div");

    name.className =
      "timeline-track-name";

    let label = "Object";

    if (object.type === "character") {
      const character =
        project.characters?.find(
          c => c.id === object.characterId
        );

      label =
        character?.name ||
        "Character";
    }

    if (object.type === "prop") {
      label =
        object.name ||
        "Prop";
    }

    if (object.type === "dialogue") {
      label =
        "💬 Dialogue";
    }

    name.textContent = label;

    track.appendChild(name);

    const lane =
      document.createElement("div");

    lane.className =
      "timeline-lane";

    const keyframes =
      object.keyframes || [];

    keyframes.forEach(
      keyframe => {
        const marker =
          document.createElement(
            "button"
          );

        marker.className =
          "keyframe";

        marker.style.left =
          `${(keyframe.time / this.duration) * 100}%`;

        marker.title =
          `${keyframe.time}s`;

        marker.onclick = () => {
          this.setTime(
            keyframe.time
          );

          Editor.selectedObject =
            object;

          Editor.renderInspector();
        };

        lane.appendChild(marker);
      }
    );

    lane.addEventListener(
      "click",
      event => {
        const rect =
          lane.getBoundingClientRect();

        const percent =
          (event.clientX -
            rect.left) /
          rect.width;

        const time =
          percent *
          this.duration;

        this.setTime(time);
      }
    );

    track.appendChild(lane);

    container.appendChild(track);
  },

  setTime(time) {
    this.currentTime =
      Math.max(
        0,
        Math.min(
          this.duration,
          Number(time) || 0
        )
      );

    this.updateTimeDisplay();

    this.applyAnimation();

    this.updatePlayhead();
  },

  updateTimeDisplay() {
    const display =
      document.getElementById(
        "stageTime"
      );

    if (display) {
      display.textContent =
        `${this.formatTime(
          this.currentTime
        )} / ${this.formatTime(
          this.duration
        )}`;
    }
  },

  updatePlayhead() {
    const playhead =
      document.getElementById(
        "timelinePlayhead"
      );

    if (!playhead) return;

    const percent =
      (this.currentTime /
        this.duration) *
      100;

    playhead.style.left =
      `${percent}%`;
  },

  applyAnimation() {
    const scene =
      this.getScene();

    if (!scene?.objects) return;

    scene.objects.forEach(
      object => {
        if (
          object.type !==
          "character"
        ) {
          return;
        }

        const state =
          Animation.getStateAt(
            object,
            this.currentTime
          );

        object.x = state.x;
        object.y = state.y;
        object.scale =
          state.scale;
        object.rotation =
          state.rotation;
        object.opacity =
          state.opacity;
        object.pose =
          state.pose;
        object.expression =
          state.expression;
      }
    );

    Editor.render();
  },

  togglePlay() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  },

  play() {
    if (this.playing) return;

    this.playing = true;

    const start =
      performance.now() -
      this.currentTime * 1000;

    this.timer =
      requestAnimationFrame(
        frame => {
          this.tick(
            frame,
            start
          );
        }
      );
  },

  tick(frame, start) {
    if (!this.playing) return;

    this.currentTime =
      (frame - start) / 1000;

    if (
      this.currentTime >=
      this.duration
    ) {
      this.currentTime =
        this.duration;

      this.pause();

      return;
    }

    this.updateTimeDisplay();

    this.updatePlayhead();

    this.applyAnimation();

    this.timer =
      requestAnimationFrame(
        nextFrame => {
          this.tick(
            nextFrame,
            start
          );
        }
      );
  },

  pause() {
    this.playing = false;

    if (this.timer) {
      cancelAnimationFrame(
        this.timer
      );
    }

    this.timer = null;
  },

  stop() {
    this.pause();

    this.setTime(0);
  },

  addKeyframe() {
    const object =
      Editor.selectedObject;

    if (!object) {
      alert(
        "Select a character or object first."
      );
      return;
    }

    UndoRedo.saveState();

    Animation.addKeyframe(
      object,
      this.currentTime,
      {
        x: object.x,
        y: object.y,
        scale: object.scale,
        rotation: object.rotation,
        opacity: object.opacity,
        pose: object.pose,
        expression:
          object.expression
      }
    );

    this.render();
  },

  deleteCurrentKeyframe() {
    const object =
      Editor.selectedObject;

    if (!object) return;

    UndoRedo.saveState();

    Animation.deleteKeyframe(
      object,
      this.currentTime
    );

    this.render();
  },

  formatTime(seconds) {
    const value =
      Math.max(
        0,
        Number(seconds) || 0
      );

    const minutes =
      Math.floor(value / 60);

    const secs =
      Math.floor(value % 60);

    return (
      String(minutes).padStart(
        2,
        "0"
      ) +
      ":" +
      String(secs).padStart(
        2,
        "0"
      )
    );
  }
};
