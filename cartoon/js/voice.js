const VoiceManager = {
  recorder: null,
  stream: null,
  chunks: [],
  recording: false,
  recordings: [],

  init() {
    this.load();
  },

  load() {
    try {
      const saved = localStorage.getItem(
        "cartoon_studio_voice_recordings"
      );

      this.recordings = saved
        ? JSON.parse(saved)
        : [];
    } catch (error) {
      console.error(
        "Voice recordings could not be loaded:",
        error
      );

      this.recordings = [];
    }
  },

  save() {
    try {
      /*
       * Metadata is stored here.
       * Actual audio blobs are kept in memory
       * during the current session.
       *
       * Persistent audio storage will use
       * IndexedDB in the storage upgrade.
       */
      localStorage.setItem(
        "cartoon_studio_voice_recordings",
        JSON.stringify(
          this.recordings.map(recording => ({
            id: recording.id,
            name: recording.name,
            characterId: recording.characterId || null,
            duration: recording.duration || 0,
            createdAt: recording.createdAt
          }))
        )
      );
    } catch (error) {
      console.error(
        "Voice metadata could not be saved:",
        error
      );
    }
  },

  async start(characterId = null) {
    if (this.recording) {
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      alert(
        "Microphone recording is not supported by this browser."
      );
      return;
    }

    try {
      this.stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      this.chunks = [];

      this.recorder =
        new MediaRecorder(
          this.stream
        );

      this.recorder.ondataavailable =
        event => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            this.chunks.push(
              event.data
            );
          }
        };

      this.recorder.onstop =
        () => {
          this.finishRecording(
            characterId
          );
        };

      this.recorder.start();

      this.recording = true;

      if (
        typeof App !== "undefined" &&
        App.toast
      ) {
        App.toast(
          "Recording started"
        );
      }
    } catch (error) {
      console.error(
        "Microphone access failed:",
        error
      );

      alert(
        "Microphone access was denied or unavailable."
      );
    }
  },

  stop() {
    if (
      !this.recording ||
      !this.recorder
    ) {
      return;
    }

    this.recorder.stop();

    this.recording = false;

    if (this.stream) {
      this.stream
        .getTracks()
        .forEach(track =>
          track.stop()
        );
    }

    this.stream = null;
  },

  finishRecording(characterId) {
    const mimeType =
      this.recorder?.mimeType ||
      "audio/webm";

    const blob =
      new Blob(
        this.chunks,
        {
          type: mimeType
        }
      );

    const url =
      URL.createObjectURL(blob);

    const recording = {
      id:
        "voice_" +
        Date.now(),

      name:
        "Voice " +
        (this.recordings.length + 1),

      characterId:
        characterId || null,

      duration: 0,

      createdAt:
        new Date().toISOString(),

      mimeType,

      blob,

      url
    };

    const audio =
      new Audio(url);

    audio.addEventListener(
      "loadedmetadata",
      () => {
        recording.duration =
          Number(audio.duration) || 0;

        this.save();
        this.render();
      }
    );

    this.recordings.push(
      recording
    );

    this.save();

    this.render();

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast(
        "Voice recording saved"
      );
    }

    this.chunks = [];
    this.recorder = null;
  },

  play(id) {
    const recording =
      this.recordings.find(
        item => item.id === id
      );

    if (!recording) return;

    if (!recording.url) {
      alert(
        "This recording is not available in the current session."
      );
      return;
    }

    const audio =
      new Audio(recording.url);

    audio.play().catch(error =>
      console.error(
        "Voice playback failed:",
        error
      )
    );
  },

  rename(id) {
    const recording =
      this.recordings.find(
        item => item.id === id
      );

    if (!recording) return;

    const name =
      prompt(
        "Recording name:",
        recording.name
      );

    if (
      !name ||
      !name.trim()
    ) {
      return;
    }

    recording.name =
      name.trim();

    this.save();
    this.render();
  },

  remove(id) {
    const index =
      this.recordings.findIndex(
        item => item.id === id
      );

    if (index === -1) return;

    const recording =
      this.recordings[index];

    const confirmed =
      confirm(
        `Delete "${recording.name}"?`
      );

    if (!confirmed) return;

    if (recording.url) {
      URL.revokeObjectURL(
        recording.url
      );
    }

    this.recordings.splice(
      index,
      1
    );

    this.save();
    this.render();
  },

  getForCharacter(characterId) {
    return this.recordings.filter(
      recording =>
        recording.characterId ===
        characterId
    );
  },

  render() {
    const container =
      document.getElementById(
        "voiceList"
      );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!this.recordings.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎙️</div>
          <h3>No voice recordings</h3>
          <p>Record a voice for your characters.</p>
        </div>
      `;

      return;
    }

    this.recordings.forEach(
      recording => {
        const character =
          project.characters?.find(
            character =>
              character.id ===
              recording.characterId
          );

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "audio-item";

        item.innerHTML = `
          <div class="audio-icon">
            🎙️
          </div>

          <div class="audio-info">
            <strong>
              ${this.escape(
                recording.name
              )}
            </strong>

            <small>
              ${
                character
                  ? this.escape(
                      character.name
                    )
                  : "Unassigned"
              }
              •
              ${this.formatTime(
                recording.duration
              )}
            </small>
          </div>

          <div class="audio-controls">
            <button
              onclick="VoiceManager.play('${recording.id}')">
              ▶
            </button>

            <button
              onclick="VoiceManager.rename('${recording.id}')">
              ✏️
            </button>

            <button
              onclick="VoiceManager.remove('${recording.id}')">
              🗑
            </button>
          </div>
        `;

        container.appendChild(
          item
        );
      }
    );
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
  },

  escape(text) {
    return String(text)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }
};
