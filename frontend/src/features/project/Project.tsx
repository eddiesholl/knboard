import React from "react";
import styled from "@emotion/styled";
import { IProject } from "types";
import {
  DraggableProvided,
  Draggable,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { N30, N0, N70, PRIMARY, Y50 } from "utils/colors";
import { PRIO_COLORS } from "const";
import { taskContainerStyles } from "styles";
import { useDispatch, useSelector } from "react-redux";
import { changeProjectSelection } from "./ProjectSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/free-solid-svg-icons";
import { RootState } from "store";

const getBackgroundColor = (
  isDragging: boolean,
  isGroupedOver: boolean,
  isSelected: boolean
) => {
  if (isSelected) {
    return Y50;
  }
  if (isDragging) {
    return "#eee";
  }

  if (isGroupedOver) {
    return N30;
  }

  return N0;
};

const getBorderColor = (isDragging: boolean) =>
  isDragging ? "orange" : "transparent";

interface ContainerProps {
  isDragging: boolean;
  isGroupedOver: boolean;
  isSelected: boolean;
}

const Container = styled.span<ContainerProps>`
  border-color: ${(props) => getBorderColor(props.isDragging)};
  background-color: ${(props) =>
    getBackgroundColor(
      props.isDragging,
      props.isGroupedOver,
      props.isSelected
    )};
  box-shadow: ${({ isDragging }) =>
    isDragging ? `2px 2px 1px ${N70}` : "none"};

  &:focus {
    border-color: #aaa;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TextContent = styled.div`
  position: relative;
  padding-right: 14px;
  word-break: break-word;
  color: ${PRIMARY};
  font-weight: bold;
  font-size: 12px;
`;

const Footer = styled.div`
  height: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardIcon = styled.div`
  display: flex;
  font-size: 0.75rem;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TaskId = styled.small`
  flex-grow: 1;
  flex-shrink: 1;
  margin: 0;
  font-weight: normal;
  text-overflow: ellipsis;
  text-align: left;
  font-weight: bold;
  color: #aaa;
  font-size: 8px;
`;

const getStyle = (provided: DraggableProvided, style?: Record<string, any>) => {
  if (!style) {
    return provided.draggableProps.style;
  }

  return {
    ...provided.draggableProps.style,
    ...style,
  };
};

export const TaskFooter = ({ project }: { project: IProject }) => {
  return (
    <Footer>
      <CardIcon data-testid="project-priority">
        <FontAwesomeIcon icon={faCube} color={PRIO_COLORS[project.priority]} />
      </CardIcon>
    </Footer>
  );
};

interface Props {
  project: IProject;
  style?: Record<string, any>;
  index: number;
}

const Project = ({ project: project, style, index }: Props) => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(
    (state: RootState) => state.project.selectedProject
  );

  const handleClick = () => {
    dispatch(changeProjectSelection(project.id));
  };

  return (
    <Draggable
      key={project.id}
      draggableId={`project-${project.id}`}
      index={index}
    >
      {(
        dragProvided: DraggableProvided,
        dragSnapshot: DraggableStateSnapshot
      ) => (
        <Container
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          isSelected={selectedProject == project.id}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          style={getStyle(dragProvided, style)}
          data-is-dragging={dragSnapshot.isDragging}
          data-testid={`project-${project.id}`}
          data-index={index}
          aria-label={`project ${project.title}`}
          onClick={handleClick}
          css={taskContainerStyles}
        >
          <Content>
            <TextContent>{project.title}</TextContent>
            {/* <TaskDueDate dueDate={project} />
            <TaskLabels project={project} /> */}
            <TaskFooter project={project} />
          </Content>
        </Container>
      )}
    </Draggable>
  );
};

export default React.memo<Props>(Project);
