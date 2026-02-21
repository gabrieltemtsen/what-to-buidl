import ideas from '@/data/ideas.json';

export type Idea = {
  id: number;
  title: string;
  description: string;
  why_now: string;
  suggested_stack: string;
  difficulty: string;
  time_estimate: string;
  track: string;
};

export const allIdeas = ideas as Idea[];
