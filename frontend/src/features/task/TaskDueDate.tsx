import React from "react";
import { ITask } from "types";
import styled from "@emotion/styled";
import { format } from "date-fns";
import differenceInDays from "date-fns/differenceInDays";

interface ContainerProps {
  opacity: number;
  expired: boolean;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-wrap: wrap;
  margin-top: 2px;
  align-self: flex-start;
  background-color: ${(props) => `rgba(255, 170, 170, ${props.opacity})`};
  border-radius: 4px;
  padding-left: 3px;
  padding-right: 3px;
  font-size: 0.8rem;
  border-color: rgb(220, 100, 100);
  border-width: 2px;
  border-style: ${(props) => (props.expired ? "solid" : "none")};
`;

interface Props {
  task: ITask;
}

const TaskDueDate = ({ task }: Props) => {
  if (task.due_date == null) {
    return null;
  }

  const dueDate = new Date(task.due_date);
  const distance = differenceInDays(dueDate, new Date());
  const opacity = Math.max(Math.min(7, distance + 7), 0) / 7;
  const expired = distance >= 0;

  return (
    <Container opacity={opacity} expired={expired}>
      {format(new Date(task.due_date), "dd-MM-yyyy")}
    </Container>
  );
};

export default TaskDueDate;
