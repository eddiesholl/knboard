import React from "react";
import { Label } from "types";
import { useSelector } from "react-redux";
import LabelChip from "components/LabelChip";
import styled from "@emotion/styled";
import { selectLabelEntities } from "features/label/LabelSlice";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
`;

interface Props {
  labelIds: number[];
}

const TaskLabels = ({ labelIds }: Props) => {
  const labelsById = useSelector(selectLabelEntities);
  const labels = labelIds
    .map((labelId) => labelsById[labelId])
    .sort((a, b) =>
      a == undefined || b == undefined ? 0 : a.name.localeCompare(b.name)
    ) as Label[];

  return (
    <Container>
      {labels.map((label) => (
        <LabelChip key={label.id} label={label} onCard />
      ))}
    </Container>
  );
};

export default TaskLabels;
