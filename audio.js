const AudioManager = {
  tracks: [],
  currentAudio: null,
  currentTrackId: null,
  dbName: "cartoon_studio_audio_db",
  storeName: "audio",

  init() {
    this.ensureStructure();
    this.bindImport();
    this.loadTracks();
  },

  ensureStructure() {
    const scene = typeof getCurrentScene === "function"
      ? getCurrentScene()
      : null;

    if (!scene) return;

    if (!scene.audio || typeof scene.audio !== "object") {
      scene.audio = { tracks: [] };
    }

    if (!Array.isArray(scene.audio.tracks)) {
      scene.audio.tracks = [];
    }

    this.tracks = scene.audio.tracks;
  },

  getScene() {
    return typeof getCurrentScene === "function"
      ? getCurrentScene()
      : null;
  },

  getTracks() {
    this.ensureStructure();
    return this.tracks;
  },

  bindImport() {
    const input = document.querySelector("#audioInput");

    if (!input || input.dataset.audioBound === "true") {
      return;
    }

    input.dataset.audioBound = "true";

    input.addEventListener("change", async event => {
      const files = Array.from(event.target.files || []);

      for (const file of files) {
        await this.importAudio(file);
      }

      event.target.value = "";
    });
  },

  async importAudio(file) {
    if (!file) return null;

    const scene = this.getScene();
    if (!scene) {
      this.toast("Open a scene first");
      return null;
    }

    this.ensureStructure();

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const id = "audio_" + Date.now() + "_" + Math.random()
      .toString(36)
      .slice(2, 8);

    const type = this.detectType(file);

    const track = {
      id,
      name: file.name,
      type,
      mimeType: file.type || "audio/mpeg",
      duration: 0,
      start: 0,
      end: null,
      volume: 1,
      muted: false,
      loop: false,
      fadeIn: 0,
      fadeOut: 0,
      sourceId: id,
      createdAt: new Date().toISOString()
    };

    try {
      track.duration = await this.getAudioDuration(file);
    } catch (error) {
      console.warn("Could not read audio duration:", error);
    }

    this.tracks.push(track);

    await this.saveBlob(id, file);

    this.saveScene();

    this.render();

    this.toast("Audio added");

    return track;
  },

  detectType(file) {
    const name = String(file.name || "").toLowerCase();
    const mime = String(file.type || "").toLowerCase();

    if (
      name.includes("music") ||
      mime.includes("music")
    ) {
      return "music";
    }

    if (
      name.includes("voice") ||
      name.includes("dialogue") ||
      mime.includes("voice")
    ) {
      return "voice";
    }

    return "sfx";
  },

  getAudioDuration(file) {
    return new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      const url = URL.createObjectURL(file);

      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        const duration = Number(audio.duration) || 0;
        URL.revokeObjectURL(url);
        resolve(duration);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read audio"));
      };

      audio.src = url;
    });
  },

  openDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not supported"));
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = event => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: "id"
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveBlob(id, file) {
    try {
      const db = await this.openDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          this.storeName,
          "readwrite"
        );

        const store = transaction.objectStore(this.storeName);

        const request = store.put({
          id,
          name: file.name,
          type: file.type,
          blob: file,
          savedAt: new Date().toISOString()
        });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);

        transaction.oncomplete = () => db.close();
      });
    } catch (error) {
      console.warn("Audio blob could not be saved:", error);

      try {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            localStorage.setItem(
              "cartoon_studio_audio_" + id,
              reader.result
            );
          } catch (storageError) {
            console.warn(
              "Audio fallback storage failed:",
              storageError
            );
          }
        };

        reader.readAsDataURL(file);
      } catch (fallbackError) {
        console.warn(
          "Audio fallback failed:",
          fallbackError
        );
      }

      return false;
    }
  },

  async getBlob(id) {
    try {
      const db = await this.openDB();

      return new Promise(resolve => {
        const transaction = db.transaction(
          this.storeName,
          "readonly"
        );

        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          db.close();

          if (request.result?.blob) {
            resolve(request.result.blob);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          db.close();
          resolve(null);
        };
      });
    } catch (error) {
      console.warn("Could not load audio:", error);
      return null;
    }
  },

  async loadTracks() {
    this.ensureStructure();

    if (typeof this.render === "function") {
      this.render();
    }
  },

  async play(trackId) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    await this.stop();

    let source = null;

    const blob = await this.getBlob(track.sourceId);

    if (blob) {
      source = URL.createObjectURL(blob);
    } else {
      source = localStorage.getItem(
        "cartoon_studio_audio_" + track.sourceId
      );
    }

    if (!source) {
      this.toast("Audio file is unavailable");
      return;
    }

    const audio = new Audio(source);

    audio.volume = this.clamp(
      Number(track.volume),
      0,
      1
    );

    audio.loop = !!track.loop;
    audio.muted = !!track.muted;

    if (Number(track.start) > 0) {
      audio.currentTime = Number(track.start);
    }

    audio.onended = () => {
      if (blob) {
        URL.revokeObjectURL(source);
      }

      if (this.currentAudio === audio) {
        this.currentAudio = null;
        this.currentTrackId = null;
      }

      this.render();
    };

    this.currentAudio = audio;
    this.currentTrackId = trackId;

    try {
      await audio.play();
      this.render();
    } catch (error) {
      console.warn("Audio playback failed:", error);
      this.toast("Tap play again to start audio");
    }
  },

  pause() {
    if (!this.currentAudio) return;

    this.currentAudio.pause();
    this.render();
  },

  async togglePlay(trackId) {
    if (
      this.currentTrackId === trackId &&
      this.currentAudio
    ) {
      if (this.currentAudio.paused) {
        await this.currentAudio.play();
      } else {
        this.currentAudio.pause();
      }

      this.render();
      return;
    }

    await this.play(trackId);
  },

  async stop() {
    if (!this.currentAudio) return;

    try {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    } catch (error) {
      console.warn(error);
    }

    this.currentAudio = null;
    this.currentTrackId = null;
  },

  stopAll() {
    this.stop();
  },

  setVolume(trackId, value) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    track.volume = this.clamp(
      Number(value),
      0,
      1
    );

    if (
      this.currentTrackId === trackId &&
      this.currentAudio
    ) {
      this.currentAudio.volume = track.volume;
    }

    this.saveScene();
    this.render();
  },

  toggleMute(trackId) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    track.muted = !track.muted;

    if (
      this.currentTrackId === trackId &&
      this.currentAudio
    ) {
      this.currentAudio.muted = track.muted;
    }

    this.saveScene();
    this.render();
  },

  toggleLoop(trackId) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    track.loop = !track.loop;

    if (
      this.currentTrackId === trackId &&
      this.currentAudio
    ) {
      this.currentAudio.loop = track.loop;
    }

    this.saveScene();
    this.render();
  },

  setTiming(trackId, start, end) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    track.start = Math.max(0, Number(start) || 0);

    if (
      end !== null &&
      end !== undefined &&
      end !== ""
    ) {
      track.end = Math.max(
        track.start,
        Number(end) || track.start
      );
    } else {
      track.end = null;
    }

    this.saveScene();
    this.render();
  },

  setFade(trackId, fadeIn, fadeOut) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    track.fadeIn = Math.max(
      0,
      Number(fadeIn) || 0
    );

    track.fadeOut = Math.max(
      0,
      Number(fadeOut) || 0
    );

    this.saveScene();
    this.render();
  },

  rename(trackId) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    const name = prompt(
      "Audio name:",
      track.name
    );

    if (!name || !name.trim()) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    track.name = name.trim();

    this.saveScene();
    this.render();
  },

  remove(trackId) {
    const index = this.tracks.findIndex(
      item => item.id === trackId
    );

    if (index === -1) return;

    const track = this.tracks[index];

    if (
      !confirm(
        `Delete "${track.name}" from this scene?`
      )
    ) {
      return;
    }

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    if (this.currentTrackId === trackId) {
      this.stop();
    }

    this.tracks.splice(index, 1);

    this.deleteBlob(track.sourceId);

    this.saveScene();
    this.render();

    this.toast("Audio deleted");
  },

  async deleteBlob(id) {
    try {
      const db = await this.openDB();

      await new Promise((resolve, reject) => {
        const transaction = db.transaction(
          this.storeName,
          "readwrite"
        );

        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);

        transaction.oncomplete = () => db.close();
      });
    } catch (error) {
      console.warn("Could not delete audio blob:", error);
    }

    localStorage.removeItem(
      "cartoon_studio_audio_" + id
    );
  },

  move(trackId, start) {
    const track = this.tracks.find(
      item => item.id === trackId
    );

    if (!track) return;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    track.start = Math.max(
      0,
      Number(start) || 0
    );

    this.saveScene();
    this.render();
  },

  duplicate(trackId) {
    const original = this.tracks.find(
      item => item.id === trackId
    );

    if (!original) return null;

    if (typeof UndoRedo !== "undefined") {
      UndoRedo.saveState();
    }

    const copy = {
      ...JSON.parse(JSON.stringify(original)),
      id:
        "audio_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 7),
      name: original.name + " Copy"
    };

    copy.sourceId = original.sourceId;

    this.tracks.push(copy);

    this.saveScene();
    this.render();

    return copy;
  },

  saveScene() {
    const scene = this.getScene();

    if (!scene) return;

    if (!scene.audio) {
      scene.audio = {};
    }

    scene.audio.tracks = this.tracks;

    if (typeof saveProject === "function") {
      saveProject();
    }
  },

  render() {
    const container =
      document.querySelector("#audioTracks") ||
      document.querySelector("#audioList");

    if (!container) return;

    this.ensureStructure();

    if (!this.tracks.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎧</div>
          <h3>No audio yet</h3>
          <p>Import music, voices or sound effects.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.tracks
      .map(track => {
        const playing =
          this.currentTrackId === track.id &&
          this.currentAudio &&
          !this.currentAudio.paused;

        return `
          <div class="audio-track-card"
               data-track-id="${this.escape(track.id)}">

            <div class="audio-track-icon">
              ${this.getTypeIcon(track.type)}
            </div>

            <div class="audio-track-info">
              <strong>
                ${this.escape(track.name)}
              </strong>

              <span>
                ${this.escape(track.type)}
                • ${this.formatTime(track.duration)}
              </span>

              <div class="audio-track-actions">

                <button
                  type="button"
                  onclick="AudioManager.togglePlay('${this.escapeAttribute(track.id)}')">
                  ${playing ? "⏸️" : "▶️"}
                </button>

                <button
                  type="button"
                  onclick="AudioManager.toggleMute('${this.escapeAttribute(track.id)}')">
                  ${track.muted ? "🔇" : "🔊"}
                </button>

                <button
                  type="button"
                  onclick="AudioManager.toggleLoop('${this.escapeAttribute(track.id)}')">
                  ${track.loop ? "🔁" : "↪️"}
                </button>

                <button
                  type="button"
                  onclick="AudioManager.rename('${this.escapeAttribute(track.id)}')">
                  ✏️
                </button>

                <button
                  type="button"
                  onclick="AudioManager.duplicate('${this.escapeAttribute(track.id)}')">
                  📋
                </button>

                <button
                  type="button"
                  onclick="AudioManager.remove('${this.escapeAttribute(track.id)}')">
                  🗑️
                </button>

              </div>

              <label class="audio-volume-control">
                Volume
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value="${track.volume}"
                  oninput="AudioManager.setVolume('${this.escapeAttribute(track.id)}', this.value)">
              </label>

            </div>
          </div>
        `;
      })
      .join("");
  },

  getTypeIcon(type) {
    const icons = {
      music: "🎵",
      voice: "🎙️",
      sfx: "💥"
    };

    return icons[type] || "🎧";
  },

  formatTime(seconds) {
    const total = Math.max(
      0,
      Math.floor(Number(seconds) || 0)
    );

    const minutes = Math.floor(total / 60);
    const secs = total % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  },

  clamp(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  },

  toast(message) {
    if (
      typeof App !== "undefined" &&
      typeof App.toast === "function"
    ) {
      App.toast(message);
    }
  },

  escape(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  escapeAttribute(text) {
    return String(text ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");
  }
};
