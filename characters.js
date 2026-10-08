const Characters = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById("charactersList");
    if (!container) return;

    container.innerHTML = "";

    if (!project.characters) {
      project.characters = [];
    }

    if (project.characters.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">👤</div>
          <h3>No characters yet</h3>
          <p>Create your first character.</p>
          <button class="primary-btn" onclick="Characters.create()">
            + Create Character
          </button>
        </div>
      `;
      return;
    }

    project.characters.forEach(character => {
      const card = document.createElement("div");
      card.className = "character-card";

      card.innerHTML = `
        <div class="character-preview">
          ${character.name === "Takue" ? "🧑🏾" : "👤"}
        </div>

        <div class="character-info">
          <h3>${this.escape(character.name)}</h3>
          <p>
            ${character.name === "Takue"
              ? "Main Character"
              : "Custom Character"}
          </p>
        </div>

        <div class="character-actions">
          <button onclick="Characters.edit('${character.id}')">
            Edit
          </button>

          ${
            character.name !== "Takue"
              ? `<button class="danger-btn"
                   onclick="Characters.remove('${character.id}')">
                   Delete
                 </button>`
              : ""
          }
        </div>
      `;

      container.appendChild(card);
    });
  },

  create() {
    const name = prompt("Enter character name:");

    if (!name || !name.trim()) return;

    const character = {
      id: "char_" + Date.now(),

      name: name.trim(),

      appearance: {
        skin: "#8B5
