/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Button } from "@material-ui/core";
import { N80A, N900 } from "utils/colors";
import { Id } from "types";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { css } from "@emotion/core";
import { useDispatch } from "react-redux";
import { setCreateDialogOpen } from "./ProjectSlice";

const AddProject = () => {
  const dispatch = useDispatch();

  const handleOnClick = () => {
    dispatch(setCreateDialogOpen(true));
  };

  return (
    <Button
      css={css`
        text-transform: inherit;
        color: ${N80A};
        padding: 4px 0;
        margin-top: 6px;
        margin-bottom: 6px;
        &:hover {
          color: ${N900};
        }
        &:focus {
          outline: 2px solid #aaa;
        }
        .MuiButton-iconSizeMedium > *:first-of-type {
          font-size: 12px;
        }
      `}
      startIcon={<FontAwesomeIcon icon={faPlus} />}
      onClick={handleOnClick}
      fullWidth
    >
      Add another project
    </Button>
  );
};

export default AddProject;
