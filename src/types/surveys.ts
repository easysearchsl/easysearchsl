export type UUID = string;

export type SurveyType = 'poll' | 'survey';
export type SurveyVisibility = 'public' | 'private';
export type QuestionType =
  | 'short_answer'
  | 'long_answer'
  | 'multiple_choice'
  | 'dropdown'
  | 'checkboxes'
  | 'rating'
  | 'linear_scale'
  | 'multiple_choice_grid'
  | 'checkbox_grid';

export interface Survey {
  id: UUID;
  organization_id?: UUID | null;
  listing_id?: UUID | null;
  created_by?: UUID | null;
  title: string;
  description?: string | null;
  type: SurveyType;
  is_anonymous: boolean;
  visibility: SurveyVisibility;
  status: 'active' | 'inactive';
  expires_at?: string | null; // ISO
  created_at: string; // ISO
}

export interface SurveyQuestion {
  id: UUID;
  survey_id: UUID;
  question_text: string;
  question_type: QuestionType;
  options?: any | null; // JSON for choices/grids
  min_scale?: number | null;
  max_scale?: number | null;
  sort_order?: number | null;
}

export interface SurveyResponse {
  id: UUID;
  survey_id: UUID;
  user_id?: UUID | null;
  created_at: string; // ISO
  answers: Record<string, any>; // keyed by question_id
}

// Local editor shape for building questions in the UI
export interface EditQuestion {
  id: string; // local temp id
  question_text: string;
  question_type: QuestionType;
  // For choice types
  choices: string[];
  // For grids
  rows: string[];
  columns: string[];
  // For scales
  min_scale?: number;
  max_scale?: number;
}
