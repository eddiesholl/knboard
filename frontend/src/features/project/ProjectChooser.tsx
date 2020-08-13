/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { TextField } from "@material-ui/core";
import { Id } from "types";
import { SerializedStyles } from "@emotion/core";
import { useSelector } from "react-redux";
import { Autocomplete } from "@material-ui/lab";
import { RootState } from "store";

interface Props {
  selectedProject: Id | null;
  handleProjectChange: (newProject: Id | null) => void;
  customCss?: SerializedStyles;
}

const ProjectChooser = ({
  selectedProject,
  handleProjectChange,
  customCss,
}: Props) => {
  const projectsById = useSelector((state: RootState) => state.project.byId);

  return (
    <Autocomplete
      id="parent-select"
      data-testid="edit-parent"
      size="small"
      filterSelectedOptions
      autoHighlight
      openOnFocus
      blurOnSelect
      options={Object.values(projectsById)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((p) => p.id)}
      getOptionLabel={(option) => projectsById[option].title}
      value={selectedProject}
      onChange={(_: any, newParent: Id | null) =>
        handleProjectChange(newParent)
      }
      renderInput={(params) => (
        <TextField {...params} label="Project" variant="outlined" />
      )}
      renderOption={(option) => projectsById[option].title}
      css={customCss}
    />
  );
};

export default ProjectChooser;
