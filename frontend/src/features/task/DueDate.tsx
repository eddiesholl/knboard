import React from "react";
import styled from "@emotion/styled";
import { format } from "date-fns";
import { differenceInCalendarDays } from "date-fns/esm";

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
  dateString: string | null;
}

const DueDate = ({ dateString }: Props) => {
  if (dateString == null) {
    return null;
  }

  const dueDate = new Date(dateString);
  const distance = differenceInCalendarDays(new Date(), dueDate);
  const opacity = Math.max(Math.min(7, distance + 7), 0) / 7;
  const expired = distance >= 0;
  const content =
    distance == 0
      ? "Today"
      : distance == 1
      ? "1 day ago"
      : distance > 1
      ? `${distance} days ago`
      : distance == -1
      ? "1 day left"
      : distance > -7
      ? `${-distance} days left`
      : format(dueDate, "dd-MM-yyyy");

  return (
    <Container opacity={opacity} expired={expired}>
      {content}
    </Container>
  );
};

export default DueDate;
