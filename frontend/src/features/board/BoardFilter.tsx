import React from "react";
import styled from "@emotion/styled";
import { RootState } from "store";
import { useSelector, useDispatch } from "react-redux";
import { css } from "@emotion/core";
import ProjectChooser from "features/project/ProjectChooser";
import { changeProjectSelection } from "features/project/ProjectSlice";
import { Id } from "types";

const Container = styled.div`
  display: flex;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
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
`;

const BoardFilter = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(
    (state: RootState) => state.project.selectedProject
  );

  const handleProjectChange = (newProject: Id | null) => {
    dispatch(changeProjectSelection(newProject));
  };

  return (
    <Container>
      <Items>
        <ProjectChooser
          selectedProject={selectedProject}
          handleProjectChange={handleProjectChange}
          customCss={projectStyles}
        />
      </Items>
    </Container>
  );
};

export default BoardFilter;
