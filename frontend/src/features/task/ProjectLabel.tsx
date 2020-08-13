import React from "react";
import { css } from "@emotion/core";
import { Y50, N100 } from "utils/colors";

interface Props {
  name: string | null;
}

const ProjectLabel = ({ name }: Props) => {
  if (!name == null) {
    return null;
  }

  return (
    <div
      css={css`
        background-color: ${Y50};
        align-self: flex-start;
        font-size: 0.6em;
        color: ${N100};
        padding: 3px;
        border-radius: 3px;
        margin-top: 3px;
      `}
    >
      {name}
    </div>
  );
};

export default ProjectLabel;
