import React from "react";
import styled from "@emotion/styled";
import { RootState } from "store";
import { useSelector, useDispatch } from "react-redux";
import { css } from "@emotion/core";
import ProjectChooser from "features/project/ProjectChooser";
import { changeProjectSelection } from "features/project/ProjectSlice";
import { Id, Label } from "types";
import LabelChooser from "features/task/LabelChooser";
import { setLabelsFilter } from "./BoardSlice";

const Container = styled.div`
  display: flex;
  margin: 0.5rem;
  font-weight: bold;
  font-size: 1.25rem;
  width: 100%;
`;

const Items = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const projectStyles = css`
  width: 250px;
  margin-left: 5px;
  margin-right: 5px;
`;

const BoardFilter = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(
    (state: RootState) => state.project.selectedProject
  );
  const filterByLabels = useSelector(
    (state: RootState) => state.board.filterByLabels
  );

  const handleProjectChange = (newProject: Id | null) => {
    dispatch(changeProjectSelection(newProject));
  };

  const handleLabelsChange = (newLabels: Label[]) => {
    dispatch(setLabelsFilter(newLabels.map((label) => label.id)));
  };

  return (
    <Container>
      <Items>
        <ProjectChooser
          selectedProject={selectedProject}
          handleProjectChange={handleProjectChange}
          customCss={projectStyles}
        />
        <LabelChooser
          selectedLabels={filterByLabels}
          handleLabelsChange={handleLabelsChange}
          customCss={projectStyles}
        />
      </Items>
    </Container>
  );
};

export default BoardFilter;
