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
    if (
      typeof Editor === "undefined" ||
      !Editor.getScene
    ) {
      return null;
    }

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
      play.onclick = () =>
        this.togglePlay();
    }

    if (stop) {
      stop.onclick = () =>
        this.stop();
    }

    if (back) {
      back.onclick = () =>
        this.setTime(
          Math.max(
            0,
            this.currentTime - 1
          )
        );
    }

    if (forward) {
      forward.onclick = () =>
        this.setTime(
          Math.min(
            this.duration,
            this.currentTime + 1
          )
        );
    }
  },

  render() {
    this.loadDuration();

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

      this.renderTimeRuler();
      return;
    }

    if (!scene.objects) {
      scene.objects = [];
    }

    scene.objects.forEach(
      object => {
        this.renderObjectTrack(
          container,
          object
        );
      }
    );

    this.renderDialogueTracks(
      container,
      scene
    );

    this.renderCameraTrack(
      container,
      scene
    );

    this.renderTitleTracks(
      container,
      scene
    );

    this.renderTimeRuler();
    this.updateTimeDisplay();
    this.updatePlayhead();
  },

  renderTimeRuler() {
    const ruler =
      document.getElementById(
        "timeRuler"
      );

    if (!ruler) return;

    ruler.innerHTML = "";

    const duration =
      Math.max(1, this.duration);

    for (
      let second = 0;
      second <= duration;
      second++
    ) {
      const mark =
        document.createElement("div");

      mark.className =
        "time-mark";

      mark.style.left =
        `${(second / duration) * 100}%`;

      mark.innerHTML =
        `<span>${second}s</span>`;

      ruler.appendChild(mark);
    }
  },

  renderObjectTrack(
    container,
    object
  ) {
    const track =
      document.createElement("div");

    track.className =
      "timeline-track";

    const name =
      document.createElement("div");

    name.className =
      "timeline-track-name";

    name.textContent =
      this.getObjectName(object);

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
          `${this.timeToPercent(
            keyframe.time
          )}%`;

        marker.title =
          `${keyframe.time}s`;

        marker.onclick =
          event => {

            event.stopPropagation();

            this.setTime(
              keyframe.time
            );

            Editor.selectedObject =
              object;

            Editor.render();
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

        this.setTime(
          percent * this.duration
        );
      }
    );

    track.appendChild(lane);

    container.appendChild(track);
  },

  renderDialogueTracks(
    container,
    scene
  ) {
    const dialogues =
      scene.dialogue || [];

    dialogues.forEach(
      dialogue => {

        const track =
          document.createElement("div");

        track.className =
          "timeline-track";

        const name =
          document.createElement("div");

        name.className =
          "timeline-track-name";

        name.textContent =
          "💬 Dialogue";

        track.appendChild(name);

        const lane =
          document.createElement("div");

        lane.className =
          "timeline-lane";

        const start =
          Number(dialogue.start) || 0;

        const end =
          Number(dialogue.end) || start;

        const clip =
          document.createElement("div");

        clip.className =
          "timeline-dialogue-clip";

        clip.style.left =
          `${this.timeToPercent(start)}%`;

        clip.style.width =
          `${Math.max(
            0.5,
            this.timeToPercent(
              end - start
            )
          )}%`;

        clip.textContent =
          dialogue.text || "Dialogue";

        lane.appendChild(clip);

        track.appendChild(lane);

        container.appendChild(track);
      }
    );
  },

  renderCameraTrack(
    container,
    scene
  ) {
    const camera =
      scene.camera;

    if (!camera) return;

    const track =
      document.createElement("div");

    track.className =
      "timeline-track";

    const name =
      document.createElement("div");

    name.className =
      "timeline-track-name";

    name.textContent =
      "📷 Camera";

    track.appendChild(name);

    const lane =
      document.createElement("div");

    lane.className =
      "timeline-lane";

    const frames =
      camera.keyframes || [];

    frames.forEach(
      frame => {

        const marker =
          document.createElement(
            "button"
          );

        marker.className =
          "keyframe camera-keyframe-marker";

        marker.style.left =
          `${this.timeToPercent(
            frame.time
          )}%`;

        marker.title =
          `Camera ${frame.time}s`;

        marker.onclick =
          () => {
            this.setTime(
              frame.time
            );
          };

        lane.appendChild(marker);
      }
    );

    track.appendChild(lane);

    container.appendChild(track);
  },

  renderTitleTracks(
    container,
    scene
  ) {
    const titles =
      scene.titles || [];

    titles.forEach(
      title => {

        const track =
          document.createElement("div");

        track.className =
          "timeline-track";

        const name =
          document.createElement("div");

        name.className =
          "timeline-track-name";

        name.textContent =
          "T Title";

        track.appendChild(name);

        const lane =
          document.createElement("div");

        lane.className =
          "timeline-lane";

        const start =
          Number(title.start) || 0;

        const end =
          Number(title.end) ||
          this.duration;

        const clip =
          document.createElement("div");

        clip.className =
          "timeline-title-clip";

        clip.style.left =
          `${this.timeToPercent(start)}%`;

        clip.style.width =
          `${Math.max(
            0.5,
            this.timeToPercent(
              end - start
            )
          )}%`;

        clip.textContent =
          title.text || "Title";

        lane.appendChild(clip);

        track.appendChild(lane);

        container.appendChild(track);
      }
    );
  },

  getObjectName(object) {
    if (object.type === "character") {
      const character =
        project.characters?.find(
          character =>
            character.id ===
            object.characterId
        );

      return (
        character?.name ||
        "Character"
      );
    }

    if (object.type === "prop") {
      return object.name || "Prop";
    }

    if (object.type === "dialogue") {
      return "💬 Dialogue";
    }

    return "Object";
  },

  timeToPercent(time) {
    if (!this.duration) return 0;

    return Math.max(
      0,
      Math.min(
        100,
        (Number(time) /
          this.duration) *
          100
      )
    );
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
    this.updatePlayhead();
    this.applyAnimation();
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

    playhead.style.left =
      `${this.timeToPercent(
        this.currentTime
      )}%`;
  },

  applyAnimation() {
    const scene =
      this.getScene();

    if (!scene) return;

    /*
      Important:
      Do NOT overwrite the saved object's
      base x/y/scale/etc.

      Animation is rendered temporarily
      at the current timeline position.
    */

    const stage =
      document.getElementById(
        "stageObjects"
      );

    if (!stage) return;

    const elements =
      stage.querySelectorAll(
        ".stage-object"
      );

    elements.forEach(
      element => {

        const id =
          element.dataset.id;

        const object =
          scene.objects.find(
            item => item.id === id
          );

        if (!object) return;

        let state;

        if (
          typeof Animation !==
          "undefined" &&
          object.keyframes?.length
        ) {
          state =
            Animation.getStateAt(
              object,
              this.currentTime
            );
        } else {
          state = {
            x: object.x ?? 50,
            y: object.y ?? 50,
            scale: object.scale ?? 1,
            rotation:
              object.rotation ?? 0,
            opacity:
              object.opacity ?? 1
          };
        }

        element.style.left =
          `${state.x}%`;

        element.style.top =
          `${state.y}%`;

        element.style.opacity =
          state.opacity ?? 1;

        element.style.transform =
          `translate(-50%, -50%) ` +
          `scale(${state.scale ?? 1}) ` +
          `rotate(${state.rotation ?? 0}deg)`;
      }
    );

    if (
      typeof Camera !== "undefined"
    ) {
      Camera.apply(
        this.currentTime
      );
    }

    this.renderActiveDialogue();
    this.renderActiveTitles();
  },

  renderActiveDialogue() {
    const stage =
      document.getElementById(
        "stageObjects"
      );

    if (!stage) return;

    stage
      .querySelectorAll(
        ".timeline-live-dialogue"
      )
      .forEach(
        element => element.remove()
      );

    if (
      typeof Dialogue ===
      "undefined"
    ) {
      return;
    }

    const active =
      Dialogue.getActive(
        this.currentTime
      );

    active.forEach(
      dialogue => {

        const bubble =
          document.createElement(
            "div"
          );

        bubble.className =
          "timeline-live-dialogue";

        bubble.textContent =
          dialogue.text || "";

        bubble.style.position =
          "absolute";

        bubble.style.left =
          `${dialogue.x ?? 50}%`;

        bubble.style.top =
          `${dialogue.y ?? 25}%`;

        bubble.style.transform =
          "translate(-50%, -50%)";

        bubble.style.zIndex =
          "100";

        stage.appendChild(
          bubble
        );
      }
    );
  },

  renderActiveTitles() {
    const stage =
      document.getElementById(
        "stageObjects"
      );

    if (!stage) return;

    stage
      .querySelectorAll(
        ".timeline-live-title"
      )
      .forEach(
        element => element.remove()
      );

    if (
      typeof Titles ===
      "undefined"
    ) {
      return;
    }

    const active =
      Titles.getActive(
        this.currentTime
      );

    active.forEach(
      title => {

        const element =
          document.createElement(
            "div"
          );

        element.className =
          "timeline-live-title";

        element.textContent =
          title.text || "";

        element.style.position =
          "absolute";

        element.style.left =
          `${title.x ?? 50}%`;

        element.style.top =
          `${title.y ?? 50}%`;

        element.style.transform =
          "translate(-50%, -50%)";

        element.style.zIndex =
          "110";

        element.style.fontSize =
          `${title.size ?? 32}px`;

        element.style.fontWeight =
          title.weight || "bold";

        element.style.color =
          title.color || "#fff";

        stage.appendChild(
          element
        );
      }
    );
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

    if (
      this.currentTime >=
      this.duration
    ) {
      this.currentTime = 0;
    }

    this.playing = true;

    const start =
      performance.now() -
      this.currentTime * 1000;

    const frame = now => {

      if (!this.playing) return;

      this.currentTime =
        (now - start) / 1000;

      if (
        this.currentTime >=
        this.duration
      ) {
        this.currentTime =
          this.duration;

        this.applyAnimation();
        this.pause();

        return;
      }

      this.updateTimeDisplay();
      this.updatePlayhead();
      this.applyAnimation();

      this.timer =
        requestAnimationFrame(
          frame
        );
    };

    this.timer =
      requestAnimationFrame(
        frame
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

    this.currentTime = 0;

    this.applyAnimation();
    this.updateTimeDisplay();
    this.updatePlayhead();
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

    if (
      typeof Animation !==
      "undefined"
    ) {
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
    }

    saveProject();

    this.render();
  },

  deleteCurrentKeyframe() {
    const object =
      Editor.selectedObject;

    if (!object) return;

    UndoRedo.saveState();

    if (
      typeof Animation !==
      "undefined"
    ) {
      Animation.deleteKeyframe(
        object,
        this.currentTime
      );
    }

    saveProject();

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
      String(minutes)
        .padStart(2, "0") +
      ":" +
      String(secs)
        .padStart(2, "0")
    );
  }
};
