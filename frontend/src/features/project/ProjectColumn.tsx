import React from "react";
import styled from "@emotion/styled";
import { grid } from "const";
import { COLUMN_COLOR, PRIMARY } from "utils/colors";
import { IProject } from "types";
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import ColumnTitle from "components/ColumnTitle";
import ProjectList from "./ProjectList";

const Container = styled.div`
  margin: ${grid / 2}px;
  display: flex;
  flex-direction: column;
  border-top: 3px solid ${PRIMARY};
`;

const Header = styled.div<{ isDragging: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLUMN_COLOR};
  transition: background-color 0.2s ease;
  [data-rbd-drag-handle-context-id="0"] {
    cursor: initial;
  }
`;

type Props = {
  projects: IProject[];
};

const ProjectColumn = ({ projects }: Props) => {
  const id = 0;
  const index = 0;
  const title = "Projects";

  return (
    <Draggable draggableId={`col-${id}`} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Container
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-testid={`col-${title}`}
        >
          <Header isDragging={snapshot.isDragging}>
            <ColumnTitle
              {...provided.dragHandleProps}
              id={id}
              title={title}
              totalCount={projects.length}
              aria-label={`${title} task list`}
              data-testid="column-title"
            />
          </Header>
          <ProjectList columnId={id} listType="PROJECT" projects={projects} />
        </Container>
      )}
    </Draggable>
  );
};

export default ProjectColumn;
