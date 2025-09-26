import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/lib/supabase";
import { createSurvey } from "@/lib/surveys";
import type { EditQuestion, QuestionType } from "@/types/surveys";
import { useNavigate, useSearchParams } from "react-router-dom";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "short_answer", label: "Short Answer" },
  { value: "long_answer", label: "Long Answer" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "rating", label: "Rating Scale" },
  { value: "linear_scale", label: "Linear Scale" },
  { value: "multiple_choice_grid", label: "Multiple Choice Grid" },
  { value: "checkbox_grid", label: "Checkbox Grid" },
];

export default function SurveyBuilder() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrgId } = useTenant();
  const { role } = useRole();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [myListings, setMyListings] = useState<Array<{ id: string; title: string }>>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let q = supabase.from('listings').select('id, title, status, organization_id, created_by').eq('status', 'published');
        if (currentOrgId) q = q.eq('organization_id', currentOrgId);
        else if (role !== 'superadmin' && user?.id) q = q.eq('created_by', user.id);
        const { data, error } = await q.order('title');
        if (!error && Array.isArray(data)) {
          const opts = data.map((l: any) => ({ id: String(l.id), title: l.title || 'Listing' }));
          if (active) setMyListings(opts);
        } else if (active) setMyListings([]);
      } catch {
        if (active) setMyListings([]);
      }
    })();
    return () => { active = false; };
  }, [currentOrgId, role, user?.id]);

  // General Info state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"poll" | "survey">("survey");
  const [listingId, setListingId] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>(""); // datetime-local
  const [visibilityPrivate, setVisibilityPrivate] = useState(false); // false => public, true => private
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Questions state
  const [questions, setQuestions] = useState<EditQuestion[]>([]);

  useEffect(() => {
    // Respect ?type=poll|survey from URL
    const t = searchParams.get("type");
    if (t === "poll" || t === "survey") setType(t);
  }, [searchParams]);

  useEffect(() => {
    if (type === "poll") {
      // Ensure at least one multiple choice question scaffolded for polls
      if (questions.length === 0) {
        setQuestions([
          {
            id: `q_${Date.now()}`,
            question_text: "",
            question_type: "multiple_choice",
            choices: ["", ""],
            rows: [],
            columns: [],
            min_scale: 1,
            max_scale: 5,
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        question_text: "",
        question_type: "short_answer",
        choices: [],
        rows: [],
        columns: [],
        min_scale: 1,
        max_scale: 5,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, patch: Partial<EditQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const renderQuestionEditor = (q: EditQuestion, idx: number) => {
    return (
      <Card key={q.id}>
        <CardHeader>
          <CardTitle className="text-base">Question {idx + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Text</label>
              <Input
                value={q.question_text}
                onChange={(e) => updateQuestion(q.id, { question_text: e.target.value })}
                placeholder="Enter the question"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={q.question_type} onValueChange={(v) => updateQuestion(q.id, { question_type: v as QuestionType })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type-specific editors */}
          {(q.question_type === "multiple_choice" || q.question_type === "dropdown" || q.question_type === "checkboxes") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Choices</label>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => updateQuestion(q.id, { choices: [...(q.choices || []), ""] })}
                >
                  Add choice
                </Button>
              </div>
              <div className="space-y-2">
                {(q.choices || []).map((c, cidx) => (
                  <div key={cidx} className="flex items-center gap-2">
                    <Input
                      value={c}
                      onChange={(e) => {
                        const next = [...(q.choices || [])];
                        next[cidx] = e.target.value;
                        updateQuestion(q.id, { choices: next });
                      }}
                      placeholder={`Choice ${cidx + 1}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const next = [...(q.choices || [])];
                        next.splice(cidx, 1);
                        updateQuestion(q.id, { choices: next });
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(q.question_type === "rating" || q.question_type === "linear_scale") && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min scale</label>
                <Input
                  type="number"
                  value={q.min_scale ?? 1}
                  onChange={(e) => updateQuestion(q.id, { min_scale: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max scale</label>
                <Input
                  type="number"
                  value={q.max_scale ?? 5}
                  onChange={(e) => updateQuestion(q.id, { max_scale: Number(e.target.value) })}
                />
              </div>
            </div>
          )}

          {(q.question_type === "multiple_choice_grid" || q.question_type === "checkbox_grid") && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rows (one per line)</label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={(q.rows || []).join("\n")}
                  onChange={(e) => updateQuestion(q.id, { rows: e.target.value.split(/\r?\n/).filter(Boolean) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Columns (one per line)</label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={(q.columns || []).join("\n")}
                  onChange={(e) => updateQuestion(q.id, { columns: e.target.value.split(/\r?\n/).filter(Boolean) })}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={() => removeQuestion(q.id)}>
              Remove Question
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const onSubmit = async () => {
    const trimmedTitle = title.trim();
    // Require a real Supabase-authenticated user because DB expects UUID and RLS checks auth.uid()
    const { data: authData } = await supabase.auth.getUser();
    const sbUser = authData?.user || null;
    if (!sbUser?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in with Supabase auth to create polls/surveys.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedTitle) {
      toast({ title: "Title required", description: "Enter a title for this survey.", variant: "destructive" });
      return;
    }
    if (type === "poll") {
      // Polls must have one multiple-choice style question with >=2 choices
      const first = questions[0];
      const validChoices = (first?.choices || []).map((c) => c.trim()).filter(Boolean);
      if (!first || !(first.question_type === "multiple_choice" || first.question_type === "dropdown" || first.question_type === "checkboxes") || validChoices.length < 2) {
        toast({ title: "Add poll options", description: "Poll requires at least two options.", variant: "destructive" });
        return;
      }
    }

    const isUUID = (s: string | null | undefined) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
    const input = {
      organization_id: isUUID(currentOrgId) ? (currentOrgId as any) : null,
      listing_id: isUUID(listingId) ? (listingId as any) : null,
      created_by: sbUser.id as any,
      title: trimmedTitle,
      description: description.trim() || null,
      type,
      is_anonymous: isAnonymous,
      visibility: visibilityPrivate ? "private" : "public",
      status: isActive ? "active" : "inactive",
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      questions,
    } as const;

    const res = await createSurvey(input as any);
    if (!res.ok) {
      toast({ title: "Failed to create", description: res.error || "Could not create survey/poll.", variant: "destructive" });
      return;
    }
    toast({ title: "Created", description: `Survey created successfully.` });
    navigate("/polls");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Poll & Survey Builder</h1>
        <p className="text-muted-foreground mt-1">Create polls or surveys with advanced questions and visibility controls.</p>
      </div>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle>General Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Customer Feedback Survey" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="poll">Poll</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description / Instructions (optional)</label>
            <textarea
              className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="We’d love your feedback. This should only take 2 minutes."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Listing Association (optional)</label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm w-full"
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
              >
                <option value="">{role === 'superadmin' ? 'Global (no listing)' : 'Select listing…'}</option>
                {myListings.map((l) => (
                  <option key={l.id} value={String(l.id)}>{l.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date / Time (optional)</label>
              <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Visibility</div>
                <div className="text-xs text-muted-foreground">Public (off) / Private (on)</div>
              </div>
              <Switch checked={visibilityPrivate} onCheckedChange={setVisibilityPrivate} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Anonymous Responses Allowed?</div>
                <div className="text-xs text-muted-foreground">Off = require identity</div>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Active Status</div>
                <div className="text-xs text-muted-foreground">Active (on) / Inactive (off)</div>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Add multiple questions with customizable types.</p>
            <Button type="button" variant="secondary" onClick={addQuestion}>Add Question</Button>
          </div>
          <div className="space-y-4">
            {questions.map((q, idx) => renderQuestionEditor(q, idx))}
            {questions.length === 0 && (
              <div className="text-sm text-muted-foreground">No questions yet. Click "Add Question" to begin.</div>
            )}
          </div>
          <div className="pt-2">
            <Button onClick={onSubmit}>Create {type === 'poll' ? 'Poll' : 'Survey'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
