const VoiceManager = {
  recordings: [],
  mediaRecorder: null,
  mediaStream: null,
  chunks: [],
  isRecording: false,
  currentAudio: null,
  db: null,

  DB_NAME: "cartoon_studio_voice_db",
  DB_VERSION: 1,
  STORE_NAME: "recordings",

  async init() {
    await this.openDatabase();
    await this.load();
    this.render();

    const button = document.getElementById("recordVoiceBtn");

    if (button && !button.dataset.voiceBound) {
      button.addEventListener("click", () => {
        this.toggleRecording();
      });

      button.dataset.voiceBound = "true";
    }
  },

  openDatabase() {
    return new Promise(resolve => {
      if (!("indexedDB" in window)) {
        resolve(false);
        return;
      }

      const request = indexedDB.open(
        this.DB_NAME,
        this.DB_VERSION
      );

      request.onupgradeneeded = event => {
        const database = event.target.result;

        if (!database.objectStoreNames.contains(this.STORE_NAME)) {
          database.createObjectStore(this.STORE_NAME, {
            keyPath: "id"
          });
        }
      };

      request.onsuccess = event => {
        this.db = event.target.result;
        resolve(true);
      };

      request.onerror = () => {
        console.error("Voice database could not be opened.");
        resolve(false);
      };
    });
  },

  async load() {
    if (!this.db) {
      this.recordings = this.getFallbackRecordings();
      return;
    }

    try {
      const records = await this.getAllFromDatabase();

      this.recordings = records.map(record => ({
        id: record.id,
        name: record.name,
        characterId: record.characterId || null,
        mimeType: record.mimeType || "audio/webm",
        duration: record.duration || 0,
        createdAt: record.createdAt,
        blob: record.blob || null
      }));
    } catch (error) {
      console.error("Could not load voice recordings:", error);
      this.recordings = this.getFallbackRecordings();
    }

    this.render();
  },

  getAllFromDatabase() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }

      const transaction =
        this.db.transaction(
          this.STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          this.STORE_NAME
        );

      const request =
        store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  saveRecording(recording) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.saveFallbackRecording(recording);
        resolve(true);
        return;
      }

      const transaction =
        this.db.transaction(
          this.STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          this.STORE_NAME
        );

      const request =
        store.put(recording);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror
