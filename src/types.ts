export interface JourneyStage {
  id: string;
  title: string;
  description: string;
  stage_order: number;
  icon_name: string;
  color_theme: string;
  estimated_timeframe: string | null;
  created_at: string;
}

export interface JourneyTask {
  id: string;
  stage_id: string;
  title: string;
  description: string;
  task_order: number;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface StageWithTasks extends JourneyStage {
  tasks: JourneyTask[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  unlocked: boolean;
  unlocked_at: string | null;
}
