import React from "react";
import styled from "@emotion/styled";
import { RootState } from "store";
import { useSelector, useDispatch } from "react-redux";
import { barHeight } from "const";
import { AvatarGroup } from "@material-ui/lab";
import { css } from "@emotion/core";
import { avatarStyles } from "styles";
import MemberInvite from "features/member/MemberInvite";
import MemberDetail from "features/member/MemberDetail";
import MemberDialog from "features/member/MemberDialog";
import { currentBoardOwner } from "./BoardSlice";
import CreateTaskDialog from "features/task/CreateTaskDialog";
import EditTaskDialog from "features/task/EditTaskDialog";
import CreateProjectDialog from "features/project/CreateProjectDialog";
import EditProjectDialog from "features/project/EditProjectDialog";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import { PRIMARY } from "utils/colors";
import { addColumn } from "features/column/ColumnSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen } from "@fortawesome/free-solid-svg-icons";
import { setDialogOpen } from "features/label/LabelSlice";
import LabelDialog from "features/label/LabelDialog";
import { useHistory, useParams, Link } from "react-router-dom";
import {
  selectAllMembers,
  setMemberListOpen,
} from "features/member/MemberSlice";
import MemberListDialog from "features/member/MemberList";
import BoardFilter from "./BoardFilter";

const Container = styled.div`
  height: ${barHeight}px;
  display: flex;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  font-weight: bold;
  font-size: 1.25rem;
`;

// const FormControl = styled.div`
//   min-width: 120px;
// `;

const Items = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  white-space: nowrap;
  display: flex;
  margin-right: 1rem;
`;

const Right = styled.div`
  white-space: nowrap;
`;

const Name = styled.div`
  color: #6869f6;
`;

const nameStyles = styled.div`
  color: #6869f6;
`;

const buttonStyles = css`
  color: ${PRIMARY};
  .MuiButton-iconSizeSmall > *:first-of-type {
    font-size: 12px;
  }
`;

const switchOutlineStyles = css`
  min-width: 120px;
  max-height: 40px;
  overflow: hidden;
`;
const switchLabelStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(10px, 12px);
  color: #6869f6;
`;
const switchSelectStyles = css`
  padding: 0px;
`;

const BoardBar = () => {
  const dispatch = useDispatch();
  const members = useSelector(selectAllMembers);
  const error = useSelector((state: RootState) => state.board.detailError);
  const detail = useSelector((state: RootState) => state.board.detail);
  const boards = useSelector((state: RootState) => state.board.all);
  const boardOwner = useSelector(currentBoardOwner);
  const { id } = useParams();
  const history = useHistory();
  const detailDataExists = detail?.id.toString() === id;

  if (!detailDataExists || error || !detail) {
    return null;
  }

  const handleAddColumn = () => {
    dispatch(addColumn(detail.id));
  };

  const handleEditLabels = () => {
    dispatch(setDialogOpen(true));
  };

  const handleBoardSwitch = (event: React.ChangeEvent<{ value: any }>) => {
    console.log(event.target.value);
    history.push(`/b/${event.target.value}`);
    // return null;
  };

  return (
    <Container>
      <Items>
        <Left>
          <FormControl variant="outlined" css={switchOutlineStyles}>
            {/* <InputLabel
              htmlFor="outlined-age-native-simple"
              id="demo-simple-select-label"
            > */}
            {/* <label
              htmlFor="outlined-age-native-simple"
              id="demo-simple-select-label"
              css={switchLabelStyles}
            >
              {detail.name}
            </label> */}
            {/* </InputLabel> */}
            {/* <Name id="demo-simple-select-label">{detail.name}</Name> */}
            <Select
              // native
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={id}
              onChange={handleBoardSwitch}
              css={switchSelectStyles}
              inputProps={{
                name: "age",
                id: "outlined-age-native-simple",
              }}
            >
              {/* <MenuItem key={"foo"} value={"bar"}>
                baz
              </MenuItem>
              <MenuItem key={"fooa"} value={"bara"}>
                baza
              </MenuItem>
              <div>{boards.length}</div> */}

              {boards.map((board) => {
                return (
                  <MenuItem key={board.id} value={board.id}>
                    <Name>{board.name}</Name>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <AvatarGroup
            max={3}
            data-testid="member-group"
            css={css`
              margin-left: 1.5rem;
              & .MuiAvatarGroup-avatar {
                ${avatarStyles}
                border: none;
              }
              &:hover {
                cursor: pointer;
              }
            `}
            onClick={(e: any) => {
              if (e.target.classList.contains("MuiAvatarGroup-avatar")) {
                dispatch(setMemberListOpen(true));
              }
            }}
          >
            {members.map((member) => (
              <MemberDetail
                key={member.id}
                member={member}
                isOwner={detail.owner === member.id}
              />
            ))}
          </AvatarGroup>
        </Left>
        <BoardFilter />
        <Right>
          <Button
            size="small"
            css={css`
              ${buttonStyles}
              margin-right: 0.5rem;
            `}
            onClick={handleEditLabels}
            startIcon={<FontAwesomeIcon icon={faPen} />}
            data-testid="open-labels-dialog"
          >
            Edit labels
          </Button>
          <Button
            size="small"
            css={css`
              ${buttonStyles}
            `}
            onClick={handleAddColumn}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            data-testid="add-col"
          >
            Add List
          </Button>
        </Right>
      </Items>
      <MemberDialog board={detail} />
      <MemberListDialog />
      <EditTaskDialog />
      <CreateTaskDialog />
      <EditProjectDialog />
      <CreateProjectDialog />
      <LabelDialog />
    </Container>
  );
};

export default BoardBar;
