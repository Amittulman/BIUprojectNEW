export interface Task {
  taskID: number;
  userId: number;
  title: string;
  duration: number;
  priority: number;
  categoryID: number;
  constraints: string;
}
