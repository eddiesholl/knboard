import { PriorityValue } from "types";
import differenceInDays from "date-fns/differenceInDays";

export interface ISortable {
  priority: PriorityValue;
  due_date: string | null;
}

const DUE_DATE_IGNORE_DAYS = 10;
const projectDueInOrIgnore = (project: ISortable) =>
  project.due_date == null
    ? DUE_DATE_IGNORE_DAYS
    : differenceInDays(new Date(project.due_date), new Date());

const priorityToSortValue = (p: PriorityValue) =>
  p == "H" ? 3 : p == "M" ? 2 : 1;

export const byDueAndPriority = (a: ISortable, b: ISortable): number => {
  const aDueIn = projectDueInOrIgnore(a);
  const bDueIn = projectDueInOrIgnore(b);

  if (aDueIn < DUE_DATE_IGNORE_DAYS) {
    if (bDueIn > aDueIn) {
      return -1;
    } else if (bDueIn < aDueIn && bDueIn < DUE_DATE_IGNORE_DAYS) {
      return 1;
    }
  } else if (bDueIn < DUE_DATE_IGNORE_DAYS) {
    return 1;
  }

  const priorityA = priorityToSortValue(a.priority);
  const priorityB = priorityToSortValue(b.priority);

  return priorityB - priorityA;
};
