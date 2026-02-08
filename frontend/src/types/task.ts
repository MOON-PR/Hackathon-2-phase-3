export interface Task {
  id: string;
  description: string;
  completed: boolean;
  category: string;
  priority: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  description: string;
  category?: string;
  priority?: string;
  tags?: string[];
}

export interface TaskUpdate {
  description?: string;
  completed?: boolean;
  category?: string;
  priority?: string;
  tags?: string[];
}