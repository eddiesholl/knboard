import { IProject, Id, NewProject, PriorityValue } from "types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBoardById } from "features/board/BoardSlice";
import api, { API_PROJECTS } from "api";
import { createSuccessToast, createInfoToast } from "features/toast/ToastSlice";
import { PROJECT_NO_PROJECT_ID } from "const";

type ProjectsById = Record<string, IProject>;

interface InitialState {
  byId: ProjectsById;
  createDialogOpen: boolean;
  editDialogOpen: Id | null;
  selectedProject: Id | null;
}

const noProject: IProject = {
  id: PROJECT_NO_PROJECT_ID,
  created: "",
  modified: "",
  title: "Tasks with no project",
  description: "",
  labels: [],
  priority: "M",
  // eslint-disable-next-line @typescript-eslint/camelcase
  due_date: null,
};

export const initialState: InitialState = {
  byId: {
    [PROJECT_NO_PROJECT_ID]: noProject,
  },
  createDialogOpen: false,
  editDialogOpen: null,
  selectedProject: null,
};

interface CreateProjectResponse extends IProject {
  column: Id;
}

interface PatchFields {
  title: string;
  description: string;
  priority: PriorityValue;
  labels: Id[];
  due_date: string | null;
}

export const patchProject = createAsyncThunk<
  IProject,
  { id: Id; fields: Partial<PatchFields> }
>("project/patchProjectStatus", async ({ id, fields }) => {
  const response = await api.patch(`${API_PROJECTS}${id}/`, fields);
  return response.data;
});

export const createProject = createAsyncThunk<
  CreateProjectResponse,
  NewProject,
  {
    rejectValue: string;
  }
>(
  "project/createProjectStatus",
  async (project, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`${API_PROJECTS}`, project);
      dispatch(createSuccessToast("Project created"));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteProject = createAsyncThunk<Id, Id>(
  "project/deleteProjectStatus",
  async (id, { dispatch }) => {
    await api.delete(`${API_PROJECTS}${id}/`);
    dispatch(createInfoToast("Project deleted"));
    return id;
  }
);

export const slice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setEditDialogOpen: (state, action: PayloadAction<Id | null>) => {
      state.editDialogOpen = action.payload;
    },
    changeProjectSelection: (state, action: PayloadAction<Id | null>) => {
      const newProjectSelection = action.payload;
      if (newProjectSelection == state.selectedProject) {
        state.editDialogOpen = newProjectSelection;
      } else {
        state.editDialogOpen = null;
      }
      state.selectedProject = newProjectSelection;
    },
    setCreateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.createDialogOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardById.fulfilled, (state, action) => {
      const byId: ProjectsById = {
        [PROJECT_NO_PROJECT_ID]: noProject,
      };
      for (const p of action.payload.projects) {
        byId[p.id] = p;
      }
      state.byId = byId;
    });
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.byId[action.payload.id] = action.payload;
      state.createDialogOpen = false;
    });
    builder.addCase(patchProject.fulfilled, (state, action) => {
      state.byId[action.payload.id] = action.payload;
    });
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      delete state.byId[action.payload];
    });
  },
});

export const {
  changeProjectSelection,
  setEditDialogOpen,
  setCreateDialogOpen,
} = slice.actions;

export default slice.reducer;
