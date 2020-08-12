import { TasksByColumn, IProject, Id, NewTask, PriorityValue } from "types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchBoardById } from "features/board/BoardSlice";

type ProjectsById = Record<string, IProject>;

interface InitialState {
  byId: ProjectsById;
  createDialogOpen: boolean;
  editDialogOpen: Id | null;
}

export const initialState: InitialState = {
  byId: {},
  createDialogOpen: false,
  editDialogOpen: null,
};

export const slice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setEditDialogOpen: (state, action: PayloadAction<Id | null>) => {
      state.editDialogOpen = action.payload;
    },
    setCreateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.createDialogOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardById.fulfilled, (state, action) => {
      const byId: ProjectsById = {};
      for (const p of action.payload.projects) {
        byId[p.id] = p;
      }
      state.byId = byId;
    });
  },
});

export const { setEditDialogOpen, setCreateDialogOpen } = slice.actions;

export default slice.reducer;
