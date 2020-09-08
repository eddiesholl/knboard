import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  Button,
  TextField,
  TextareaAutosize,
  useTheme,
  useMediaQuery,
  WithTheme,
} from "@material-ui/core";
import { RootState } from "store";
import { useSelector, useDispatch } from "react-redux";
import {
  setEditDialogOpen,
  closeProject,
  deleteProject,
  patchProject,
} from "./ProjectSlice";
import styled from "@emotion/styled";
import { css } from "@emotion/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faLock,
  faAlignLeft,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import { PRIMARY, TASK_G } from "utils/colors";
import { Priority, Label } from "types";
import { Autocomplete } from "@material-ui/lab";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { createMdEditorStyles, descriptionStyles } from "styles";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import {
  MD_EDITOR_PLUGINS,
  borderRadius,
  PRIORITY_OPTIONS,
  PRIORITY_MAP,
  MD_EDITING_CONFIG,
  MD_READ_ONLY_CONFIG,
  Key,
  taskDialogHeight,
  taskSideWidth,
} from "const";
import Close from "components/Close";
import {
  selectAllLabels,
  selectLabelEntities,
} from "features/label/LabelSlice";
import { formatDistanceToNow, format } from "date-fns";
import { getSaveShortcutLabel } from "utils/shortcuts";
import LabelChip from "components/LabelChip";
import PriorityOption from "components/PriorityOption";

const mdParser = new MarkdownIt({ breaks: true });

const Content = styled.div<WithTheme>`
  display: flex;
  padding: 2rem;
  height: ${taskDialogHeight}px;
  ${(props) => props.theme.breakpoints.down("xs")} {
    flex-direction: column;
  }
`;

const Main = styled.div`
  width: 100%;
`;

const Side = styled.div<WithTheme>`
  margin-top: 2rem;
  ${(props) => props.theme.breakpoints.up("sm")} {
    max-width: ${taskSideWidth}px;
    min-width: ${taskSideWidth}px;
  }
`;

const Header = styled.div`
  color: ${TASK_G};
  height: 2rem;
  h3 {
    margin: 0 0.25rem 0 0;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: ${PRIMARY};
  font-size: 1rem;
  textarea {
    color: ${PRIMARY};
    font-weight: bold;
    font-size: 20px;
    width: 100%;
    margin: 0 2rem 0 0.375rem;
    border: none;
    resize: none;
    &:focus {
      outline: none;
      border-radius: ${borderRadius}px;
      box-shadow: inset 0 0 0 2px ${PRIMARY};
    }
  }
`;

const EditorWrapper = styled.div<WithTheme & { editing: boolean }>`
  margin: 1rem 0;
  margin-right: 2rem;
  ${(props) => createMdEditorStyles(props.editing)};

  .rc-md-editor {
    min-height: ${(props) => (props.editing ? 180 : 32)}px;
    border: none;
    .section-container {
      ${(props) =>
        props.editing &&
        `
        outline: none;
        box-shadow: inset 0 0 0 2px ${PRIMARY};
      `};
      padding: ${(props) => (props.editing ? "8px" : "0px")} !important;
      &.input {
        line-height: 20px;
      }
    }
  }
`;

const DescriptionHeader = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0 0 0 12px;
  }
`;

const Description = styled.div`
  ${descriptionStyles}
`;

const DescriptionActions = styled.div`
  display: flex;
`;

const Text = styled.p`
  color: #626e83;
  margin: 4px 0;
  font-size: 12px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const DESCRIPTION_PLACEHOLDER = "Write here...";

const EditProjectDialog = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const labels = useSelector(selectAllLabels);
  const labelsById = useSelector(selectLabelEntities);
  const projectId = useSelector(
    (state: RootState) => state.project.editDialogOpen
  );
  // const tasksById = useSelector((state: RootState) => state.task.byId);
  const projectsById = useSelector((state: RootState) => state.project.byId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const titleTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MdEditor>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const xsDown = useMediaQuery(theme.breakpoints.down("xs"));
  const open = projectId !== null;

  useEffect(() => {
    if (projectId && projectsById[projectId]) {
      setDescription(projectsById[projectId].description);
      setTitle(projectsById[projectId].title);
      setDueDate(projectsById[projectId].due_date);
    }
  }, [open, projectId]);

  const handleSaveTitle = () => {
    if (projectId) {
      dispatch(patchProject({ id: projectId, fields: { title } }));
    }
  };

  const handleSaveDescription = () => {
    if (projectId) {
      dispatch(patchProject({ id: projectId, fields: { description } }));
      setEditingDescription(false);
    }
  };

  const handleCancelDescription = () => {
    if (projectId && projectsById[projectId]) {
      setDescription(projectsById[projectId].description);
      setEditingDescription(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        cancelRef.current &&
        !cancelRef.current?.contains(event.target)
      ) {
        handleSaveDescription();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, projectId, description]);

  useEffect(() => {
    if (editingDescription && editorRef && editorRef.current) {
      editorRef.current.setSelection({
        start: 0,
        end: description.length,
      });
    }
  }, [editingDescription]);

  if (!projectId || !projectsById[projectId]) {
    return null;
  }

  const project = projectsById[projectId];

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode == Key.Enter && e.metaKey) {
      handleSaveDescription();
    }
    if (e.keyCode === Key.Escape) {
      // Prevent propagation from reaching the Dialog
      e.stopPropagation();
      handleCancelDescription();
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === Key.Enter) {
      e.preventDefault();
      titleTextAreaRef?.current?.blur();
    }
    if (e.keyCode === Key.Escape) {
      // Prevent propagation from reaching the Dialog
      e.stopPropagation();
    }
  };

  const handleClose = () => {
    dispatch(setEditDialogOpen(null));
    setEditingDescription(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handlePriorityChange = (_: any, priority: Priority | null) => {
    if (priority) {
      dispatch(
        patchProject({ id: projectId, fields: { priority: priority.value } })
      );
    }
  };

  const handleCloseProject = () => {
    if (window.confirm("Are you sure you are ready to close this project?")) {
      dispatch(closeProject(project.id));
      handleClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure? Deleting a project cannot be undone.")) {
      dispatch(deleteProject(project.id));
      handleClose();
    }
  };

  const handleDescriptionClick = () => {
    setEditingDescription(true);
  };

  const handleEditorChange = ({ text }: any) => {
    setDescription(text);
  };

  const handleLabelsChange = (newLabels: Label[]) => {
    dispatch(
      patchProject({
        id: projectId,
        fields: { labels: newLabels.map((label) => label.id) },
      })
    );
  };

  const handleDateChange = (date: MaterialUiPickersDate) => {
    if (date != null && date.toString() == "Invalid Date") {
      return;
    }

    const dateString =
      date == null ? null : format(new Date(date), "yyyy-MM-dd");

    setDueDate(dateString);
    // eslint-disable-next-line @typescript-eslint/camelcase
    dispatch(patchProject({ id: projectId, fields: { due_date: dateString } }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      keepMounted={false}
      fullScreen={xsDown}
      css={css`
        .MuiDialog-paper {
          max-width: 768px;
        }
      `}
    >
      <Content theme={theme}>
        <Close onClose={handleClose} />
        <Main>
          <Header>id: {project.id}</Header>
          <Title>
            <FontAwesomeIcon icon={faCube} />
            <TextareaAutosize
              ref={titleTextAreaRef}
              value={title}
              onChange={handleTitleChange}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              data-testid="project-title"
            />
          </Title>
          <DescriptionHeader>
            <FontAwesomeIcon icon={faAlignLeft} />
            <h3>Description</h3>
          </DescriptionHeader>
          <Description
            key={`${projectId}${editingDescription}`}
            data-testid="project-description"
          >
            <EditorWrapper
              onClick={editingDescription ? undefined : handleDescriptionClick}
              editing={editingDescription}
              ref={wrapperRef}
              theme={theme}
              onKeyDown={handleEditorKeyDown}
            >
              <MdEditor
                ref={editorRef}
                plugins={MD_EDITOR_PLUGINS}
                config={
                  editingDescription ? MD_EDITING_CONFIG : MD_READ_ONLY_CONFIG
                }
                value={
                  editingDescription
                    ? description
                    : description || DESCRIPTION_PLACEHOLDER
                }
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                placeholder={DESCRIPTION_PLACEHOLDER}
              />
            </EditorWrapper>
            {editingDescription && (
              <DescriptionActions>
                <Button
                  variant="contained"
                  data-testid="save-description"
                  onClick={handleSaveDescription}
                  color="primary"
                  size="small"
                >
                  Save {getSaveShortcutLabel()}
                </Button>
                <Button
                  variant="outlined"
                  data-testid="cancel-description"
                  onClick={handleCancelDescription}
                  ref={cancelRef}
                  size="small"
                  css={css`
                    margin-left: 0.5rem;
                  `}
                >
                  Cancel (Esc)
                </Button>
              </DescriptionActions>
            )}
          </Description>
        </Main>
        <Side theme={theme}>
          <Autocomplete
            id="priority-select"
            size="small"
            blurOnSelect
            autoHighlight
            options={PRIORITY_OPTIONS}
            getOptionLabel={(option) => option.label}
            value={PRIORITY_MAP[project.priority]}
            onChange={handlePriorityChange}
            renderInput={(params) => (
              <TextField {...params} label="Priority" variant="outlined" />
            )}
            renderOption={(option) => <PriorityOption option={option} />}
            openOnFocus
            disableClearable
            data-testid="edit-priority"
            css={css`
              width: 100%;
              margin-top: 1rem;
            `}
          />
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
            value={
              projectsById[projectId].labels.map(
                (labelId) => labelsById[labelId]
              ) as Label[]
            }
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
            css={css`
              width: 100%;
              margin-top: 1rem;
              margin-bottom: 2rem;
            `}
          />

          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="dd-MM-yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Due date"
              value={dueDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
          </MuiPickersUtilsProvider>

          <ButtonsContainer>
            <Button
              startIcon={<FontAwesomeIcon fixedWidth icon={faLock} />}
              onClick={handleCloseProject}
              size="small"
              css={css`
                font-size: 12px;
                font-weight: bold;
                color: ${TASK_G};
              `}
            >
              Close project
            </Button>
            <Button
              startIcon={<FontAwesomeIcon fixedWidth icon={faTrash} />}
              onClick={handleDelete}
              data-testid="delete-project"
              size="small"
              css={css`
                font-size: 12px;
                font-weight: bold;
                color: ${TASK_G};
                margin-bottom: 2rem;
              `}
            >
              Delete project
            </Button>
          </ButtonsContainer>
          <Text>
            Updated {formatDistanceToNow(new Date(project.modified))} ago
          </Text>
          <Text
            css={css`
              margin-bottom: 1rem;
            `}
          >
            Created {formatDistanceToNow(new Date(project.created))} ago
          </Text>
        </Side>
      </Content>
    </Dialog>
  );
};

export default EditProjectDialog;
