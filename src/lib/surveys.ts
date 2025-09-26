import { supabase } from '@/lib/supabase';
import type { EditQuestion, QuestionType, Survey, SurveyQuestion, SurveyVisibility, SurveyType, UUID, SurveyResponse } from '@/types/surveys';

export type CreateSurveyInput = {
  organization_id?: UUID | null;
  listing_id?: UUID | null;
  created_by: UUID; // must match auth.uid() due to RLS
  title: string;
  description?: string | null;
  type: SurveyType; // 'poll' | 'survey'
  is_anonymous: boolean;
  visibility: SurveyVisibility; // 'public' | 'private'
  status: 'active' | 'inactive';
  expires_at?: string | null; // ISO datetime
  questions: EditQuestion[];
};

function normalizeQuestionPayload(q: EditQuestion) {
  const base = {
    question_text: q.question_text,
    question_type: q.question_type as QuestionType,
    sort_order: 0,
  } as any;
  switch (q.question_type) {
    case 'multiple_choice':
    case 'dropdown':
    case 'checkboxes':
      base.options = (q.choices || []).filter(Boolean);
      break;
    case 'multiple_choice_grid':
    case 'checkbox_grid':
      base.options = { rows: (q.rows || []).filter(Boolean), columns: (q.columns || []).filter(Boolean) };
      break;
    case 'rating':
    case 'linear_scale':
      base.min_scale = q.min_scale ?? 1;
      base.max_scale = q.max_scale ?? 5;
      break;
    default:
      // short/long answer: no options
      break;
  }
  return base;
}

export async function createSurvey(input: CreateSurveyInput): Promise<{ ok: boolean; id?: UUID; error?: string }> {
  try {
    // Insert survey
    const { questions, ...surveyFields } = input;
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .insert([surveyFields])
      .select('*')
      .single();

    if (surveyError || !surveyData) return { ok: false, error: surveyError?.message || 'Failed to create survey' };

    const surveyId = surveyData.id as UUID;

    // Insert questions (if any)
    const payload = (questions || []).map((q, idx) => ({
      survey_id: surveyId,
      ...normalizeQuestionPayload(q),
      sort_order: idx,
    }));

    if (payload.length > 0) {
      const { error: qErr } = await supabase.from('survey_questions').insert(payload);
      if (qErr) return { ok: false, error: qErr.message };
    }

    return { ok: true, id: surveyId };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'createSurvey failed' };
  }
}

// List surveys/polls created by the current user (DB-backed)
export async function listMySurveys(userId: UUID): Promise<Survey[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as Survey[];
  } catch {
    return [];
  }
}

// Get response count for a survey (fast count-only query)
export async function getSurveyResponsesCount(survey_id: UUID): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', survey_id);
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

// Fetch all responses (for export/analysis)
export async function getSurveyResponses(survey_id: UUID): Promise<SurveyResponse[]> {
  try {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', survey_id)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as SurveyResponse[];
  } catch {
    return [];
  }
}

export async function deleteSurvey(id: UUID): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('surveys').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'delete failed' };
  }
}

export async function updateSurveyStatus(id: UUID, status: 'active' | 'inactive'): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('surveys').update({ status }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'update failed' };
  }
}

export async function submitSurveyResponse(survey_id: UUID, answers: Record<string, any>, user_id?: UUID | null) {
  try {
    const { error } = await supabase.from('survey_responses').insert([{ survey_id, user_id: user_id || null, answers }]);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'submitSurveyResponse failed' };
  }
}

export async function getSurveyWithQuestions(id: UUID): Promise<{ survey: Survey; questions: SurveyQuestion[] } | null> {
  try {
    const { data: survey, error: sErr } = await supabase.from('surveys').select('*').eq('id', id).single();
    if (sErr || !survey) return null;
    const { data: questions, error: qErr } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', id)
      .order('sort_order', { ascending: true });
    if (qErr) return { survey: survey as Survey, questions: [] };
    return { survey: survey as Survey, questions: (questions || []) as SurveyQuestion[] };
  } catch {
    return null;
  }
}

export async function listPublicActiveSurveys(): Promise<Survey[]> {
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('visibility', 'public')
      .eq('status', 'active')
      // either no expiry or in the future
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as Survey[];
  } catch {
    return [];
  }
}
