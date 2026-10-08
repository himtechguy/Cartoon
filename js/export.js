const ExportManager = {
  init() {},

  exportProject() {
    const data =
      JSON.stringify(
        project,
        null,
        2
      );

    const blob =
      new Blob(
        [data],
        {
          type: "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${project.name || "cartoon-project"}.tkproject`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    if (
      typeof App !== "undefined" &&
      App.toast
    ) {
      App.toast(
        "Project backup exported"
      );
    }
  },

  importProject(file) {
    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = event => {
      try {
        const imported =
          JSON.parse(
            event.target.result
          );

        if (
          !imported ||
          typeof imported !== "object"
        ) {
          throw new Error(
            "Invalid project"
          );
        }

        project = imported;

        saveProject();

        if (
          typeof App !== "undefined"
        ) {
          App.refresh();
          App.toast(
            "Project imported"
          );
        }
      } catch (error) {
        console.error(error);

        alert(
          "This project file is invalid."
        );
      }
    };

    reader.readAsText(file);
  }
};
