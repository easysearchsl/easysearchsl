import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { listMySurveys, getSurveyResponsesCount, getSurveyResponses, deleteSurvey, updateSurveyStatus, getSurveyWithQuestions } from "@/lib/surveys";
import type { Survey, SurveyQuestion, SurveyResponse } from "@/types/surveys";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { supabase } from "@/lib/supabase";

export default function Polls() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Inline creation form removed; creation happens via SurveyBuilder page

  // DB-backed surveys/polls
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [respCounts, setRespCounts] = useState<Record<string, number>>({});
  const [analytics, setAnalytics] = useState<
    | null
    | {
        survey: Survey;
        questions: SurveyQuestion[];
        perQuestion: Array<
          | { kind: "counts"; question: SurveyQuestion; total: number; byOption: { label: string; count: number; pct: number }[] }
          | { kind: "rating"; question: SurveyQuestion; avg: number; total: number }
        >;
      }
  >(null);

  // Removed local polls state and loaders

  // Load surveys from DB for current user (Supabase auth)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const sbId = data?.user?.id || null;
      if (!sbId) {
        if (mounted) {
          setSurveys([]);
          setRespCounts({});
        }
        return;
      }
      const rows = await listMySurveys(sbId as any);
      if (mounted) setSurveys(rows);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Load response counts per survey
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        surveys.map(async (s) => [s.id, await getSurveyResponsesCount(s.id)] as const)
      );
      if (!cancelled) setRespCounts(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [surveys]);

  // Removed inline local poll create handlers; use SurveyBuilder via buttons

  // CSV export utility
  const escapeCSV = (v: string) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  const exportSurveyCSV = async (s: Survey) => {
    const responses = await getSurveyResponses(s.id);
    const headers = ["id", "created_at", "user_id", "answers"];
    const lines = [headers.join(",")];
    for (const r of responses) {
      const row = [
        escapeCSV(String(r.id)),
        escapeCSV(String(r.created_at)),
        escapeCSV(String(r.user_id || "")),
        escapeCSV(JSON.stringify(r.answers || {})),
      ];
      lines.push(row.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = s.title.replace(/[^a-z0-9_-]+/gi, "-");
    a.href = url;
    a.download = `${safeTitle}-${s.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reloadSurveys = async () => {
    const { data } = await supabase.auth.getUser();
    const sbId = data?.user?.id || null;
    if (!sbId) return;
    const rows = await listMySurveys(sbId as any);
    setSurveys(rows);
  };

  const onToggleSurveyStatus = async (s: Survey) => {
    const newStatus = s.status === "active" ? "inactive" : "active";
    const res = await updateSurveyStatus(s.id, newStatus);
    if (!res.ok) {
      toast({ title: "Failed", description: res.error || "Could not update status.", variant: "destructive" });
      return;
    }
    toast({ title: "Updated", description: `Survey is now ${newStatus}.` });
    reloadSurveys();
  };

  const onDeleteSurvey = async (s: Survey) => {
    const ok = window.confirm("Delete this survey? This cannot be undone.");
    if (!ok) return;
    const res = await deleteSurvey(s.id);
    if (!res.ok) {
      toast({ title: "Failed", description: res.error || "Could not delete.", variant: "destructive" });
      return;
    }
    toast({ title: "Deleted", description: s.title });
    reloadSurveys();
  };

  const computeAnalytics = (
    questions: SurveyQuestion[],
    responses: SurveyResponse[]
  ): {
    perQuestion: Array<
      | { kind: "counts"; question: SurveyQuestion; total: number; byOption: { label: string; count: number; pct: number }[] }
      | { kind: "rating"; question: SurveyQuestion; avg: number; total: number }
    >;
  } => {
    const perQuestion: Array<any> = [];
    for (const q of questions) {
      const qid = String((q as any).id);
      const answers = responses.map((r) => (r.answers ? r.answers[qid] : undefined)).filter((v) => v !== undefined && v !== null);
      if (q.question_type === "multiple_choice" || q.question_type === "dropdown") {
        const options: string[] = Array.isArray(q.options) ? (q.options as any) : (Array.isArray((q as any).options?.columns) ? (q as any).options.columns : []);
        const counts: Record<string, number> = {};
        for (const opt of options) counts[opt] = 0;
        for (const a of answers as any[]) {
          const v = String(a);
          counts[v] = (counts[v] || 0) + 1;
        }
        const total = answers.length;
        const byOption = Object.entries(counts).map(([label, count]) => ({ label, count, pct: total ? Math.round((count / total) * 100) : 0 }));
        perQuestion.push({ kind: "counts", question: q, total, byOption });
      } else if (q.question_type === "checkboxes") {
        const options: string[] = Array.isArray(q.options) ? (q.options as any) : [];
        const counts: Record<string, number> = {};
        for (const opt of options) counts[opt] = 0;
        for (const a of answers as any[]) {
          const arr = Array.isArray(a) ? a : [];
          for (const v of arr) counts[String(v)] = (counts[String(v)] || 0) + 1;
        }
        const total = answers.length;
        const byOption = Object.entries(counts).map(([label, count]) => ({ label, count, pct: total ? Math.round((count / total) * 100) : 0 }));
        perQuestion.push({ kind: "counts", question: q, total, byOption });
      } else if (q.question_type === "rating" || q.question_type === "linear_scale") {
        const nums = (answers as any[]).map((v) => Number(v)).filter((n) => !isNaN(n));
        const total = nums.length;
        const avg = total ? Number((nums.reduce((a, b) => a + b, 0) / total).toFixed(2)) : 0;
        perQuestion.push({ kind: "rating", question: q, avg, total });
      } else {
        // skip analytics for free text
      }
    }
    return { perQuestion };
  };

  const onViewAnalytics = async (s: Survey) => {
    const detail = await getSurveyWithQuestions(s.id);
    if (!detail) {
      setAnalytics(null);
      toast({ title: "No data", description: "Could not load survey questions.", variant: "destructive" });
      return;
    }
    const responses = await getSurveyResponses(s.id);
    const result = computeAnalytics(detail.questions, responses);
    setAnalytics({ survey: detail.survey, questions: detail.questions, perQuestion: result.perQuestion });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Polls & Surveys</h1>
          <p className="text-muted-foreground mt-1">Create and manage polls and surveys. Monitor responses, toggle status, export results, and more.</p>
        </div>
        <div className="shrink-0 flex gap-2">
          <Link to="/surveys/new?type=poll">
            <Button variant="secondary">Create Poll</Button>
          </Link>
          <Link to="/surveys/new?type=survey">
            <Button>Create Survey</Button>
          </Link>
        </div>
      </div>

      {/* DB-backed surveys/polls */}
      <Card>
        <CardHeader>
          <CardTitle>My Surveys & Polls (Database)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Visibility</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Responses</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.type}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.visibility}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.status}</TableCell>
                  <TableCell className="hidden md:table-cell">{respCounts[s.id] ?? 0}</TableCell>
                  <TableCell className="hidden lg:table-cell">{new Date(s.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => onToggleSurveyStatus(s)}>
                      {s.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onViewAnalytics(s)}>
                      Analytics
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportSurveyCSV(s)}>
                      Export CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDeleteSurvey(s)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {surveys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="py-10 text-center text-sm text-muted-foreground">No surveys or polls yet.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics: {analytics.survey.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {analytics.perQuestion.map((entry, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-sm font-medium">Q{idx + 1}. {entry.question.question_text}</div>
                {entry.kind === "counts" ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={entry.byOption}>
                        <XAxis dataKey="label" hide={false} tick={{ fontSize: 12 }} interval={0} angle={0} height={40} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value: any, name: any) => [value, name]} />
                        <Bar dataKey="count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="text-xs text-muted-foreground mt-1">Total responses: {entry.total}</div>
                  </div>
                ) : (
                  <div className="text-sm">Average: <span className="font-semibold">{entry.avg}</span> ({entry.total} responses)</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Inline creation form removed per requirement; use SurveyBuilder via Create buttons above */}
    </div>
  );
}
