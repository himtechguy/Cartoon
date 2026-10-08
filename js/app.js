const App = {

  init() {

    this.bindNavigation();

    this.bindButtons();

    this.refresh();

  },


  bindNavigation() {

    document
      .querySelectorAll(".nav")
      .forEach(button => {

        button.addEventListener("click", () => {

          this.openPage(button.dataset.page);

        });

      });

  },


  openPage(page) {

    document
      .querySelectorAll(".page")
      .forEach(section => {

        section.classList.remove("active");

      });


    document
      .getElementById(`page-${page}`)
      .classList.add("active");


    document
      .querySelectorAll(".nav")
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.page === page
        );

      });


    if (page === "editor") {

      Editor.render();

    }


    if (page === "timeline") {

      Timeline.render();

    }


    if (page === "audio") {

      AudioManager.render();

    }

  },


  bindButtons() {

    document
      .getElementById("saveBtn")
      .onclick = () => {

        saveProject(project);

        this.toast("Project saved");

      };


    document
      .getElementById("previewBtn")
      .onclick = () => {

        Preview.open();

      };


    document
      .getElementById("newProjectBtn")
      .onclick = () => {

        this.createProject();

      };


    document
      .getElementById("newCharacterBtn")
      .onclick = () => {

        Characters.create();

      };


    document
      .getElementById("addCharacterBtn")
      .onclick = () => {

        Editor.addCharacter();

      };


    document
      .getElementById("addPropBtn")
      .onclick = () => {

        Editor.addProp();

      };


    document
      .getElementById("addDialogueBtn")
      .onclick = () => {

        Dialogue.create();

      };


    document
      .getElementById("cameraKeyBtn")
      .onclick = () => {

        Camera.addKeyframe();

      };


    document
      .getElementById("playBtn")
      .onclick = () => {

        Timeline.play();

      };


    document
      .getElementById("stopBtn")
      .onclick = () => {

        Timeline.stop();

      };


    document
      .getElementById("timelineBack")
      .onclick = () => {

        Timeline.seek(-1);

      };


    document
      .getElementById("timelineForward")
      .onclick = () => {

        Timeline.seek(1);

      };


    document
      .getElementById("audioInput")
      .onchange = event => {

        AudioManager.import(
          event.target.files
        );

      };


    document
      .getElementById("backupBtn")
      .onclick = () => {

        ExportManager.backup();

      };


    document
      .getElementById("backupInput")
      .onchange = event => {

        ExportManager.restore(
          event.target.files[0]
        );

      };


    document
      .getElementById("modalClose")
      .onclick = () => {

        this.closeModal();

      };


    document
      .getElementById("previewClose")
      .onclick = () => {

        Preview.close();

      };

  },


  createProject() {

    this.modal(

      "New Project",

      `
      <form id="projectForm" class="modal-form">

        <label>
          Project name

          <input
            id="projectName"
            required
            placeholder="My Cartoon Series"
          >

        </label>

        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="App.closeModal()"
          >
            Cancel
          </button>

          <button class="btn primary">
            Create
          </button>

        </div>

      </form>
      `

    );


    document
      .getElementById("projectForm")
      .onsubmit = event => {

        event.preventDefault();

        project = createDefaultProject();

        project.id =
          "project_" + Date.now();

        project.name =
          document
            .getElementById("projectName")
            .value
            .trim();


        saveProject(project);

        this.closeModal();

        this.refresh();

        this.openPage("editor");

      };

  },


  modal(title, content) {

    document
      .getElementById("modalTitle")
      .textContent = title;

    document
      .getElementById("modalBody")
      .innerHTML = content;

    document
      .getElementById("modal")
      .classList.add("show");

  },


  closeModal() {

    document
      .getElementById("modal")
      .classList.remove("show");

  },


  refresh() {

    Projects.render();

    Characters.render();

    Editor.render();

    Timeline.render();

    AudioManager.render();

  },


  toast(message) {

    const toast =
      document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

      toast.classList.remove("show");

    }, 1800);

  }

};


window.addEventListener(
  "DOMContentLoaded",
  () => App.init()
);
