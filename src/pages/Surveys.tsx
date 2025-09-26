import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPublicActiveSurveys } from "@/lib/surveys";
import type { Survey } from "@/types/surveys";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function Surveys() {
  const { data, isLoading, refetch } = useQuery<Survey[]>({
    queryKey: ["publicSurveys"],
    queryFn: listPublicActiveSurveys,
  });

  useEffect(() => {
    // auto refetch when mounting to ensure fresh list
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Loading surveys...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const surveys = data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Surveys & Polls</h1>
        <p className="text-muted-foreground mt-2">Browse active public surveys and polls. Click to participate.</p>
      </div>

      {surveys.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No public surveys available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Check back later for new surveys and polls.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {surveys.map((s) => {
            const expiresSoon = s.expires_at ? new Date(s.expires_at).getTime() < Date.now() : false;
            return (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{s.title}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        Type: {s.type} • {s.visibility}
                        {s.expires_at ? ` • Expires ${formatDistanceToNow(new Date(s.expires_at), { addSuffix: true })}` : ""}
                      </div>
                    </div>
                    <Button asChild>
                      <Link to={`/surveys/${s.id}`}>Take {s.type === "poll" ? "Poll" : "Survey"}</Link>
                    </Button>
                  </div>
                </CardHeader>
                {s.description ? (
                  <CardContent>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.description || "" }} />
                  </CardContent>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
