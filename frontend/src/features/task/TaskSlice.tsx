import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { TasksByColumn, ITask, Id, NewTask, PriorityValue } from "types";
import { fetchBoardById } from "features/board/BoardSlice";
import { AppDispatch, AppThunk, RootState } from "store";
import {
  createErrorToast,
  createSuccessToast,
  createInfoToast,
} from "features/toast/ToastSlice";
import api, { API_SORT_TASKS, API_TASKS } from "api";
import { addColumn, deleteColumn } from "features/column/ColumnSlice";
import { deleteLabel } from "features/label/LabelSlice";
import { removeBoardMember } from "features/member/MemberSlice";

const priorityToSortValue = (p: PriorityValue) =>
  p == "H" ? 3 : p == "M" ? 2 : 1;

const sortTasks = (ta: ITask, tb: ITask) => {
  const va = priorityToSortValue(ta.priority);
  const vb = priorityToSortValue(tb.priority);

  return vb - va;
};

const sortTasksInColumn = (tasksToSort: ITask[]) => {
  return tasksToSort.sort(sortTasks).map((task) => task.id);
};

type TasksById = Record<string, ITask>;
type TasksByParent = Record<string, Id[]>;

interface InitialState {
  byColumn: TasksByColumn;
  byId: TasksById;
  byParent: TasksByParent;
  createLoading: boolean;
  createDialogOpen: boolean;
  createDialogColumn: Id | null;
  editDialogOpen: Id | null;
}

export const initialState: InitialState = {
  byColumn: {},
  byId: {},
  byParent: {},
  createLoading: false,
  createDialogOpen: false,
  createDialogColumn: null,
  editDialogOpen: null,
};

interface PatchFields {
  title: string;
  description: string;
  priority: PriorityValue;
  labels: Id[];
  assignees: Id[];
  due_date: string | null;
  project: Id | null;
  parent_task: Id | null;
}

export const patchTask = createAsyncThunk<
  ITask,
  { id: Id; fields: Partial<PatchFields> }
>("task/patchTaskStatus", async ({ id, fields }) => {
  const response = await api.patch(`${API_TASKS}${id}/`, fields);
  return response.data;
});

interface CreateTaskResponse extends ITask {
  column: Id;
}

export const createTask = createAsyncThunk<
  CreateTaskResponse,
  NewTask,
  {
    rejectValue: string;
  }
>("task/createTaskStatus", async (task, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.post(`${API_TASKS}`, task);
    dispatch(createSuccessToast("Task created"));
    return response.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteTask = createAsyncThunk<Id, Id>(
  "task/deleteTaskStatus",
  async (id, { dispatch }) => {
    await api.delete(`${API_TASKS}${id}/`);
    dispatch(createInfoToast("Task deleted"));
    return id;
  }
);

const buildTasksByParent = (tasks: TasksById): TasksByParent => {
  const byParent: TasksByParent = {};

  Object.values(tasks).forEach((task) => {
    const parentOfThisTask = task.parent_task;
    if (parentOfThisTask != null) {
      const parentList = byParent[parentOfThisTask];
      if (!parentList) {
        byParent[parentOfThisTask] = [task.id];
      } else {
        parentList.push(task.id);
      }
    }
  });

  return byParent;
};

export const slice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasksByColumn: (state, action: PayloadAction<TasksByColumn>) => {
      state.byColumn = action.payload;
    },
    setCreateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.createDialogOpen = action.payload;
    },
    setCreateDialogColumn: (state, action: PayloadAction<Id>) => {
      state.createDialogColumn = action.payload;
    },
    setEditDialogOpen: (state, action: PayloadAction<Id | null>) => {
      state.editDialogOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardById.fulfilled, (state, action) => {
      const byColumn: TasksByColumn = {};
      const byId: TasksById = {};
      for (const col of action.payload.columns) {
        for (const task of col.tasks) {
          byId[task.id] = task;
        }
        byColumn[col.id] = col.tasks.map((t) => t.id);
      }
      state.byColumn = byColumn;
      state.byId = byId;
      state.byParent = buildTasksByParent(byId);
    });
    builder.addCase(patchTask.fulfilled, (state, action) => {
      state.byId[action.payload.id] = action.payload;
      state.byParent = buildTasksByParent(state.byId);
    });
    builder.addCase(createTask.pending, (state) => {
      state.createLoading = true;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.byId[action.payload.id] = action.payload;

      const existingTaskIdsForColumn = state.byColumn[action.payload.column];
      const taskIdsWithNewTask = existingTaskIdsForColumn.concat(
        action.payload.id
      );
      state.byColumn[action.payload.column] = sortTasksInColumn(
        taskIdsWithNewTask.map((taskId) => state.byId[taskId])
      );
      state.byParent = buildTasksByParent(state.byId);
      state.createDialogOpen = false;
      state.createLoading = false;
    });
    builder.addCase(createTask.rejected, (state) => {
      state.createLoading = false;
    });
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      for (const [column, tasks] of Object.entries(state.byColumn)) {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i] === action.payload) {
            state.byColumn[column].splice(i, 1);
          }
        }
      }
      delete state.byId[action.payload];
      state.byParent = buildTasksByParent(state.byId);
    });
    builder.addCase(addColumn.fulfilled, (state, action) => {
      state.byColumn[action.payload.id] = [];
    });
    builder.addCase(deleteColumn.fulfilled, (state, action) => {
      delete state.byColumn[action.payload];
    });
    builder.addCase(deleteLabel.fulfilled, (state, action) => {
      const deletedLabelId = action.payload;
      for (const taskId in state.byId) {
        const task = state.byId[taskId];
        task.labels = task.labels.filter(
          (labelId) => labelId !== deletedLabelId
        );
      }
    });
    builder.addCase(removeBoardMember, (state, action) => {
      const deletedMemberId = action.payload;
      for (const taskId in state.byId) {
        const task = state.byId[taskId];
        task.assignees = task.assignees.filter(
          (assigneeId) => assigneeId !== deletedMemberId
        );
      }
    });
  },
});

export const {
  setTasksByColumn,
  setCreateDialogOpen,
  setCreateDialogColumn,
  setEditDialogOpen,
} = slice.actions;

export const updateTasksByColumn = (
  tasksByColumn: TasksByColumn
): AppThunk => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const previousTasksByColumn = state.task.byColumn;
  const tasksById = state.task.byId;
  const boardId = state.board.detail?.id;

  const sortedTasksByColumn: TasksByColumn = {};
  Object.keys(sortedTasksByColumn).forEach((columnId) => {
    const sortedtaskIds = sortTasksInColumn(
      tasksByColumn[columnId].map((id) => tasksById[id])
    );
    sortedTasksByColumn[columnId] = sortedtaskIds;
  });

  try {
    dispatch(setTasksByColumn(sortedTasksByColumn));
    await api.post(API_SORT_TASKS, {
      board: boardId,
      tasks: sortedTasksByColumn,
      order: Object.values(tasksByColumn).flat(),
    });
  } catch (err) {
    dispatch(setTasksByColumn(previousTasksByColumn));
    dispatch(createErrorToast(err.toString()));
  }
};

export default slice.reducer;
