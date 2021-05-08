export interface Task {
  task_id: number;
  user_id: number;
  task_title: string;
  duration: number;
  priority: number;
  category_id: number;
  constraints: any;
}
