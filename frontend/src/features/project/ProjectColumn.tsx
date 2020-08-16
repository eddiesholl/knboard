import React from "react";
import styled from "@emotion/styled";
import { grid } from "const";
import { COLUMN_COLOR, PRIMARY } from "utils/colors";
import { IProject, PriorityValue } from "types";
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import differenceInDays from "date-fns/differenceInDays";
import ColumnTitle from "components/ColumnTitle";
import ProjectList from "./ProjectList";
import { useSelector } from "react-redux";
import { RootState } from "store";

const DUE_DATE_IGNORE_DAYS = 10;
const projectDueInOrIgnore = (project: IProject) =>
  project.due_date == null
    ? DUE_DATE_IGNORE_DAYS
    : differenceInDays(new Date(project.due_date), new Date());

const priorityToSortValue = (p: PriorityValue) =>
  p == "H" ? 3 : p == "M" ? 2 : 1;

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

  const filterByLabels = useSelector(
    (state: RootState) => state.board.filterByLabels
  );

  const filteredProjects = projects
    .filter(
      (project) =>
        filterByLabels.length == 0 ||
        filterByLabels.some((filterByLabel) =>
          project.labels.includes(filterByLabel)
        )
    )
    .sort((a, b) => {
      const aDueIn = projectDueInOrIgnore(a);
      const bDueIn = projectDueInOrIgnore(b);

      if (aDueIn < DUE_DATE_IGNORE_DAYS) {
        if (bDueIn > aDueIn) {
          return -1;
        } else if (bDueIn < aDueIn && bDueIn < DUE_DATE_IGNORE_DAYS) {
          return 1;
        }
      } else if (bDueIn < DUE_DATE_IGNORE_DAYS) {
        return 1;
      }

      const priorityA = priorityToSortValue(a.priority);
      const priorityB = priorityToSortValue(b.priority);

      return priorityB - priorityA;

      // return 0;
    });

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
          <ProjectList
            columnId={id}
            listType="PROJECT"
            projects={filteredProjects}
          />
        </Container>
      )}
    </Draggable>
  );
};

export default ProjectColumn;
