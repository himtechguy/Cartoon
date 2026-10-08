const AudioManager = {
  tracks: [],
  audioElements: new Map(),

  init() {
    this.load();
    this.bindImport();
    this.render();
  },

  load() {
    try {
      const saved = localStorage.getItem(
        "cartoon_studio_audio"
      );

      this.tracks = saved
        ? JSON.parse(saved)
        : [];
    } catch (error) {
      console.error(
        "Audio data could not be loaded:",
        error
      );

      this.tracks = [];
    }
  },

  save() {
    try {
      localStorage.setItem(
        "cartoon_studio_audio",
        JSON.stringify(this.tracks)
      );
    } catch (error) {
      console.error(
        "Audio data could not be saved:",
        error
      );
    }
  },

  bindImport() {
    const input =
      document.getElementById(
        "audioInput"
      );

    if (!input) return;

    input.addEventListener(
      "change",
      event => {
        const files =
          Array.from(
            event.target.files || []
          );

        files.forEach(file => {
          this.addFile(file);
        });

        input.value = "";
      }
    );
  },

  async addFile(file) {
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert(
        "Please select an audio file."
      );
      return;
    }

    const url =
      URL.createObjectURL(file);

    const audio =
      new Audio(url);

    audio.preload = "metadata";

    audio.addEventListener(
      "loadedmetadata",
      () => {
        const track = {
          id:
            "audio_" +
            Date.now(),

          name: file.name,

          type: file.type,

          duration:
            Number(
              audio.duration
            ) || 0,

          volume: 1,

          start: 0,

          end:
            Number(
              audio.duration
            ) || 0,

          loop: false,

          muted: false,

          url
        };

        this.tracks.push(track);

        this.audioElements.set(
          track.id,
          audio
        );

        this.save();

        this.render();

        if (
          typeof App !==
          "undefined" &&
          App.toast
        ) {
          App.toast(
            "Audio imported"
          );
        }
      }
    );
  },

  render() {
    const list =
      document.getElementById(
        "audioList"
      );

    if (!list) return;

    list.innerHTML = "";

    if (!this.tracks.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎵</div>
          <h3>No audio yet</h3>
          <p>
            Import music, voices or sound effects.
          </p>
        </div>
      `;

      return;
    }

    this.tracks.forEach(
      track => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "audio-item";

        item.innerHTML = `
          <div class="audio-icon">
            🎵
          </div>

          <div class="audio-info">
            <strong>
              ${this.escape(
                track.name
              )}
            </strong>

            <small>
              ${this.formatTime(
                track.duration
              )}
            </small>
          </div>

          <div class="audio-controls">

            <button
              onclick="AudioManager.play('${track.id}')">
              ▶
            </button>

            <button
              onclick="AudioManager.pause('${track.id}')">
              ⏸
            </button>

            <button
              onclick="AudioManager.toggleMute('${track.id}')">
              ${track.muted ? "🔇" : "🔊"}
            </button>

            <button
              onclick="AudioManager.remove('${track.id}')">
              🗑
            </button>

          </div>

          <div class="audio-volume">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value="${track.volume}"
              oninput="AudioManager.setVolume(
                '${track.id}',
                this.value
              )"
            >
          </div>
        `;

        list.appendChild(item);
      }
    );
  },

  play(id) {
    const track =
      this.tracks.find(
        t => t.id === id
      );

    if (!track) return;

    let audio =
      this.audioElements.get(id);

    if (!audio && track.url) {
      audio =
        new Audio(track.url);

      this.audioElements.set(
        id,
        audio
      );
    }

    if (!audio) return;

    audio.currentTime =
      Math.max(
        0,
        Number(track.start) || 0
      );

    audio.volume =
      track.muted
        ? 0
        : Number(track.volume) || 0;

    audio.loop =
      Boolean(track.loop);

    audio.play().catch(
      error => {
        console.error(
          "Audio playback failed:",
          error
        );
      }
    );
  },

  pause(id) {
    const audio =
      this.audioElements.get(id);

    if (audio) {
      audio.pause();
    }
  },

  toggleMute(id) {
    const track =
      this.tracks.find(
        t => t.id === id
      );

    if (!track) return;

    track.muted =
      !track.muted;

    const audio =
      this.audioElements.get(id);

    if (audio) {
      audio.volume =
        track.muted
          ? 0
          : track.volume;
    }

    this.save();
    this.render();
  },

  setVolume(id, value) {
    const track =
      this.tracks.find(
        t => t.id === id
      );

    if (!track) return;

    track.volume =
      Number(value);

    const audio =
      this.audioElements.get(id);

    if (audio && !track.muted) {
      audio.volume =
        track.volume;
    }

    this.save();
  },

  setLoop(id, enabled) {
    const track =
      this.tracks.find(
        t => t.id === id
      );

    if (!track) return;

    track.loop =
      Boolean(enabled);

    const audio =
      this.audioElements.get(id);

    if (audio) {
      audio.loop =
        track.loop;
    }

    this.save();
  },

  remove(id) {
    const track =
      this.tracks.find(
        t => t.id === id
      );

    if (!track) return;

    const confirmed =
      confirm(
        `Remove "${track.name}"?`
      );

    if (!confirmed) return;

    const audio =
      this.audioElements.get(id);

    if (audio) {
      audio.pause();
      audio.src = "";
    }

    this.audioElements.delete(id);

    this.tracks =
      this.tracks.filter(
        t => t.id !== id
      );

    this.save();

    this.render();
  },

  stopAll() {
    this.audioElements.forEach(
      audio => {
        audio.pause();
        audio.currentTime = 0;
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
      Math.floor(
        value / 60
      );

    const secs =
      Math.floor(
        value % 60
      );

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
     
