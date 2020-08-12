import React from "react";
import styled from "@emotion/styled";
import { R50, T50, COLUMN_COLOR } from "utils/colors";
import { grid, barHeight, taskWidth } from "const";
import { IProject } from "types";
import {
  DroppableProvided,
  DroppableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import Project from "./Project";
import AddProject from "./AddProject";
import { css } from "@emotion/core";

export const getBackgroundColor = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean
): string => {
  if (isDraggingOver) {
    return R50;
  }
  if (isDraggingFrom) {
    return T50;
  }
  return COLUMN_COLOR;
};

const Wrapper = styled.div<{
  isDraggingOver: boolean;
  isDraggingFrom: boolean;
}>`
  background-color: ${(props) =>
    getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  display: flex;
  flex-direction: column;
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: ${taskWidth}px;
`;

const scrollContainerHeight = 250;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;
  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: ${grid}px;
`;

const Container = styled.div``;

interface Props {
  columnId: number;
  listType: string;
  projects: IProject[];
}

interface ProjectListProps {
  projects: IProject[];
}

const InnerProjectList = ({ projects }: ProjectListProps) => (
  <>
    {projects.map((project: IProject, index: number) => (
      <Project key={project.id} project={project} index={index} />
    ))}
  </>
);

interface InnerListProps {
  dropProvided: DroppableProvided;
  projects: IProject[];
}

const InnerList = ({ projects, dropProvided }: InnerListProps) => (
  <Container>
    <DropZone
      data-testid="drop-zone"
      ref={dropProvided.innerRef}
      css={css`
        max-height: calc(100vh - ${barHeight * 5}px);
        overflow-y: scroll;
      `}
    >
      <InnerProjectList projects={projects} />
      {dropProvided.placeholder}
    </DropZone>
    <AddProject />
  </Container>
);

const ProjectList = ({ listType, projects: projects }: Props) => (
  <Droppable droppableId={"projects"} type={listType}>
    {(
      dropProvided: DroppableProvided,
      dropSnapshot: DroppableStateSnapshot
    ) => (
      <Wrapper
        isDraggingOver={dropSnapshot.isDraggingOver}
        isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
        {...dropProvided.droppableProps}
      >
        <InnerList projects={projects} dropProvided={dropProvided} />
      </Wrapper>
    )}
  </Droppable>
);

export default ProjectList;
