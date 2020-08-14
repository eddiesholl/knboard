/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { TextField } from "@material-ui/core";
import { Label } from "types";
import { SerializedStyles, css } from "@emotion/core";
import { useSelector } from "react-redux";
import { Autocomplete } from "@material-ui/lab";
import {
  selectAllLabels,
  selectLabelEntities,
} from "features/label/LabelSlice";
import LabelChip from "components/LabelChip";

interface Props {
  selectedLabels: number[];
  handleLabelsChange: (newLabels: Label[]) => void;
  customCss?: SerializedStyles;
}

const LabelChooser = ({
  selectedLabels,
  handleLabelsChange,
  customCss,
}: Props) => {
  const labels = useSelector(selectAllLabels);
  const labelsById = useSelector(selectLabelEntities);

  return (
    <Autocomplete
      multiple
      id="labels-select"
      data-testid="edit-labels"
      size="small"
      filterSelectedOptions
      autoHighlight
      openOnFocus
      blurOnSelect
      disableClearable
      options={labels}
      getOptionLabel={(option) => option.name}
      value={selectedLabels.map((labelId) => labelsById[labelId]) as Label[]}
      onChange={(_, newLabels) => handleLabelsChange(newLabels)}
      renderInput={(params) => (
        <TextField {...params} label="Labels" variant="outlined" />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <LabelChip
            key={option.id}
            label={option}
            size="small"
            {...getTagProps({ index })}
          />
        ))
      }
      renderOption={(option) => <LabelChip label={option} size="small" />}
      css={customCss}
    />
  );
};

export default LabelChooser;
