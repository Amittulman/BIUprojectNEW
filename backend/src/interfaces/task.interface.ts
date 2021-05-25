export interface Task {
  task_id: number;
  user_id: number;
  task_title: string;
  duration: number;
  priority: number;
  category_id: number;
  constraints: number[][];
  recurrings: number;
  pinned_slot: number;

}
