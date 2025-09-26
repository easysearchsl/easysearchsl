import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getSurveyWithQuestions, submitSurveyResponse } from "@/lib/surveys";
import type { Survey, SurveyQuestion, UUID } from "@/types/surveys";

export default function SurveyResponse() {
  const { id } = useParams<{ id: string }>();
  const surveyId = id as UUID;
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = surveyId ? await getSurveyWithQuestions(surveyId) : null;
      if (mounted) {
        if (res) {
          setSurvey(res.survey);
          setQuestions(res.questions || []);
        } else {
          setSurvey(null);
          setQuestions([]);
        }
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [surveyId]);

  const isExpired = useMemo(() => {
    if (!survey?.expires_at) return false;
    try {
      return new Date(survey.expires_at).getTime() < Date.now();
    } catch {
      return false;
    }
  }, [survey]);

  const setAnswer = (qid: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const validate = () => {
    if (!questions || questions.length === 0) return false;
    const hasAny = Object.keys(answers || {}).length > 0;
    if (!hasAny) {
      toast({ title: "Please answer at least one question." });
      return false;
    }
    // Basic bounds check for scales
    for (const q of questions) {
      const qid = q.id as string;
      const val = (answers as any)[qid];
      if ((q.question_type === 'rating' || q.question_type === 'linear_scale') && val != null && val !== '') {
        const min = (q.min_scale ?? 1) as number;
        const max = (q.max_scale ?? 5) as number;
        if (typeof val !== 'number' || val < min || val > max) {
          toast({ title: `Answer for "${q.question_text}" must be between ${min} and ${max}.`, variant: 'destructive' });
          return false;
        }
      }
    }
    return true;
  };

  const onSubmit = async () => {
    if (!survey) return;
    if (questions.length === 0) {
      toast({ title: "Nothing to submit", description: "No questions found." });
      return;
    }
    if (!validate()) return;
    setSubmitting(true);
    const { ok, error } = await submitSurveyResponse(survey.id, answers, user?.id || null);
    setSubmitting(false);
    if (ok) {
      toast({ title: "Response submitted" });
      // Optionally clear or keep answers
      setAnswers({});
      navigate('/surveys');
    } else {
      toast({ title: "Submission failed", description: error || "Unknown error", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Loading survey...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Survey not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This survey may be unavailable or Supabase is not configured.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{survey.title}</h1>
        {survey.description ? (
          <p className="text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: survey.description }} />
        ) : null}
        {isExpired ? (
          <p className="text-sm text-destructive mt-2">This {survey.type} has expired and may not accept responses.</p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{survey.type === 'poll' ? 'Poll' : 'Survey'} Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q) => {
            const qid = q.id as string;
            const qType = q.question_type;
            const opts = q.options as any;

            return (
              <div key={qid} className="space-y-2">
                <Label className="text-base font-medium">{q.question_text}</Label>

                {qType === 'short_answer' && (
                  <Input
                    value={answers[qid] ?? ''}
                    onChange={(e) => setAnswer(qid, e.target.value)}
                    placeholder="Your answer"
                  />
                )}

                {qType === 'long_answer' && (
                  <Textarea
                    value={answers[qid] ?? ''}
                    onChange={(e) => setAnswer(qid, e.target.value)}
                    placeholder="Your answer"
                    rows={4}
                  />
                )}

                {qType === 'multiple_choice' && Array.isArray(opts) && (
                  <RadioGroup
                    value={answers[qid] ?? ''}
                    onValueChange={(val) => setAnswer(qid, val)}
                  >
                    {opts.map((opt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <RadioGroupItem id={`${qid}-${idx}`} value={opt} />
                        <Label htmlFor={`${qid}-${idx}`}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {qType === 'dropdown' && Array.isArray(opts) && (
                  <Select
                    value={(answers[qid] as string) ?? undefined}
                    onValueChange={(val) => setAnswer(qid, val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.map((opt: string, idx: number) => (
                        <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {qType === 'checkboxes' && Array.isArray(opts) && (
                  <div className="space-y-2">
                    {opts.map((opt: string, idx: number) => {
                      const current: string[] = Array.isArray(answers[qid]) ? answers[qid] : [];
                      const checked = current.includes(opt);
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <Checkbox
                            id={`${qid}-chk-${idx}`}
                            checked={checked}
                            onCheckedChange={(isChecked) => {
                              const curr: string[] = Array.isArray(answers[qid]) ? answers[qid] : [];
                              const next = isChecked ? Array.from(new Set([...curr, opt])) : curr.filter((v) => v !== opt);
                              setAnswer(qid, next);
                            }}
                          />
                          <Label htmlFor={`${qid}-chk-${idx}`}>{opt}</Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(qType === 'rating' || qType === 'linear_scale') && (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      className="w-24"
                      min={(q.min_scale ?? 1) as number}
                      max={(q.max_scale ?? 5) as number}
                      value={answers[qid] ?? ''}
                      onChange={(e) => setAnswer(qid, Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">
                      Range: {q.min_scale ?? 1} - {q.max_scale ?? 5}
                    </span>
                  </div>
                )}

                {qType === 'multiple_choice_grid' && opts && Array.isArray(opts.rows) && Array.isArray(opts.columns) && (
                  <div className="space-y-3">
                    {opts.rows.map((row: string, rIdx: number) => (
                      <div key={rIdx} className="space-y-1">
                        <div className="text-sm font-medium">{row}</div>
                        <RadioGroup
                          value={(answers[qid]?.[row] as string) ?? ''}
                          onValueChange={(val) => setAnswer(qid, { ...(answers[qid] || {}), [row]: val })}
                          className="grid md:grid-cols-3 gap-2"
                        >
                          {opts.columns.map((col: string, cIdx: number) => (
                            <div key={cIdx} className="flex items-center gap-2">
                              <RadioGroupItem id={`${qid}-r${rIdx}-c${cIdx}`} value={col} />
                              <Label htmlFor={`${qid}-r${rIdx}-c${cIdx}`}>{col}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                )}

                {qType === 'checkbox_grid' && opts && Array.isArray(opts.rows) && Array.isArray(opts.columns) && (
                  <div className="space-y-3">
                    {opts.rows.map((row: string, rIdx: number) => (
                      <div key={rIdx} className="space-y-1">
                        <div className="text-sm font-medium">{row}</div>
                        <div className="grid md:grid-cols-3 gap-2">
                          {opts.columns.map((col: string, cIdx: number) => {
                            const currRow: string[] = Array.isArray(answers[qid]?.[row]) ? answers[qid][row] : [];
                            const checked = currRow.includes(col);
                            return (
                              <div key={cIdx} className="flex items-center gap-2">
                                <Checkbox
                                  id={`${qid}-r${rIdx}-c${cIdx}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const rowVals: string[] = Array.isArray(answers[qid]?.[row]) ? answers[qid][row] : [];
                                    const next = isChecked ? Array.from(new Set([...rowVals, col])) : rowVals.filter((v) => v !== col);
                                    setAnswer(qid, { ...(answers[qid] || {}), [row]: next });
                                  }}
                                />
                                <Label htmlFor={`${qid}-r${rIdx}-c${cIdx}`}>{col}</Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2">
            <Button onClick={onSubmit} disabled={submitting || isExpired}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
